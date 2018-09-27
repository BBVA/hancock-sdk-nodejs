import fetch from 'isomorphic-fetch';
import { checkStatus, error, errorHandler, SupportedPlatforms } from '../../common';
import { normalizeAlias } from '../../common/utils';
import {
  hancockFormatParameterError,
  hancockInvalidParameterError, hancockNoKeyNorProviderError,
} from '../../error';
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
import { EthereumAbi } from '../model';
import { HancockEthereumSocket } from '../socket';
import { HancockEthereumTransactionClient } from '../transaction';
import { isAddress, isEmptyAny, normalizeAddress, normalizeAddressOrAlias } from '../utils';

/**
 * [[include:HancockEthereumSmartContractClient.md]]
 */
export class HancockEthereumSmartContractClient {

  private adapterApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(private config: InitialHancockConfig, private transactionClient: HancockEthereumTransactionClient) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
    this.brokerBaseUrl = `${config.broker.host}:${config.broker.port}${config.broker.base}`;
  }

  /**
   * Makes an invocation to an smart contract method.
   * Invocations are used to call smart contract methods that writes information in the blockchain consuming gas
   * @param contractAddressOrAlias Address or alias of the smart contract registered in Hancock
   * @param method The name of the method to call
   * @param params An array of arguments passed to the method
   * @param from The address of the account doing the call
   * @param options Configuration of how the transaction will be send to the network
   * @returns The returned value from the smart contract method
   */
  public async invoke(
    contractAddressOrAlias: string, method: string, params: string[], from: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    // Done in adaptInvoke
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
      .adaptInvoke(contractAddressOrAlias, method, params, from)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionClient.signAndSend(resBody.data, options);

      });

  }

  /**
   * Makes a call to an smart contract method. Calls only fetch information from blockchain so it doesn't consume gas
   * @param contractAddressOrAlias Address or alias of the smart contract registered in Hancock
   * @param method The name of the method to call
   * @param params An array of arguments passed to the method
   * @param from The address of the account doing the call
   * @returns The returned value from the smart contract method
   */
  public async call(contractAddressOrAlias: string, method: string, params: string[], from: string): Promise<HancockCallResponse> {

    if (isEmptyAny(contractAddressOrAlias, from)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(from)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, normalizedContractAddressOrAlias);

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

  /**
   * Register a new smart contract instance in Hancock
   * @param alias An alias for the smart contract
   * @param address The address of the deployed smart contract instance
   * @param abi The application binary interface (abi) of the deployed smart contract
   * @returns The result of the request
   */
  public async register(alias: string, address: DltAddress, abi: EthereumAbi): Promise<HancockRegisterResponse> {

    if (isEmptyAny(alias, address)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(address)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    alias = normalizeAlias(alias);
    address = normalizeAddress(address);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.register}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum);

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

  /**
   * Create a websocket subscription to watch transactions of type "smart contract events" in the network
   * @param addresses An array of address of smart contracts that will be added to the watch list
   * @param consumer A consumer plugin previously configured in hancock that will handle each received event
   * @returns An event emmiter that will fire the watched "smart contract events" events
   */
  public subscribe(contracts: string[] = [], consumer: string = ''): HancockEthereumSocket {

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

  private async adaptInvoke(contractAddressOrAlias: string, method: string, params: string[], from: string): Promise<HancockAdaptInvokeResponse> {

    const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`
    .replace(/__DLT__/, SupportedPlatforms.ethereum)
    .replace(/__ADDRESS_OR_ALIAS__/, normalizedContractAddressOrAlias);

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
