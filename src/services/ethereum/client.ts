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
  HancockBalanceResponse,
  DltAddress
} from '../hancock.model';
import { normalizeAddressOrAlias, normalizeAlias, normalizeAddress } from './utils';
import { BigNumber } from 'bignumber.js';

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

        if (options.signProvider) {

          return this.sendTransactionToSign(resBody.data, options.signProvider);

        }

        if (options.privateKey) {

          return Promise
            .resolve(this.signTransaction(resBody.data, options.privateKey))
            .then((tx: string) => this.sendSignedTransaction(tx));

        }

        return this.sendTransaction(resBody.data);

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

  public async getBalance(address:string): Promise<HancockBalanceResponse>{

    address = normalizeAddress(address);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.balance}`.replace(/__ADDRESS__/, address);

    return fetch(url)
      .then(
        (res: any) => this.checkStatus(res),
        (err: any) => this.errorHandler(err)
      )
      .then((resBody: any) => new BigNumber(resBody.data.balance));
  }

  public subscribeSmartContractEvents(contractAddressOrAlias: string, sender: string = ''): HancockEthereumEventEmitter {

    const normalizedContractAddressOrAlias: string = normalizeAddressOrAlias(contractAddressOrAlias);
    
    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`.replace(/__ADDRESS__/, normalizedContractAddressOrAlias).replace(/__SENDER__/, sender);
    const bus: HancockEthereumEventEmitter = new EventEmitter();

    try {

      const ws = new WebSocket(url);

      function onWebSocketOpen() {
        console.info('hancock socket connected')
      }

      function onWebSocketMessage(msg: any) {
        // console.info('hancock socket msg');

        try {

          const rawData: string = msg.data ? msg.data: msg          
          const data: any = JSON.parse(rawData);

          bus.emit(data.kind, data);

        } catch(e) {}

      }

      function onWebSocketError(e: any) {
        bus.emit('error', e);
      }

      if (process.browser) {

        ws.addEventListener('open', onWebSocketOpen);
        ws.addEventListener('error', onWebSocketError);
        ws.addEventListener('message', onWebSocketMessage);

      } else {

        ws.on('open', onWebSocketOpen);
        ws.on('error', onWebSocketError);
        ws.on('message', onWebSocketMessage);

      }

      (bus as any).closeSocket = () => ws.close();

    } catch (e) {

      Promise.resolve().then(() => { bus.emit('error', '' + e); });

    }

    return bus;

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
}