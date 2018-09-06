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
import {
  hancockFormatParameterError,
  hancockInvalidParameterError,
  hancockNoKeyNorProviderError,
} from '../error';
import { HancockEthereumSocket } from '../socket';
import { HancockEthereumTransactionClient } from '../transaction';
import { error, isAddressAny, isEmptyAny, normalizeAddress } from '../utils';

export class HancockEthereumTransferClient {

  private adapterApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(private config: InitialHancockConfig, private transactionClient: HancockEthereumTransactionClient) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
    this.brokerBaseUrl = `${config.broker.host}:${config.broker.port}${config.broker.base}`;
  }

  public async send(from: string, to: string, value: string, options: HancockInvokeOptions = {}, data: string = ''): Promise<HancockSignResponse> {

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
      .adaptSend(from, to, value, data)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionClient.signAndSend(resBody, options);

      });

  }

  public subscribe(addresses: string[] = [], consumer: string = ''): HancockEthereumSocket {

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

  private async adaptSend(from: string, to: string, value: string, data: string): Promise<HancockAdaptInvokeResponse> {

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
