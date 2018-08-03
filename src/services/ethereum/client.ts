import { BigNumber } from 'bignumber.js';
import config from 'config';
import merge from 'deepmerge';
import fetch from 'isomorphic-fetch';
import {
  HancockProtocolDecodeRequest,
  HancockProtocolDlt,
  HancockProtocolEncode,
  HancockProtocolEncodeResponse,
  HancockTokenAllowanceRequest,
  HancockTokenApproveRequest,
  HancockTokenMetadataResponse,
  HancockTokenTransferRequest,
} from '..';
import { HancockClient, HancockTokenTransferFromRequest } from '../hancock.model';
import {
  DltAddress,
  HancockAdaptInvokeRequest,
  HancockAdaptInvokeResponse,
  HancockCallRequest,
  HancockCallResponse,
  HancockInvokeOptions,
  HancockRegisterRequest,
  HancockRegisterResponse,
  HancockSendTxRequest,
  HancockSendTxResponse,
  HancockTransferRequest,
} from '../hancock.model';
import {
  HancockConfig,
  HancockProtocolAction,
  HancockProtocolDecodeResponse,
  HancockSendSignedTxRequest,
  HancockSendSignedTxResponse,
  HancockSignRequest,
  HancockSignResponse,
  HancockTokenBalanceResponse,
  HancockTokenRegisterRequest,
  HancockTokenRegisterResponse,
  InitialHancockConfig,
} from '../hancock.model';
import {HancockError, hancockErrorNoKey, numberErrorInternal, prefixApi, prefixInt } from './error';
import { EthereumAbi } from './model';
import {
  generateWallet,
  signTx,
} from './signer';
import { EthereumRawTransaction, EthereumWallet } from './signer';
import { HancockEthereumSocket } from './socket';
import { error, normalizeAddress, normalizeAddressOrAlias, normalizeAlias } from './utils';

export class HancockEthereumClient implements HancockClient {

  private config: InitialHancockConfig;
  private adapterApiBaseUrl: string;
  private walletApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(cfg: HancockConfig = {}) {

    this.config = merge(config, cfg) as InitialHancockConfig;

    this.adapterApiBaseUrl = `${this.config.adapter.host}:${this.config.adapter.port}${this.config.adapter.base}`;
    this.walletApiBaseUrl = `${this.config.wallet.host}:${this.config.wallet.port}${this.config.wallet.base}`;
    this.brokerBaseUrl = `${this.config.broker.host}:${this.config.broker.port}${this.config.broker.base}`;
  }

  public async invokeSmartContract(
    contractAddressOrAlias: string, method: string, params: string[], from: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    // Done in adaptInvokeSmartContract
    // const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(hancockErrorNoKey);
    }

