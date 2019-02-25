import 'jest';

import BigNumber from 'bignumber.js';
import fetch from 'isomorphic-fetch';
import * as ws from 'isomorphic-ws';
import {
  HancockCallResponse,
  HancockContractInstance,
  HancockInvokeOptions,
  HancockProtocolAction,
  HancockProtocolDecodeResponse,
  HancockProtocolDlt,
  HancockProtocolEncode,
  HancockProtocolEncodeResponse,
  HancockRegisterResponse,
  HancockSendSignedTxResponse,
  HancockSendTxResponse,
  HancockSignResponse,
  HancockSocketMessage,
  HancockTokenAllowanceResponse,
  HancockTokenInstance,
  HancockTokenMetadataResponse,
} from '../..';
import { HancockEthereumClient } from '../../..';
import * as common from '../../common';
import { HancockError, hancockErrorType } from '../../error';
import * as responses from '../__mocks__/responses';
import { EthereumWallet } from '../signer';
import { HancockEthereumSocket } from '../socket';

jest.mock('isomorphic-fetch');
jest.mock('isomorphic-ws');
jest.unmock('ethereumjs-wallet');

describe('HancockEthereumClient integration tests', () => {

  const errorFnMock = common.error as jest.Mock;
  let clientInstance: HancockEthereumClient;
  const alias: string = 'mockedAlias';
  const address: string = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d';

  const socket: jest.Mock = (ws as any).__WebSocketConstructor__;
  const socketInstance: any = (ws as any).__WebSocketInstance__;

  beforeAll(() => {

    clientInstance = new HancockEthereumClient();

  });

  beforeEach(() => {

    jest.clearAllMocks();

  });

  describe('::transaction', () => {

    describe('::send', () => {

      const tx: any = responses.RAW_TX;

      it('should send the raw transaction to be signed by the node', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.SEND_TX_RESPONSE));

        const result: HancockSendTxResponse = await clientInstance.transaction.send(tx);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSendTx`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ tx }));

        expect(result).toEqual(responses.SEND_TX_RESPONSE);

      });

      it('should send the raw transaction to be signed by the node and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

        try {

          await clientInstance.transaction.send(tx);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSendTx`);
          expect(firstApiCall[1].method).toEqual('POST');
          expect(firstApiCall[1].body).toEqual(JSON.stringify({ tx }));

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::sendSigned', () => {

      const tx: any = responses.SIGNED_TX;

      it('should send the signed transaction to the dlt (by calling WalletHub)', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result: HancockSendSignedTxResponse = await clientInstance.transaction.sendSigned(tx);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSendSignedTx`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ tx }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('should send the signed transaction to the dlt (by calling WalletHub) and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

        try {

          await clientInstance.transaction.sendSigned(tx);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSendSignedTx`);
          expect(firstApiCall[1].method).toEqual('POST');
          expect(firstApiCall[1].body).toEqual(JSON.stringify({ tx }));

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::sendToSignProvider', () => {

      const rawTx: any = responses.RAW_TX;
      const signProvider: string = 'mockSignProvider';

      it('should send the raw transaction throught WalletHub to be signed by the signProvider', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result: HancockSignResponse = await clientInstance.transaction.sendToSignProvider(rawTx, signProvider);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSignTx`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ rawTx, provider: signProvider }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('should send the raw transaction throught WalletHub to be signed by the signProvider and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

        try {

          await clientInstance.transaction.sendToSignProvider(rawTx, signProvider);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSignTx`);
          expect(firstApiCall[1].method).toEqual('POST');
          expect(firstApiCall[1].body).toEqual(JSON.stringify({ rawTx, provider: signProvider }));

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::sign', () => {

      const rawTx: any = responses.RAW_TX;
      const privateKey: string = responses.PRIVATE_KEY;
      const expectedSignedTx: string = responses.SIGNED_TX;

      it('should sign a raw transaction with a private key', () => {

        const signedTx: string = clientInstance.transaction.sign(rawTx, privateKey);

        expect(signedTx).toEqual(expectedSignedTx);

      });

    });

    describe('::subscribe', () => {

      beforeEach(() => {

        socketInstance._clear();

      });

      const addresses: string[] = ['0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'];
      const consumer: string = 'mockConsumer';

      it('should retrieve a HancockSocket instance that receive events from broker (related with transfers)', () => {

        const socketOn: jest.Mock = socketInstance.on;
        const socketSend: jest.Mock = socketInstance.send;
        const expectedMessage: HancockSocketMessage = {
          kind: 'watch-transactions',
          body: addresses,
          consumer,
          status: 'mined',
        };

        const hancockSocket: HancockEthereumSocket = clientInstance.transaction.subscribe(addresses, consumer);

        socketInstance._trigger('message', JSON.stringify({ kind: 'ready' }));

        expect(socket).toHaveBeenCalledWith(`ws://mockBroker:6666/mockBase/mockEvents?address=&sender=&consumer=${consumer}`);
        expect(hancockSocket instanceof HancockEthereumSocket).toBeTruthy();
        expect(socketOn).toHaveBeenCalledTimes(3);
        expect(socketSend).toHaveBeenCalledWith(JSON.stringify(expectedMessage));

      });

    });

  });

  describe('::transfer', () => {

    describe('::transfer', () => {

      const from: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
      const to: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

      const value: string = 'mockedValue';
      const data: string = 'mockedData';

      it('should fail if there is neither privateKey nor signProvider', async () => {

        const options: HancockInvokeOptions = {};

        try {

          await clientInstance.transfer.send(from, to, value, options, data);
          fail('It should fail');

        } catch (e) {

          expect(e).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));

        }

      });

      it('given a private key, should adapt a transfer, sign and send it to dlt', async () => {

        const options: HancockInvokeOptions = {
          privateKey: responses.PRIVATE_KEY,
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result: HancockSignResponse = await clientInstance.transfer.send(from, to, value, options, data);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockTransfer`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, to, value, data }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('given a sign provider, should adapt a transfer and send it to sign', async () => {

        const options: HancockInvokeOptions = {
          signProvider: 'mockProvider',
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

        const result: HancockSignResponse = await clientInstance.transfer.send(from, to, value, options, data);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockTransfer`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, to, value, data }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

        expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

      });

    });

    describe('::subscribe', () => {

      beforeEach(() => {

        socketInstance._clear();

      });

      const addresses: string[] = ['0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'];
      const consumer: string = 'mockConsumer';

      it('should retrieve a HancockSocket instance that receive events from broker (related with transfers)', () => {

        const socketOn: jest.Mock = socketInstance.on;
        const socketSend: jest.Mock = socketInstance.send;
        const expectedMessage: HancockSocketMessage = {
          kind: 'watch-transfers',
          body: addresses,
          consumer,
          status: 'mined',
        };

        const hancockSocket: HancockEthereumSocket = clientInstance.transfer.subscribe(addresses, consumer);

        socketInstance._trigger('message', JSON.stringify({ kind: 'ready' }));

        expect(socket).toHaveBeenCalledWith(`ws://mockBroker:6666/mockBase/mockEvents?address=&sender=&consumer=${consumer}`);
        expect(hancockSocket instanceof HancockEthereumSocket).toBeTruthy();
        expect(socketOn).toHaveBeenCalledTimes(3);
        expect(socketSend).toHaveBeenCalledWith(JSON.stringify(expectedMessage));

      });

    });

  });

  describe('::protocol', () => {

    describe('::encode', () => {

      const to: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';
      const normalizedTo: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';
      const action: HancockProtocolAction = 'transfer';
      const value: string = 'mockedValue';
      const data: string = 'mockedData';
      const dlt: HancockProtocolDlt = 'ethereum';

      const expectedRequest: HancockProtocolEncode = {
        action,
        body: {
          value,
          to: normalizedTo,
          data,
        },
        dlt,
      };

      it('should encode the action payload using hancock protocol', async () => {

        (fetch as any)
          .once(JSON.stringify({ whatever: 'whatever' }));

        const result: HancockProtocolEncodeResponse = await clientInstance.protocol.encode(action, value, to, data, dlt);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockEncode`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify(expectedRequest));

        expect(result).toEqual({ whatever: 'whatever' });

      });

      it('should try to encode the action payload using hancock protocol and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

        try {

          await clientInstance.protocol.encode(action, value, to, data, dlt);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockEncode`);
          expect(firstApiCall[1].method).toEqual('POST');
          expect(firstApiCall[1].body).toEqual(JSON.stringify(expectedRequest));

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::decode', () => {

      const code: string = 'whateverEncoded';

      it('should encode the action payload using hancock protocol', async () => {

        (fetch as any)
          .once(JSON.stringify({ whatever: 'whatever' }));

        const result: HancockProtocolDecodeResponse = await clientInstance.protocol.decode(code);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockDecode`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ code }));

        expect(result).toEqual({ whatever: 'whatever' });

      });

      it('should try to encode the action payload using hancock protocol and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

        try {

          await clientInstance.protocol.decode(code);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockDecode`);
          expect(firstApiCall[1].method).toEqual('POST');
          expect(firstApiCall[1].body).toEqual(JSON.stringify({ code }));

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

  });

  describe('::smartContract', () => {

    describe('::invoke', () => {

      const method: string = 'mockedMethod';
      const params: string[] = ['mockedParams'];
      const from: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

      it('should fail if there is neither privateKey nor signProvider', async () => {

        try {

          await clientInstance.smartContract.invoke(alias, method, params, from);
          fail('It should fail');

        } catch (e) {

          expect(e).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));

        }

      });

      it('given a private key, should adapt a smartContract invoke by alias (normalized), sign and send it to dlt', async () => {

        const options: HancockInvokeOptions = {
          privateKey: responses.PRIVATE_KEY,
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result = await clientInstance.smartContract.invoke(alias, method, params, from, options);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${alias}`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'send' }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('given a sign provider, should adapt a smartContract invoke by address (normalized) and send it to sign', async () => {

        const options: HancockInvokeOptions = {
          signProvider: 'mockProvider',
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

        const result = await clientInstance.smartContract.invoke(address, method, params, from, options);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${address}`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'send' }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

        expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

      });

    });

    describe('::call', () => {

      const method: string = 'mockedMethod';
      const params: string[] = ['mockedParams'];
      const from: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

      it('should call a smartContract method by alias (normalized) and retrieve the response', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.SC_CALL_RESPONSE));

        const result: HancockCallResponse = await clientInstance.smartContract.call(alias, method, params, from);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${alias}`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'call' }));

        expect(result).toEqual(responses.SC_CALL_RESPONSE);

      });

      it('should call a smartContract method by address (normalized) and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

        try {

          await clientInstance.smartContract.call(address, method, params, from);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${address}`);
          expect(firstApiCall[1].method).toEqual('POST');
          expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'call' }));

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    // describe('::adaptInvoke', () => {

    //   const method: string = 'mockedMethod';
    //   const params: string[] = ['mockedParams'];
    //   const from: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

    //   it('should adapt a smartContract invoke by alias (normalized)', async () => {

    //     (fetch as any)
    //       .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE));

    //     const result = await clientInstance.smartContract.adaptInvoke(alias, method, params, from);

    //     const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
    //     expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${alias}`);
    //     expect(firstApiCall[1].method).toEqual('POST');
    //     expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'send' }));

    //     expect(result).toEqual(responses.SC_INVOKE_ADAPT_RESPONSE);

    //   });

    //   it('should call a smartContract method by address (normalized) and fail if there is an error', async () => {

    //     (fetch as any)
    //       .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

    //     try {

    //       await clientInstance.smartContract.adaptInvoke(address, method, params, from);

    //     } catch (e) {

    //       const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
    //       expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${address}`);
    //       expect(firstApiCall[1].method).toEqual('POST');
    //       expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'send' }));

    //       expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

    //     }

    //   });

    // });

    describe('::register', () => {

      const abi: any[] = [];

      it('should regiter the contract in hancock (normalizing address and alias)', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result: HancockRegisterResponse = await clientInstance.smartContract.register(alias, address, abi);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockRegister`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ address, alias, abi }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('should try to regiter the contract in hancock and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

        try {

          await clientInstance.smartContract.register(alias, address, abi);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockRegister`);
          expect(firstApiCall[1].method).toEqual('POST');
          expect(firstApiCall[1].body).toEqual(JSON.stringify({ address, alias, abi }));

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::subscribe', () => {

      beforeEach(() => {

        socketInstance._clear();

      });

      const contracts: string[] = ['mockedAlias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'];
      const consumer: string = 'mockConsumer';

      it('should retrieve a HancockSocket instance that receive events from broker (related with contracts)', () => {

        const socketOn: jest.Mock = socketInstance.on;
        const socketSend: jest.Mock = socketInstance.send;
        const expectedMessage: HancockSocketMessage = {
          kind: 'watch-contracts',
          body: contracts,
          consumer,
          status: 'mined',
        };

        const hancockSocket: HancockEthereumSocket = clientInstance.smartContract.subscribe(contracts, consumer);

        socketInstance._trigger('message', JSON.stringify({ kind: 'ready' }));

        expect(socket).toHaveBeenCalledWith(`ws://mockBroker:6666/mockBase/mockEvents?address=&sender=&consumer=${consumer}`);
        expect(hancockSocket instanceof HancockEthereumSocket).toBeTruthy();
        expect(socketOn).toHaveBeenCalledTimes(3);
        expect(socketSend).toHaveBeenCalledWith(JSON.stringify(expectedMessage));

      });

    });

  });

  describe('::token', () => {

    describe('::register', () => {

      it('should regiter the token in hancock (normalizing address and alias)', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result: HancockRegisterResponse = await clientInstance.token.register(alias, address);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken/mockRegister`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ address, alias }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('should try to regiter the token in hancock and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

        try {

          await clientInstance.token.register(alias, address);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken/mockRegister`);
          expect(firstApiCall[1].method).toEqual('POST');
          expect(firstApiCall[1].body).toEqual(JSON.stringify({ address, alias }));

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::transfer', () => {

      const from: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
      const to: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

      const value: string = 'mockedValue';
      const addressOrAlias: string = 'mockedAlias';

      it('given a private key, should adapt a transfer, sign and send it to dlt', async () => {

        const options: HancockInvokeOptions = {
          privateKey: responses.PRIVATE_KEY,
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result: HancockSignResponse = await clientInstance.token.transfer(from, to, value, addressOrAlias, options);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + alias + '/mockTransfer');
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, to, value }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('given a sign provider, should adapt a transfer and send it to sign', async () => {

        const options: HancockInvokeOptions = {
          signProvider: 'mockProvider',
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

        const result: HancockSignResponse = await clientInstance.token.transfer(from, to, value, addressOrAlias, options);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + alias + '/mockTransfer');
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, to, value }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

        expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

      });

    });

    describe('::transferFrom', () => {

      const from: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
      const sender: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
      const to: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

      const value: string = 'mockedValue';
      const addressOrAlias: string = 'mockedAlias';

      it('given a private key, should adapt a transferFrom, sign and send it to dlt', async () => {

        const options: HancockInvokeOptions = {
          privateKey: responses.PRIVATE_KEY,
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result: HancockSignResponse = await clientInstance.token.transferFrom(from, sender, to, value, addressOrAlias, options);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + alias + '/mockTransferFrom');
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, sender, to, value }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('given a sign provider, should adapt a transferFrom and send it to sign', async () => {

        const options: HancockInvokeOptions = {
          signProvider: 'mockProvider',
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

        const result: HancockSignResponse = await clientInstance.token.transferFrom(from, sender, to, value, addressOrAlias, options);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + alias + '/mockTransferFrom');
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, sender, to, value }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

        expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

      });

    });

    describe('::allowance', () => {

      const from: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
      const tokenOwner: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';
      const spender: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4745';

      const addressOrAlias: string = 'mockedAlias';

      it('should retrieve the number of tokens awolled to spend by the spender', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.GET_TOKEN_ALLOWANCE_RESPONSE));

        const result: HancockTokenAllowanceResponse = await clientInstance.token.allowance(from, tokenOwner, spender, addressOrAlias);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + alias + '/mockAllowance');
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, tokenOwner, spender }));

        expect(result).toEqual(parseInt(responses.GET_TOKEN_ALLOWANCE_RESPONSE.data, 10));

      });

    });

    describe('::tokenMetadata', () => {

      const addressOrAlias: string = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d';

      it('should get TokenMetadata', async () => {

        (fetch as any)
          .once(JSON.stringify({ data: 'whatever' }));

        const result: HancockTokenMetadataResponse = await clientInstance.token.getMetadata(addressOrAlias);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata`);

        expect(result).toEqual('whatever');

      });

      it('should try to get TokenMetadata and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.GET_TOKEN_METADATA_ERROR_RESPONSE), { status: 500 });

        try {

          await clientInstance.token.getMetadata(addressOrAlias);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata`);

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::findAllToken', () => {

      it('should get all Tokens', async () => {

        const dataResponse = { abiName: 'erc20', alias: 'tkn', address: 'mockedAddress' };

        (fetch as any)
          .once(JSON.stringify({ data: [dataResponse] }));

        const result: HancockTokenInstance[] = await clientInstance.token.getAllTokens();

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken`);

        expect(result).toEqual([dataResponse]);

      });

      it('should try to get all tokens and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.GET_ALL_TOKENS_ERROR_RESPONSE), { status: 500 });

        try {

          await clientInstance.token.getAllTokens();

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken`);

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::approve', () => {

      const from: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
      const spender: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4745';

      const value: string = 'mockedValue';
      const addressOrAlias: string = 'mockedAlias';

      it('given a private key, should adapt a tokenapprove, sign and send it to dlt', async () => {

        const options: HancockInvokeOptions = {
          privateKey: responses.PRIVATE_KEY,
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

        const result: HancockSignResponse = await clientInstance.token.approve(from, spender, value, addressOrAlias, options);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + alias + '/mockApprove');
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, spender, value }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

        expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

      });

      it('given a sign provider, should adapt a approve and send it to sign', async () => {

        const options: HancockInvokeOptions = {
          signProvider: 'mockProvider',
        };

        (fetch as any)
          .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

        const result: HancockSignResponse = await clientInstance.token.approve(from, spender, value, addressOrAlias, options);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + alias + '/mockApprove');
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ from, spender, value }));

        const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

        expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

      });

    });

  });

  describe('::wallet', () => {

    describe('::getBalance', () => {

      it('should retrieve the balance in weis from the dlt', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.GET_BALANCE_RESPONSE));

        const result: BigNumber = await clientInstance.wallet.getBalance(address);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockBalance/${address}`);

        expect(result).toEqual(new BigNumber(responses.GET_BALANCE_RESPONSE.data.balance));

      });

      it('should try to retrieve the balance in weis from the dlt and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.GET_BALANCE_ERROR_RESPONSE), { status: 400 });

        try {

          await clientInstance.wallet.getBalance(address);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockBalance/${address}`);

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::generate', () => {

      it('should create a new wallet from scratch', () => {

        const hancockWallet: EthereumWallet = clientInstance.wallet.generate();

        expect(typeof hancockWallet.address).toEqual('string');
        expect(typeof hancockWallet.publicKey).toEqual('string');
        expect(typeof hancockWallet.privateKey).toEqual('string');

        expect(hancockWallet.address).toMatch(/^(0x)?([a-fA-F0-9]{40})$/);

      });
    });

  });

});
