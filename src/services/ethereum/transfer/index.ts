import { BigNumber } from 'bignumber.js';
import fetch from 'isomorphic-fetch';
import {
  HancockSignResponse,
  HancockTransferRequest,
  InitialHancockConfig,
} from '../../hancock.model';
import {
  HancockAdaptInvokeResponse,
  HancockInvokeOptions,
} from '../../hancock.model';
import { checkStatus, errorHandler } from '../common';
import { hancockFormatParameterError,
   hancockInvalidParameterError, hancockNoKeyNorProviderError } from '../error';
import { HancockEthereumSocket } from '../socket';
import { HancockEthereumTransactionClient } from '../transaction';
import { error, isAddress, isAddressAny, isEmpty, isEmptyAny, normalizeAddress } from '../utils';

export class HancockEthereumTransferClient {

  private adapterApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(private config: InitialHancockConfig, private transactionClient: HancockEthereumTransactionClient) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
    this.brokerBaseUrl = `${config.broker.host}:${config.broker.port}${config.broker.base}`;
  }

  public async getBalance(address: string): Promise<BigNumber> {

    if (isEmpty(address)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(address)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    address = normalizeAddress(address);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.balance}`.replace(/__ADDRESS__/, address);

    return fetch(url)
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
    )
      .then((resBody: any) => {
        return new BigNumber(resBody.data.balance);
      });
  }

  public subscribeToTransfer(addresses: string[] = [], consumer: string = ''): HancockEthereumSocket {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`
      .replace(/__ADDRESS__/, '')
      .replace(/__SENDER__/, '')
      .replace(/__CONSUMER__/, consumer);

    const hancockSocket = new HancockEthereumSocket(url, consumer);
    hancockSocket.on('ready', () => {
      hancockSocket.addTransfer(addresses);
    });

    return hancockSocket;

  }

  public async transfer(from: string, to: string, value: string, options: HancockInvokeOptions = {}, data: string = ''): Promise<HancockSignResponse> {

    if (isEmptyAny(to, from)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(to, from)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(error(hancockNoKeyNorProviderError));
    }

    return this
      .adaptTransfer(from, to, value, data)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionClient.signTransactionAndSend(resBody, options);

      });

  }

  private async adaptTransfer(from: string, to: string, value: string, data: string): Promise<HancockAdaptInvokeResponse> {

    if (isEmptyAny(from, to)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(from, to)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    from = normalizeAddress(from);
    to = normalizeAddress(to);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.transfer}`;
    const body: HancockTransferRequest = {
      from,
      to,
      value,
      data,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
    );
  }

}
