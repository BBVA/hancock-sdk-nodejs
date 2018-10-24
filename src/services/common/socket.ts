import { EventEmitter } from 'events';
import WebSocket from 'isomorphic-ws';
import { HancockSocketBody, HancockSocketKind, HancockSocketMessage } from '..';

/**
 * Manages events emmited by the blockchain network
 */
export class HancockSocket extends EventEmitter {

  private ws: WebSocket;
  private consumer: string | undefined;

  constructor(url: string, consumer?: string) {
    super();
    this.ws = new WebSocket(url);
    this.consumer = consumer;

    this.init();
  }

  /**
   * Closes the subscriptions to the network events
   */
  public closeSocket() {
    this.ws.close();
  }

  /**
   * Add a list of addresses to the watch lists of transfers
   * An event will be received each time that some of the given addresses appears as 'from' or 'to' in some transfer transaction
   * @param addresses addresses to watch
   */
  public addTransfer(addresses: string[]) {
    if (addresses.length > 0) {
      this.sendMessage('watch-transfers', addresses);
    }
  }

  /**
   * Add a list of addresses to the watch lists of transactions
   * An event will be received each time that some of the given addresses appears as 'from' or 'to' in some transaction of any kind
   * @param addresses addresses to watch
   */
  public addTransaction(addresses: string[]) {
    if (addresses.length > 0) {
      this.sendMessage('watch-transactions', addresses);
    }
  }

  /**
   * Add a list of smart contract addresses to the watch lists of smart contract events
   * An event will be received each time that some smart contract identified by one of the given addresses emits an event
   * @param addresses addresses of smart contracts to watch
   */
  public addContract(contracts: string[]) {
    if (contracts.length > 0) {
      this.sendMessage('watch-contracts', contracts);
    }
  }

  protected sendMessage(kind: HancockSocketKind, body: HancockSocketBody[]) {
    const dataFormated = this.getMessageFormat(kind, body);
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(dataFormated));
    }
  }

  private onWebSocketOpen() {

    console.info('Hancock socket open');
    this.emit('opened');

  }

  private onWebSocketMessage(msg: any) {

    try {

      const rawData: string = msg.data ? msg.data : msg;
      const data: any = JSON.parse(rawData);

      this.emit(data.kind, data);

    } catch (e) {

      console.info('Hancock socket message error', e);

    }

  }

  private onWebSocketError(e: any) {

    this.emit('error', e);

  }

  private init() {

    try {

      if (process.browser) {

        this.ws.addEventListener('open', () => this.onWebSocketOpen());
        this.ws.addEventListener('error', (e: any) => this.onWebSocketError(e));
        this.ws.addEventListener('message', (msg: any) => this.onWebSocketMessage(msg));

      } else {

        this.ws.on('open', () => this.onWebSocketOpen());
        this.ws.on('error', (e: any) => this.onWebSocketError(e));
        this.ws.on('message', (msg: any) => this.onWebSocketMessage(msg));

      }

    } catch (e) {

      Promise.resolve().then(() => { this.emit('error', '' + e); });

    }
  }

  private getMessageFormat(kind: HancockSocketKind, body: HancockSocketBody): HancockSocketMessage {
    const message: HancockSocketMessage = {
      kind,
      body,
    };

    if (this.consumer) {
      message.consumer = this.consumer;
    }

    return message;
  }

}
