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
  HancockSendSignedTxResponse
} from "../hancock.model";
import { HancockEthereumEventEmitter } from './model';
import { HancockClient } from '../hancock.model';
import { signTx, generateWallet } from './signer';
import { EthereumWallet, EthereumRawTransaction } from './signer';


export class HancockEthereumClient implements HancockClient {

  private config: HancockConfig;
  private adapterApiBaseUrl: string;
  private walletApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(cfg: HancockConfig) {
    this.config = { ...config as HancockConfig, ...cfg };
    debugger

    this.adapterApiBaseUrl = `${this.config.adapter.host}:${this.config.adapter.port}${this.config.adapter.base}`;
    this.walletApiBaseUrl = `${this.config.wallet.host}:${this.config.wallet.port}${this.config.wallet.base}`;
    this.brokerBaseUrl = `${this.config.broker.host}:${this.config.broker.port}${this.config.broker.base}`;
  }

  public async invokeSmartContract(contractAddress: string, method: string, params: string[], from: string, privateKey?: string, signProvider?: string): Promise<HancockSignResponse> {

    if (!signProvider && !privateKey) {
      return Promise.reject('No key nor provider');
    }

    return this
      .adaptInvokeSmartContract(contractAddress, method, params, from)
      .then((resBody: any) => {

        if (signProvider) {

          return this.sendTransactionToSign(resBody.data, signProvider);

        } 
        
        if (privateKey) {

          return Promise
            .resolve(this.signTransaction(resBody.data, privateKey))
            .then((tx: string) => this.sendSignedTransaction(tx));

        }

        return resBody;

      });

  }

  public async adaptInvokeSmartContract(contractAddress: string, method: string, params: string[], from: string): Promise<HancockSignResponse> {

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`.replace(/__ADDRESS__/, contractAddress);
    const body: HancockInvokeRequest = {
      method,
      from,
      params,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(this.checkStatus, this.errorHandler)
      .then((resBody: any) => resBody);

  }

  public generateWallet(): EthereumWallet {
    return generateWallet();
  }

  public signTransaction(rawTx: EthereumRawTransaction, privateKey: string): string {
    return signTx(rawTx, privateKey);
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
      .then(this.checkStatus, this.errorHandler);

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
      .then(this.checkStatus, this.errorHandler);

  }

  public subscribeSmartContractEvents(contractAddress: string, sender: string = ''): HancockEthereumEventEmitter {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`.replace(/__ADDRESS__/, contractAddress).replace(/__SENDER__/, sender);
    const bus: HancockEthereumEventEmitter = new EventEmitter();

    try {

      const ws = new WebSocket(url);

      function onWebSocketOpen() {
        console.info('hancock socket connected')
      }

      function onWebSocketMessage(msg: any) {
        const data: any = JSON.parse(msg.data);
        bus.emit(data.kind, data);
      }

      function onWebSocketError(e: any) {
        bus.emit('error', e);
      }

      if (process.browser) {

        ws.addEventListener('open', onWebSocketOpen);
        ws.addEventListener('error', onWebSocketError);
        ws.addEventListener('message', onWebSocketMessage);

      } else {

        ws.on('open', onWebSocketError);
        ws.on('error', onWebSocketError);
        ws.on('message', onWebSocketMessage);

      }

      (bus as any).closeSocket = () => ws.close();

    } catch (e) {

      Promise.resolve().then(() => { bus.emit('error', '' + e); });

    }

    return bus;

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