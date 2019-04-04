import fetch from 'isomorphic-fetch';
import { checkStatus, errorHandler, SupportedPlatforms } from '../../common';
import { DltRawTransaction,
  DltSignedTransaction,
  HancockCallBackOptions,
  HancockInvokeOptions,
  HancockSendSignedTxRequest,
  HancockSendSignedTxResponse,
  HancockSendTxRequest,
  HancockSendTxResponse,
  HancockSignerFn,
  HancockSignRequest,
  HancockSignResponse,
  HancockSocketStatus,
  InitialHancockConfig,
} from '../../hancock.model';
import { HancockSocket } from '../socket';

export class HancockTransactionService {

  protected walletApiBaseUrl: string;
  protected brokerBaseUrl: string;

  constructor(protected config: InitialHancockConfig,
              protected platform: SupportedPlatforms,
              protected signerFn: HancockSignerFn,
              protected hancockSocket: typeof HancockSocket = HancockSocket) {
    this.walletApiBaseUrl = `${config.wallet.host}:${config.wallet.port}${config.wallet.base}`;
    this.brokerBaseUrl = `${config.broker.host}:${config.broker.port}${config.broker.base}`;
  }

  /**
   * Send a raw transaction to the {{platform}} network (It is assumed that the "from" address which will sign the transaction is stored in the node)
   * @param tx A raw transaction which will be sent to the network
   * @returns The result of the transaction
   */
  public async send(tx: DltRawTransaction): Promise<HancockSendTxResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.sendTx}`
      .replace(/__DLT__/, this.platform);

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
   * Send a signed transaction to the {{platform}} network
   * @param tx A signed transaction which will be send to the network
   * @param requestId An uuid to trace the request in hancock
   * @returns The result of the transaction
   */
  public async sendSigned(tx: DltSignedTransaction, requestId?: string): Promise<HancockSendSignedTxResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.sendSignedTx}`
      .replace(/__DLT__/, this.platform);

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
  public async sendToSignProvider(
    rawTx: DltRawTransaction, provider: string, callback?: HancockCallBackOptions): Promise<HancockSignResponse> {

    const url: string = `${this.walletApiBaseUrl + this.config.wallet.resources.signTx}`
      .replace(/__DLT__/, this.platform);

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
  public sign(rawTx: DltRawTransaction | string, privateKey: string): string {

    if (typeof rawTx === 'string') {
      rawTx = JSON.parse(rawTx) as DltRawTransaction;
    }

    return this.signerFn(rawTx, privateKey);
  }

  /**
   * Sign a raw transaction with a given private key
   * @param rawTx A raw transaction which will be signed and sent to the network
   * @param options Configuration of how the transaction will be send to the network
   * @returns The result of the transaction
   */
  public async signAndSend(rawTx: DltRawTransaction, options: HancockInvokeOptions): Promise<HancockSignResponse> {

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
   * @param status The status of transactions which we want to subscribe, it can take two diferent values: 'mined' and 'pending'
   * @returns An event emmiter that will fire the watched transaction events
   */
  public subscribe(addresses: string[] = [], consumer: string = '', status: HancockSocketStatus = 'mined'): HancockSocket {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`
      .replace(/__DLT__/, this.platform)
      .replace(/__ADDRESS__/, '')
      .replace(/__SENDER__/, '')
      .replace(/__STATUS__/, status)
      .replace(/__CONSUMER__/, consumer);

    const hancockSocket = new this.hancockSocket(url, consumer, status);
    hancockSocket.on('ready', () => {
      hancockSocket.watchTransaction(addresses);
    });

    return hancockSocket;

  }

}
