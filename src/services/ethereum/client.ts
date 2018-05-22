import config from 'config';
import fetch from 'isomorphic-fetch';
import EventEmitter from 'eventemitter3';
import WebSocket from 'isomorphic-ws';
import {
  HancockInvokeRequest,
  HancockConfig,
  HancockSignResponse,
  HancockSignRequest,
  HancockSendSignedTxRequest,
  HancockSendSignedTxResponse,
  InitialHancockConfig
} from "../hancock.model";
import { HancockEthereumEventEmitter, EthereumAbi } from './model';
import { HancockClient } from '../hancock.model';
import { signTx, generateWallet } from './signer';
import { EthereumWallet, EthereumRawTransaction } from './signer';
import merge from 'deepmerge';
import {
  HancockSendTxResponse,
  HancockSendTxRequest,
  HancockInvokeOptions,
  HancockAdaptInvokeResponse,
  HancockAdaptInvokeRequest,
  HancockCallRequest,
  HancockCallResponse,
  HancockRegisterResponse,
  HancockRegisterRequest,
  HancockTransferRequest,
  DltAddress
} from '../hancock.model';
import { normalizeAddressOrAlias, normalizeAlias, normalizeAddress } from './utils';
import { BigNumber } from 'bignumber.js';
import { HancockEthereumSocket } from './socket';

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

  public async invokeSmartContract(contractAddressOrAlias: string, method: string, params: string[], from: string, options: HancockInvokeOptions = {}): Promise<HancockSignResponse> {

    // Done in adaptInvokeSmartContract
    // const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject('No key nor provider');
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
      action: 'call'
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err))
      .then((resBody: any) => resBody);

  }

  public async adaptInvokeSmartContract(contractAddressOrAlias: string, method: string, params: string[], from: string): Promise<HancockAdaptInvokeResponse> {

    const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`.replace(/__ADDRESS__/, normalizedContractAddressOrAlias);
    const body: HancockAdaptInvokeRequest = {
      method,
      from,
      params,
      action: 'send'
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err))
      .then((resBody: any) => resBody);

  }

  public async sendTransaction(tx: any): Promise<HancockSendTxResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.sendTx}`;
    const body: HancockSendTxRequest = {
      tx,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err)
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
      body: JSON.stringify(body)
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err)
      );

  }

  public async sendTransactionToSign(rawTx: any, provider: string): Promise<HancockSignResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.sign}`;
    const body: HancockSignRequest = {
      rawTx,
      provider,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err)
      );

  }

  public async registerSmartContract(alias: string, address: DltAddress, abi: EthereumAbi): Promise<HancockRegisterResponse> {

    alias = normalizeAlias(alias);
    address = normalizeAddress(address);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.register}`;
    const body: HancockRegisterRequest = {
      address,
      alias,
      abi
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err)
      );

  }

  public async getBalance(address:string): Promise<BigNumber>{

    address = normalizeAddress(address);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.balance}`.replace(/__ADDRESS__/, address);

    return fetch(url)
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err)
      )
      .then((resBody: any) => new BigNumber(resBody.data.balance));
  }

  public subscribeToContract(contracts: string[]): HancockEthereumSocket {

    const normalizedAddress: string = normalizeAddressOrAlias(contracts[0]);
    
    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`.replace(/__ADDRESS__/, normalizedAddress).replace(/__SENDER__/, '');
    const bus: HancockEthereumEventEmitter = new EventEmitter();

    const ws = new WebSocket(url);
    const onOpen = function(){
      hancockSocket.addContract(contracts.slice(1,contracts.length+1))
    }

    const hancockSocket = new HancockEthereumSocket(ws, onOpen);

    return hancockSocket;

  }

  public subscribeToTransfer(addresses: string[]): HancockEthereumSocket {

    const normalizedAddress: string = normalizeAddress(addresses[0]);
    
    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`.replace(/__ADDRESS__/, '').replace(/__SENDER__/, normalizedAddress);
    const bus: HancockEthereumEventEmitter = new EventEmitter();

    const ws = new WebSocket(url);
    const onOpen = () => {
      hancockSocket.addTransfer(addresses.slice(1,addresses.length+1))
    }
    const hancockSocket = new HancockEthereumSocket(ws, onOpen);
    
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

  private async checkStatus(response: any): Promise<any> {
    // HTTP status code between 200 and 299
    if (!response.ok) {
      this.errorHandler(response);
    }

    return response.json();
  }

  private errorHandler(err: any) {

    console.error(err);
    throw err instanceof Error ? err : new Error(err.body.message);

  }

  public async transfer(from: string, to: string, value: string, options: HancockInvokeOptions = {}, data: string = ''): Promise<HancockSignResponse> {

    if (!options.signProvider && !options.privateKey) {
      return Promise.reject('No key nor provider');
    }

    return this
      .adaptTransfer(from, to, value, data)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.signAndSend(resBody, options);

      });

  }

  private async adaptTransfer(from: string, to: string, value: string, data:string): Promise<HancockAdaptInvokeResponse>{
    from = normalizeAddress(from);
    to = normalizeAddress(to);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.transfer}`;
    const body: HancockTransferRequest = {
      from,
      to,
      value,
      data
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err)
      );
  }

  private async signAndSend(resBody: HancockAdaptInvokeResponse, options: HancockInvokeOptions): Promise<HancockSignResponse>{
    if (options.signProvider) {

      return this.sendTransactionToSign(resBody.data, options.signProvider);

    }

    if (options.privateKey) {

      return Promise
        .resolve(this.signTransaction(resBody.data, options.privateKey))
        .then((tx: string) => this.sendSignedTransaction(tx));

    }

    return this.sendTransaction(resBody.data);
  }
}