import 'jest';

import * as ws from 'isomorphic-ws';
import { HancockSocketMessage } from '../..';
import { HancockEthereumSocket } from '../socket';

jest.mock('isomorphic-ws');

describe('HancockEthereumSocket integration tests', () => {

  let ethereumSocketInstance: HancockEthereumSocket;
  const url: string = 'mockedUrl';
  const consumer: string = 'mockedConsumer';

  const socket: jest.Mock = (ws as any).__WebSocketConstructor__;
  const socketInstance: any = (ws as any).__WebSocketInstance__;

  beforeAll(() => {

    ethereumSocketInstance = new HancockEthereumSocket(url, consumer);

  });

  beforeEach(() => {

    jest.clearAllMocks();

  });

  it('should instanciate successfully with the given params', () => {

    const socketOn: jest.Mock = socketInstance.on;

    const instance = new HancockEthereumSocket(url, consumer);

    expect(instance instanceof HancockEthereumSocket).toBeTruthy();
    expect(socket).toHaveBeenCalledWith(url);
    expect(socketOn).toHaveBeenCalledTimes(3);

  });

  describe('::closeSocket', () => {

    it('should close the websocket connection', async () => {

      const socketClose: jest.Mock = socketInstance.close;

      ethereumSocketInstance.closeSocket();

      expect(socketClose).toHaveBeenCalled();

    });

  });

  // describe('::send', () => {

  //   it('should send a message throught websocket connection', async () => {

  //     const message: any = { whatever: 'whatever' };
  //     const socketSend: jest.Mock = socketInstance.send;

  //     ethereumSocketInstance.send(message);

  //     expect(socketSend).toHaveBeenCalledWith(message);

  //   });

  // });

  describe('::addTransfer', () => {

    const addresses: string[] = ['0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91', '0x187ace2d9051d74296a8e4e154d652b8b6ec4738'];
    const socketSend: jest.Mock = socketInstance.send;

    it('should sent the given list of addresses to the transfers watch list of broker service', async () => {

      const expectedMessage: HancockSocketMessage = {
        kind: 'watch-transfers',
        body: addresses,
        consumer,
      };

      ethereumSocketInstance.addTransfer(addresses);

      expect(socketSend).toHaveBeenCalledWith(JSON.stringify(expectedMessage));

    });

    it('should do nothing if the given list of addresses is empty', async () => {

      const addrs: string[] = [];

      ethereumSocketInstance.addTransfer(addrs);

      expect(socketSend).not.toHaveBeenCalled();

    });

    it('should do nothing if the connection is not ready', async () => {

      socketInstance.readyState = -1;

      ethereumSocketInstance.addTransfer(addresses);

      expect(socketSend).not.toHaveBeenCalled();

      socketInstance.readyState = (socket as any).OPEN;

    });

  });

  describe('::addTransaction', () => {

    const addresses: string[] = ['0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91', '0x187ace2d9051d74296a8e4e154d652b8b6ec4738'];
    const socketSend: jest.Mock = socketInstance.send;

    it('should sent the given list of addresses to the transfers watch list of broker service', async () => {

      const expectedMessage: HancockSocketMessage = {
        kind: 'watch-transactions',
        body: addresses,
        consumer,
      };

      ethereumSocketInstance.addTransaction(addresses);

      expect(socketSend).toHaveBeenCalledWith(JSON.stringify(expectedMessage));

    });

    it('should do nothing if the given list of addresses is empty', async () => {

      const addrs: string[] = [];

      ethereumSocketInstance.addTransaction(addrs);

      expect(socketSend).not.toHaveBeenCalled();

    });

    it('should do nothing if the connection is not ready', async () => {

      socketInstance.readyState = -1;

      ethereumSocketInstance.addTransaction(addresses);

      expect(socketSend).not.toHaveBeenCalled();

      socketInstance.readyState = (socket as any).OPEN;

    });

  });

  describe('::addContract', () => {

    const addressesOrAliases: string[] = ['mockedAlias', '0x187ace2d9051d74296a8e4e154d652b8b6ec4738'];
    const socketSend: jest.Mock = socketInstance.send;

    it('should sent the given list of addresses or aliases to the contract events watch list of broker service', async () => {

      const expectedMessage: HancockSocketMessage = {
        kind: 'watch-contracts',
        body: addressesOrAliases,
        consumer,
      };

      ethereumSocketInstance.addContract(addressesOrAliases);

      expect(socketSend).toHaveBeenCalledWith(JSON.stringify(expectedMessage));

    });

    it('should do nothing if the given list of addresses is empty', async () => {

      const addrsOrAliases: string[] = [];

      ethereumSocketInstance.addContract(addrsOrAliases);

      expect(socketSend).not.toHaveBeenCalled();

    });

    it('should do nothing if the connection is not ready', async () => {

      socketInstance.readyState = -1;

      ethereumSocketInstance.addContract(addressesOrAliases);

      expect(socketSend).not.toHaveBeenCalled();

      socketInstance.readyState = (socket as any).OPEN;

    });

  });

  describe('::eventHandlers', () => {

    beforeEach(() => {

      socketInstance._clear();
      ethereumSocketInstance = new HancockEthereumSocket(url, consumer);

    });

    it('should emit "opened" when the connection is opened', () => {

      const spy = jest.fn();

      ethereumSocketInstance.on('opened', spy);

      socketInstance._trigger('open');

      expect(spy).toHaveBeenCalled();

    });

    it('should emit "error" when an error comes from broker service', () => {

      const spy = jest.fn();
      const e: Error = new Error('Boom!');

      ethereumSocketInstance.on('error', spy);

      socketInstance._trigger('error', e);

      expect(spy).toHaveBeenCalledWith(e);

    });

    it('should emit "message" when a message comes from broker service', () => {

      const spy = jest.fn();
      const message: any = { kind: 'mockedKind', whatever: 'whatever' };

      ethereumSocketInstance.on(message.kind, spy);

      socketInstance._trigger('message', JSON.stringify(message));

      expect(spy).toHaveBeenCalledWith(message);

    });

    it('should emit "message" when a message comes from broker service (with data)', () => {

      const spy = jest.fn();
      const message: any = { data: { kind: 'mockedKind', whatever: 'whatever' } };

      ethereumSocketInstance.on(message.kind, spy);

      socketInstance._trigger('message', JSON.stringify(message));

      expect(spy).toHaveBeenCalledWith(message);

    });

  });

});
