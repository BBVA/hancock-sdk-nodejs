import { EventEmitter } from 'events';
import WebSocket from 'isomorphic-ws';
import { HancockSocketBody, HancockSocketMessage, HancockSocketStatus, SOCKET_EVENT_KINDS } from '..';

/**
 * Manages events emmited by the blockchain network
 */
export class HancockSocket extends EventEmitter {

  private ws: WebSocket;
  private consumer: string | undefined;
  private status: HancockSocketStatus | undefined;

  constructor(url: string, consumer?: string, status: HancockSocketStatus = 'mined') {
    super();
    this.ws = new WebSocket(url);
    this.consumer = consumer;
    this.status = status;

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
  public watchTransfer(addresses: string[]) {
    if (addresses.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.WatchTransfer, addresses);
    }
  }

  /**
   * Add a list of addresses to the watch lists of transactions
   * An event will be received each time that some of the given addresses appears as 'from' or 'to' in some transaction of any kind
   * @param addresses addresses to watch
   */
  public watchTransaction(addresses: string[]) {
    if (addresses.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.WatchTransaction, addresses);
    }
  }

  /**
   * Add a list of smart contract addresses to the watch lists of smart contract transactions
   * An event will be received each time that some smart contract identified by one of the given addresses emits an event
   * @param contracts addresses of smart contracts to watch
   */
  public watchContractTransaction(contracts: string[]) {
    if (contracts.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.WatchSmartContractTransaction, contracts);
    }
  }

  /**
   * Add a list of addresses to the watch lists of smart contract deployments
   * An event will be received each time that some smart contract identified by one of the given addresses emits an event
   * @param addresses addresses to watch
   */
  public watchContractDeployment(addresses: string[]) {
    if (addresses.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.WatchSmartContractDeployment, addresses);
    }
  }

  /**
   * Add a list of smart contract addresses to the watch lists of smart contract events
   * An event will be received each time that some smart contract identified by one of the given addresses emits an event
   * @param contracts addresses of smart contracts to watch
   */
  public watchContractEvent(contracts: string[]) {
    if (contracts.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.WatchSmartContractEvent, contracts);
    }
  }

  /**
   * Stop listening the addresses for event of type "transfers"
   * @param addresses Addresses to stop listening
   */
  public unwatchTransfer(addresses: string[]) {
    if (addresses.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.UnwatchTransfer, addresses);
    }
  }

  /**
   * Stop listening the addresses for event of type "transactions".
   * @param addresses Addresses to stop listening
   */
  public unwatchTransaction(addresses: string[]) {
    if (addresses.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.UnwatchTransaction, addresses);
    }
  }

  /**
   * Stop listening the contracts for event of type "contracts-events".
   * @param contracts Contracts to stop listening
   */
  public unwatchContractTransaction(contracts: string[]) {
    if (contracts.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.UnwatchSmartContractTransaction, contracts);
    }
  }

  /**
   * Stop listening the contracts for event of type "contracts-transactions".
   * @param contracts Contracts to stop listening
   */
  public unwatchContractEvent(contracts: string[]) {
    if (contracts.length > 0) {
      this.sendMessage(SOCKET_EVENT_KINDS.UnwatchSmartContractEvent, contracts);
    }
  }

  protected sendMessage(kind: SOCKET_EVENT_KINDS, body: HancockSocketBody[]) {
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

  private getMessageFormat(kind: SOCKET_EVENT_KINDS, body: HancockSocketBody): HancockSocketMessage {
    const message: HancockSocketMessage = {
      kind,
      body,
    };

    if (this.consumer) {
      message.consumer = this.consumer;
    }

    if (this.status) {
      message.status = this.status;
    }

    return message;
  }

}
