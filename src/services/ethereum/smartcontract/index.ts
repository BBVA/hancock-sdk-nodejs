import fetch from 'isomorphic-fetch';
import {checkStatus, error, errorHandler, SupportedPlatforms} from '../../common';
import {
  hancockDeployContractError,
  hancockFormatParameterError,
  hancockInvalidParameterError, hancockNoKeyNorProviderError,
} from '../../error';
import {
  CONSUMER_EVENT_KINDS, DltAddress, HancockAdaptDeployResponse, HancockAdaptInvokeAbiRequest, HancockAdaptInvokeRequest,
  HancockCallResponse, HancockContractInstance, HancockDeployRequest,
  HancockEvent,
  HancockInvokeOptions, HancockRegisterResponse,
  HancockSignResponse,
  HancockTransactionEventBody,
  HancockTxResponse,
  InitialHancockConfig,
} from '../../hancock.model';
import {
  HancockAdaptInvokeResponse,
  HancockCallRequest,
  HancockInvokeAction,
  HancockRegisterRequest,
} from '../../hancock.model';
import {
  EthereumAbi,
  EthereumAddress,
} from '../model';
import {HancockEthereumSocket} from '../socket';
import {HancockEthereumTransactionService} from '../transaction';
import {isAddress, isEmptyAny} from '../utils';

/**
 * [[include:HancockEthereumSmartContractService.md]]
 */
export class HancockEthereumSmartContractService {

