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
  HancockInvokeOptions,
  HancockSendTxRequest,
  HancockSendTxResponse,
} from '../../hancock.model';
import { checkStatus, errorHandler } from '../common';
import {
  EthereumSignedTransaction, signTx,
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

  /**
   * Send a raw transaction to the ethereum network (It is assumed that the "from" address which will sign the transaction is stored in the node)
   * @param tx A raw transaction which will be sent to the network
   * @returns The result of the transaction
   */
  public async send(tx: EthereumRawTransaction): Promise<HancockSendTxResponse> {

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

  /**
   * Send a signed transaction to the ethereum network
   * @param tx A signed transaction which will be send to the network
   * @param requestId An uuid to trace the request in hancock
   * @returns The result of the transaction
   */
  public async sendSigned(tx: EthereumSignedTransaction, requestId?: string): Promise<HancockSendSignedTxResponse> {

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

  /**
   * Send a raw transaction to one of the sign providers registered in hancock
   * @param rawTx A raw transaction which will be signed by the sign provider
   * @param provider The sign provider alias which will receive the raw transaction
   * @param callback Information about callback url to get feedback of the transaction status
   * @returns The result of the request
   */
  public async sendToSignProvider(rawTx: EthereumRawTransaction, provider: string, callback?: HancockCallBackOptions): Promise<HancockSignResponse> {

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
        'vnd-hancock-request-id': callback.requestId,
      };
      body = {
        ...body,
        backUrl: callback.backUrl,
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

  /**
   * Sign a raw transaction with a given private key
   * @param rawTx A raw transaction which will be signed by the sign provider
   * @param privateKey The private key with which the raw transaction will be signed
   * @returns The signed transaction
   */
  public sign(rawTx: EthereumRawTransaction | string, privateKey: string): string {

    if (typeof rawTx === 'string') {
      rawTx = JSON.parse(rawTx) as EthereumRawTransaction;
    }

    return signTx(rawTx, privateKey);
  }

  /**
   * Sign a raw transaction with a given private key
   * @param rawTx A raw transaction which will be signed and sent to the network
   * @param options Configuration of how the transaction will be send to the network
   * @param options.privateKey The private key with which the raw transaction will be signed
   * @param options.signProvider The sign provider alias which will receive the raw transaction
   * @param options.callback Callback url to be notified once the transaction will be sent
   * @returns The result of the transaction
   */
  public async signAndSend(rawTx: EthereumRawTransaction, options: HancockInvokeOptions): Promise<HancockSignResponse> {

    if (options.signProvider) {

      return options.callback ?
        this.sendToSignProvider(rawTx, options.signProvider, options.callback) :
        this.sendToSignProvider(rawTx, options.signProvider);

    }

    if (options.privateKey) {

      const tx: string = this.sign(rawTx, options.privateKey);
      return this.sendSigned(tx);

    }

    return this.send(rawTx);

  }

  /**
   * Create a websocket subscription to watch transactions in the network
   * @param addresses An array of address that will be added to the watch list
   * @param consumer A consumer plugin previously configured in hancock that will handle each received event
   * @returns An event emmiter that will fire the watched transaction events
   */
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