    return this
      .adaptInvokeSmartContract(contractAddressOrAlias, method, params, from)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.signAndSend(resBody, options);

      });

  }

  public async callSmartContract(contractAddressOrAlias: string, method: string, params: string[], from: string): Promise<HancockCallResponse> {

    const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`.replace(/__ADDRESS__/, normalizedContractAddressOrAlias);

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
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );

  }

  public async adaptInvokeSmartContract(contractAddressOrAlias: string, method: string, params: string[], from: string): Promise<HancockAdaptInvokeResponse> {

    const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`.replace(/__ADDRESS__/, normalizedContractAddressOrAlias);
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
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );

  }

  public async sendTransaction(tx: any): Promise<HancockSendTxResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.sendTx}`;
    const body: HancockSendTxRequest = {
      tx,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );

  }

  public async sendSignedTransaction(tx: any): Promise<HancockSendSignedTxResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.sendSignedTx}`;
    const body: HancockSendSignedTxRequest = {
      tx,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );

  }

  public async sendTransactionToSign(rawTx: any, provider: string): Promise<HancockSignResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.signTx}`;
    const body: HancockSignRequest = {
      rawTx,
      provider,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );

  }

  public async registerSmartContract(alias: string, address: DltAddress, abi: EthereumAbi): Promise<HancockRegisterResponse> {

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
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );

  }

  public async tokenRegister(alias: string, address: DltAddress): Promise<HancockTokenRegisterResponse> {

    alias = normalizeAlias(alias);
    address = normalizeAddress(address);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.tokenRegister}`;
    const body: HancockTokenRegisterRequest = {
      address,
      alias,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );

  }

  public async getBalance(address: string): Promise<BigNumber> {

    address = normalizeAddress(address);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.balance}`.replace(/__ADDRESS__/, address);

    return fetch(url)
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    )
      .then((resBody: any) => {
        return new BigNumber(resBody.data.balance);
      });
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

  public generateWallet(): EthereumWallet {
    return generateWallet();
  }

  public signTransaction(rawTx: EthereumRawTransaction | string, privateKey: string): string {

    if (typeof rawTx === 'string') {
      rawTx = JSON.parse(rawTx) as EthereumRawTransaction;
    }

    return signTx(rawTx, privateKey);
  }

  public async transfer(from: string, to: string, value: string, options: HancockInvokeOptions = {}, data: string = ''): Promise<HancockSignResponse> {

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(hancockErrorNoKey);
    }

    return this
      .adaptTransfer(from, to, value, data)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.signAndSend(resBody, options);

      });

  }

  public async tokenTransfer(
    from: string, to: string, value: string, addressOrAlias: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(hancockErrorNoKey);
    }

    return this
      .adaptTokenTransfer(from, to, value, addressOrAlias)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.signAndSend(resBody, options);

      });

  }

  public async tokenTransferFrom(
    from: string, sender: string, to: string, value: string, addressOrAlias: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(hancockErrorNoKey);
    }

    return this
      .adaptTokenTransferFrom(from, sender, to, value, addressOrAlias)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.signAndSend(resBody, options);

      });

  }

  public async tokenAllowance(
    from: string, tokenOwner: string, spender: string, addressOrAlias: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(hancockErrorNoKey);
    }

    return this
      .adaptTokenAllowance(from, tokenOwner, spender, addressOrAlias)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.signAndSend(resBody, options);

      });

  }

  public async encodeProtocol(
    action: HancockProtocolAction, value: string, to: string, data: string, dlt: HancockProtocolDlt,
  ): Promise<HancockProtocolEncodeResponse> {

    to = normalizeAddress(to);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.encode}`;
    const body: HancockProtocolEncode = {
      action,
      body: {
        value,
        to,
        data,
      },
      dlt,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );
  }

  public async decodeProtocol(code: string): Promise<HancockProtocolDecodeResponse> {

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.decode}`;
    const body: HancockProtocolDecodeRequest = {
      code,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );
  }

  public async getTokenBalance(addresOrAlias: string, address: string): Promise<HancockTokenBalanceResponse> {

    address = normalizeAddress(address);
    addresOrAlias = normalizeAddressOrAlias(addresOrAlias);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.tokenBalance}`
      .replace(/__ADDRESS_OR_ALIAS__/, addresOrAlias)
      .replace(/__ADDRESS__/, address);

    return fetch(url)
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    )
      .then((resBody: any) => {
        return resBody.data;
      });
  }

  public async tokenApprove(
    from: string, spender: string, value: string, addressOrAlias: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(hancockErrorNoKey);
    }

    return this
      .adaptTokenApprove(from, spender, value, addressOrAlias)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.signAndSend(resBody, options);

      });

  }

  public async getTokenMetadata(addressOrAlias: string): Promise<HancockTokenMetadataResponse> {

    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.tokenMetadata}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);

    return fetch(url)
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    )
      .then((resBody: any) => {
        return resBody.data;
      });
  }

  private async checkStatus(response: any): Promise<any> {
    // HTTP status code between 200 and 299
    if (!response.ok) {
      this.errorHandler(response);
    }

    return response.json();
  }

  private errorHandler(err: any) {

    console.error(err);
    throw err instanceof HancockError
      ? err
      : err.body
        ? new HancockError(prefixApi, err.body.internalError, err.body.error, err.body.message, err)
        : new HancockError(prefixInt, numberErrorInternal, err.code, err.message, err);

  }

  private async adaptTransfer(from: string, to: string, value: string, data: string): Promise<HancockAdaptInvokeResponse> {

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
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );
  }

  private async adaptTokenApprove(from: string, spender: string, value: string, addressOrAlias: string): Promise<HancockAdaptInvokeResponse> {

    from = normalizeAddressOrAlias(from);
    spender = normalizeAddress(spender);
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.tokenApprove}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);
    const body: HancockTokenApproveRequest = {
      from,
      spender,
      value,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );
  }

  private async adaptTokenTransferFrom(from: string, sender: string, to: string, value: string, addressOrAlias: string): Promise<HancockAdaptInvokeResponse> {

    from = normalizeAddress(from);
    sender = normalizeAddress(sender);
    to = normalizeAddress(to);
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.tokenTransferFrom}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);
    const body: HancockTokenTransferFromRequest = {
      from,
      sender,
      to,
      value,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );
  }

  private async adaptTokenTransfer(from: string, to: string, value: string, addressOrAlias: string): Promise<HancockAdaptInvokeResponse> {

    from = normalizeAddress(from);
    to = normalizeAddress(to);
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.tokenTransfer}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);
    const body: HancockTokenTransferRequest = {
      from,
      to,
      value,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );
  }

  private async adaptTokenAllowance(from: string, tokenOwner: string, spender: string, addressOrAlias: string): Promise<HancockAdaptInvokeResponse> {

    from = normalizeAddress(from);
    tokenOwner = normalizeAddress(tokenOwner);
    spender = normalizeAddress(spender);
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.tokenAllowance}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);
    const body: HancockTokenAllowanceRequest = {
      from,
      tokenOwner,
      spender,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err),
    );
  }

  private async signAndSend(resBody: HancockAdaptInvokeResponse, options: HancockInvokeOptions): Promise<HancockSignResponse> {

    if (options.signProvider) {

      return this.sendTransactionToSign(resBody.data, options.signProvider);

    }

    if (options.privateKey) {

      const tx: string = this.signTransaction(resBody.data, options.privateKey);
      return this.sendSignedTransaction(tx);

    }

    return this.sendTransaction(resBody.data);

  }

}