  private adapterApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(private config: InitialHancockConfig, private transactionService: HancockEthereumTransactionService) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
    this.brokerBaseUrl = `${config.broker.host}:${config.broker.port}${config.broker.base}`;
  }

  public async deploy(
    from: EthereumAddress, options: HancockInvokeOptions = {},
    urlBase: string, constructorName: string, constructorParams: string[] = [],
  ): Promise<HancockTransactionEventBody> {

    return new Promise<HancockTransactionEventBody>(async (resolve, reject) => {

      if (!options.signProvider && !options.privateKey) {
        reject(error(hancockNoKeyNorProviderError));
      }
      if (!isAddress(from)) {
        reject(error(hancockFormatParameterError));
      }

      let transactionId: string = '';

      const brokerUrl: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`
        .replace(/__DLT__/, SupportedPlatforms.ethereum)
        .replace(/__ADDRESS__/, '')
        .replace(/__SENDER__/, '')
        .replace(/__CONSUMER__/, '');

      const hancockSocket = new HancockEthereumSocket(brokerUrl);
      hancockSocket.on('ready', () => {
        hancockSocket.watchContractDeployment([from]);
        hancockSocket.on(CONSUMER_EVENT_KINDS.SmartContractDeployment, async (data: HancockEvent) => {
          if (data.body.transactionId === transactionId) {
            hancockSocket.closeSocket();
            const bodyEvent: HancockTransactionEventBody = (data.body as HancockTransactionEventBody);
            if (bodyEvent.newContractAddress) {
              resolve(bodyEvent);
            } else {
              reject(error(hancockDeployContractError));
            }
          }
        });
      });
      hancockSocket.on(CONSUMER_EVENT_KINDS.Error, (err) => {
        hancockSocket.closeSocket();
        reject(error(err));
      });

      try {

        const hancockAdaptResponse: HancockAdaptDeployResponse = await this._adaptDeploy(from, urlBase, constructorName, constructorParams);

        const hancockSignResponse: HancockTxResponse = await this.transactionService.signAndSend(hancockAdaptResponse.data, options);
        transactionId = (hancockSignResponse.transactionHash) ? hancockSignResponse.transactionHash : '';

      } catch (err) {
        reject(error(err));
      }
    });
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

        return this.transactionService.signAndSend(resBody.data, options);

      });

  }

  /**
   * Makes an invocation to an smart contract method with abi.
   * Invocations are used to call smart contract methods that writes information in the blockchain consuming gas
   * @param contractAddressOrAlias Address or alias of the smart contract registered in Hancock
   * @param method The name of the method to call
   * @param params An array of arguments passed to the method
   * @param from The address of the account doing the call
   * @param options Configuration of how the transaction will be send to the network
   * @param abi raw in json format
   * @returns The returned value from the smart contract method
   */
  public async invokeAbi(
    contractAddressOrAlias: string, method: string, params: string[], from: string, options: HancockInvokeOptions = {}, abi: any,
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

    const action: HancockInvokeAction = 'send';

    return this
      .adaptInvokeAbi(contractAddressOrAlias, method, params, from, action, abi)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionService.signAndSend(resBody.data, options);

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

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, contractAddressOrAlias);

    const body: HancockCallRequest = {
      method,
      from,
      params,
      action: 'call',
    };

    return fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );

  }

  /**
   * Makes an invocation to an smart contract method with abi.
   * Invocations are used to call smart contract methods that writes information in the blockchain consuming gas
   * @param contractAddressOrAlias Address or alias of the smart contract registered in Hancock
   * @param method The name of the method to call
   * @param params An array of arguments passed to the method
   * @param from The address of the account doing the call
   * @param abi raw in json format
   * @returns The returned value from the smart contract method
   */
  public async callAbi(
    contractAddressOrAlias: string, method: string, params: string[], from: string, abi: any,
  ): Promise<HancockCallResponse> {

    if (isEmptyAny(contractAddressOrAlias, from, method)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(from)) {
      return Promise.reject(error(hancockFormatParameterError));
    }

    const action: HancockInvokeAction = 'call';

    return this
      .adaptInvokeAbi(contractAddressOrAlias, method, params, from, action, abi)
      .then((resBody: HancockCallResponse) => {
        return resBody;
      });
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

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.register}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum);

    const body: HancockRegisterRequest = {
      address,
      alias,
      abi,
    };

    return fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );

  }

  /**
   * Create a websocket subscription to watch transactions of type "smart contract events" in the network
   * @param contracts An array of address of smart contracts that will be added to the watch list
   * @param consumer A consumer plugin previously configured in hancock that will handle each received event
   * @returns An event emmiter that will fire the watched "smart contract events" events
   */
  public subscribeToEvents(contracts: string[] = [], consumer: string = ''): HancockEthereumSocket {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS__/, '')
      .replace(/__SENDER__/, '')
      .replace(/__CONSUMER__/, consumer);

    const hancockSocket = new HancockEthereumSocket(url, consumer);
    hancockSocket.on('ready', () => {
      hancockSocket.watchContractEvent(contracts);
    });

    return hancockSocket;

  }

  /**
   * Create a websocket subscription to watch transactions of type "smart contract transactions" in the network
   * @param contracts An array of address of smart contracts that will be added to the watch list
   * @param consumer A consumer plugin previously configured in hancock that will handle each received event
   * @returns An event emmiter that will fire the watched "smart contract transactions" events
   */
  public subscribeToTransactions(contracts: string[] = [], consumer: string = ''): HancockEthereumSocket {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS__/, '')
      .replace(/__SENDER__/, '')
      .replace(/__CONSUMER__/, consumer);

    const hancockSocket = new HancockEthereumSocket(url, consumer);
    hancockSocket.on('ready', () => {
      hancockSocket.watchContractTransaction(contracts);
    });

    return hancockSocket;

  }

  /**
   * Get the list of all contracts registered in Hancock
   * @returns The list of all contracts registered in Hancock
   */
  public async getAllContracts(): Promise<HancockContractInstance[]> {

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.findAll}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum);

    return fetch(url)
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      )
      .then((resBody: any) => {
        return resBody.data.list;
      });
  }

  private async _adaptDeploy(
    from: EthereumAddress, urlBase: string, constructorName: string, constructorParams: string[] = [],
  ): Promise<HancockAdaptDeployResponse> {

    const adapterUrl: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.deploy}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum);

    const hancockAdapterRequest: HancockDeployRequest = {
      urlBase,
      from,
      method: constructorName,
      params: constructorParams,
    };

    return fetch(adapterUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(hancockAdapterRequest),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );
  }

  private async adaptInvoke(contractAddressOrAlias: string, method: string, params: string[], from: string): Promise<HancockAdaptInvokeResponse> {

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, contractAddressOrAlias);

    const body: HancockAdaptInvokeRequest = {
      method,
      from,
      params,
      action: 'send',
    };

    return fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );

  }

  private async adaptInvokeAbi(to: string, method: string, params: string[], from: string, action: HancockInvokeAction, abi: any): Promise<any> {

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invokeAbi}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum);

    const body: HancockAdaptInvokeAbiRequest = {
      method,
      from,
      params,
      action,
      to,
      abi,
    };

    return fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );

  }

}
