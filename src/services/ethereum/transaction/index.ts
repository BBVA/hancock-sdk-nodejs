import fetch from 'isomorphic-fetch';
import {
  HancockSendSignedTxRequest,
  HancockSendSignedTxResponse,
  HancockSignRequest,
  HancockSignResponse,
  InitialHancockConfig,
} from '../../hancock.model';
import {
  HancockCallBackOptions,
} from '../../hancock.model';
import {
  HancockAdaptInvokeResponse,
  HancockInvokeOptions,
  HancockSendTxRequest,
  HancockSendTxResponse,
} from '../../hancock.model';
import { checkStatus, errorHandler } from '../common';
import {
  signTx,
} from '../signer';
import { EthereumRawTransaction } from '../signer';
import { HancockEthereumSocket } from '../socket';

export class HancockEthereumTransactionClient {

  private walletApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(private config: InitialHancockConfig) {
    this.walletApiBaseUrl = `${config.wallet.host}:${config.wallet.port}${config.wallet.base}`;
    this.brokerBaseUrl = `${config.broker.host}:${config.broker.port}${config.broker.base}`;
  }

  public async send(tx: any): Promise<HancockSendTxResponse> {

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
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
    );

  }

  public async sendSigned(tx: any, requestId?: string): Promise<HancockSendSignedTxResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.sendSignedTx}`;
    const body: HancockSendSignedTxRequest = {
      tx,
    };

    let headers: any = {
      'Content-Type': 'application/json',
    };

    headers = !requestId ? headers : {
      ...headers,
      'vnd-hancock-request-id': requestId,
    };

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
    );

  }

  public async sendToSignProvider(rawTx: any, provider: string, callback?: HancockCallBackOptions): Promise<HancockSignResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.signTx}`;
    let body: HancockSignRequest = {
      rawTx,
      provider,
    };

    let headers: any = {
      'Content-Type': 'application/json',
    };

    if (callback) {
      headers = {
        ...headers,
        'vnd-hancock-request-id' : callback.requestId,
      };
      body = {
        ...body,
        backUrl : callback.backUrl,
      };
    }

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
    );

  }

  public sign(rawTx: EthereumRawTransaction | string, privateKey: string): string {

    if (typeof rawTx === 'string') {
      rawTx = JSON.parse(rawTx) as EthereumRawTransaction;
    }

    return signTx(rawTx, privateKey);
  }

  public async signAndSend(resBody: HancockAdaptInvokeResponse, options: HancockInvokeOptions): Promise<HancockSignResponse> {

    if (options.signProvider) {

      return options.callback ?
        this.sendToSignProvider(resBody.data, options.signProvider, options.callback) :
        this.sendToSignProvider(resBody.data, options.signProvider);

    }

    if (options.privateKey) {

      const tx: string = this.sign(resBody.data, options.privateKey);
      return this.sendSigned(tx);

    }

    return this.send(resBody.data);

  }

  public subscribe(addresses: string[] = [], consumer: string = ''): HancockEthereumSocket {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`
      .replace(/__ADDRESS__/, '')
      .replace(/__SENDER__/, '')
      .replace(/__CONSUMER__/, consumer);

    const hancockSocket = new HancockEthereumSocket(url, consumer);
    hancockSocket.on('ready', () => {
      hancockSocket.addTransaction(addresses);
    });

    return hancockSocket;

  }

}
