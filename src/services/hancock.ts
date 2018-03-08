import config from 'config';
import * as fetch from 'isomorphic-fetch';
import * as EventEmitter from 'eventemitter3';
import * as WebSocket from 'isomorphic-ws';
import { HancockInvokeRequest, HancockConfig, HancockSignResponse, HancockSignRequest } from "./hancock.model";

export default class Hancock {

  private config: HancockConfig;
  private adapterApiBaseUrl: string;
  private walletApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(cfg: HancockConfig) {
    this.config = { ...config as HancockConfig, ...cfg };

    this.adapterApiBaseUrl = `${this.config.adapter.host}:${this.config.adapter.port}${this.config.adapter.base}`;
    this.walletApiBaseUrl = `${this.config.wallet.host}:${this.config.wallet.port}${this.config.wallet.base}`;
    this.brokerBaseUrl = `${this.config.broker.host}:${this.config.broker.port}${this.config.broker.base}`;
  }

  public async invokeSmartContract(contractAddress: string, method: string, sender: string, params: string[]): Promise<HancockSignResponse> {

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.invoke}`.replace(/__ADDRESS__/, contractAddress);
    const body: HancockInvokeRequest = {
      method,
      from: sender,
      params,
    };

    return fetch(url, { method: 'POST', body: JSON.stringify(body) })
      .then(this.checkStatus, this.errorHandler)
      .then((resBody: any) => this.signTransaction(resBody.data));

  }

  public async signTransaction(rawTx: any, provider: string = config.app.contract.signer): Promise<HancockSignResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.sign}`;
    const body: HancockSignRequest = {
      rawTx,
      provider,
    };

    return fetch(url, { method: 'POST', body: JSON.stringify(body) })
      .then(this.checkStatus, this.errorHandler);

  }

  public subscribeSmartContractEvents(contractAddress: string, sender: string = ''): EventEmitter {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`.replace(/__ADDRESS__/, contractAddress).replace(/__SENDER__/, sender);
    const bus: EventEmitter = new EventEmitter();

    const ws = new WebSocket(url);

    ws.on('open', () => console.info('hancock socket connected'));
    ws.on('close', () => console.log('disconnected'));
    ws.on('error', (e: any) => bus.emit('error', e));

    ws.on('message', (msg: any) => {
      const data: any = JSON.parse(msg.data);
      bus.emit(data.kind, data);
    });

    bus.closeSocket = () => ws.close();

    return bus;

  }

  private checkStatus(response: any): any {
    // HTTP status code between 200 and 299
    if (!response.ok) {
      this.errorHandler(response);
    }

    return response.body;
  }

  private errorHandler(err: any) {

    console.error(err);
    throw err instanceof Error ? err : new Error(err.body.message);

  }
}