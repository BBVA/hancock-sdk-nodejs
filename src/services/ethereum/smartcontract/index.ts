import fetch from 'isomorphic-fetch';
import {
  HancockSignResponse,
  InitialHancockConfig,
} from '../../hancock.model';
import {
  DltAddress,
  HancockAdaptInvokeRequest,
  HancockAdaptInvokeResponse,
  HancockCallRequest,
  HancockCallResponse,
  HancockInvokeOptions,
  HancockRegisterRequest,
  HancockRegisterResponse,
} from '../../hancock.model';
import { checkStatus, errorHandler } from '../common';
import {
  hancockFormatParameterError,
  hancockInvalidParameterError, hancockNoKeyNorProviderError,
} from '../error';
import { EthereumAbi } from '../model';
import { HancockEthereumSocket } from '../socket';
import { HancockEthereumTransactionClient } from '../transaction';
import { error, isAddress, isEmptyAny, normalizeAddress, normalizeAddressOrAlias, normalizeAlias } from '../utils';

export class HancockEthereumSmartContractClient {

  private adapterApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(private config: InitialHancockConfig, private transactionClient: HancockEthereumTransactionClient) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
    this.brokerBaseUrl = `${config.broker.host}:${config.broker.port}${config.broker.base}`;
  }

  public async invokeSmartContract(
    contractAddressOrAlias: string, method: string, params: string[], from: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    // Done in adaptInvokeSmartContract
    // const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(error(hancockNoKeyNorProviderError));
    }
    if (isEmptyAny(contractAddressOrAlias, from, method)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(from)) {
      return Promise.reject(error(hancockFormatParameterError));
    }

    return this
      .adaptInvokeSmartContract(contractAddressOrAlias, method, params, from)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionClient.signTransactionAndSend(resBody, options);

      });

  }

  public async callSmartContract(contractAddressOrAlias: string, method: string, params: string[], from: string): Promise<HancockCallResponse> {

    if (isEmptyAny(contractAddressOrAlias, from)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(from)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`.replace(/__ADDRESS_OR_ALIAS__/, normalizedContractAddressOrAlias);

    const body: HancockCallRequest = {
      method,
      from,
      params,
      action: 'call',
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

  public async registerSmartContract(alias: string, address: DltAddress, abi: EthereumAbi): Promise<HancockRegisterResponse> {

    if (isEmptyAny(alias, address)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(address)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    alias = normalizeAlias(alias);
    address = normalizeAddress(address);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.register}`;
    const body: HancockRegisterRequest = {
      address,
      alias,
      abi,
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

  public subscribeToContract(contracts: string[] = [], consumer: string = ''): HancockEthereumSocket {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`
      .replace(/__ADDRESS__/, '')
      .replace(/__SENDER__/, '')
      .replace(/__CONSUMER__/, consumer);

    const hancockSocket = new HancockEthereumSocket(url, consumer);
    hancockSocket.on('ready', () => {
      hancockSocket.addContract(contracts);
    });

    return hancockSocket;

  }

  private async adaptInvokeSmartContract(contractAddressOrAlias: string, method: string, params: string[], from: string): Promise<HancockAdaptInvokeResponse> {

    const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`.replace(/__ADDRESS_OR_ALIAS__/, normalizedContractAddressOrAlias);
    const body: HancockAdaptInvokeRequest = {
      method,
      from,
      params,
      action: 'send',
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
