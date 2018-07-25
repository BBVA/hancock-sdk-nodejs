import BigNumber from 'bignumber.js';
import fetch from 'isomorphic-fetch';
import * as ws from 'isomorphic-ws';
import 'jest';
import {
  EthereumWallet, HancockCallResponse,
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
  HancockTokenMetadataResponse,
} from '../..';
import { HancockEthereumClient } from '../../..';
import * as responses from '../__mocks__/responses';
import { HancockEthereumSocket } from '../socket';

jest.mock('isomorphic-fetch');
jest.mock('isomorphic-ws');
jest.unmock('ethereumjs-wallet');

describe('HancockEthereumClient integration tests', () => {

  let clientInstance: HancockEthereumClient;
  const alias: string = 'mockedAlias';
  const normalizedAlias: string = 'mocked-alias';
  const address: string = 'DE8E772F0350E992DDEF81BF8F51D94A8EA9216D';
  const normalizedAddress: string = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d';

  const socket: jest.Mock = (ws as any).__WebSocketConstructor__;
  const socketInstance: any = (ws as any).__WebSocketInstance__;

  beforeAll(() => {

    clientInstance = new HancockEthereumClient();

  });

  beforeEach(() => {

    jest.clearAllMocks();

  });

  describe('::invokeSmartContract', () => {

    const method: string = 'mockedMethod';
    const params: string[] = ['mockedParams'];
    const from: string = 'mockedFrom';

    it('should fail if there is neither privateKey nor signProvider', async () => {

      try {

        await clientInstance.invokeSmartContract(alias, method, params, from);
        fail('It should fail');

      } catch (e) {

        expect(e).toEqual('No key nor provider');

      }

    });

    it('given a private key, should adapt a smartContract invoke by alias (normalized), sign and send it to dlt', async () => {

      const options: HancockInvokeOptions = {
        privateKey: responses.PRIVATE_KEY,
      };

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result = await clientInstance.invokeSmartContract(alias, method, params, from, options);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${normalizedAlias}`);
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

      const result = await clientInstance.invokeSmartContract(address, method, params, from, options);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${normalizedAddress}`);
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'send' }));

      const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

      expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

    });

  });

  describe('::callSmartContract', () => {

    const method: string = 'mockedMethod';
    const params: string[] = ['mockedParams'];
    const from: string = 'mockedFrom';

    it('should call a smartContract method by alias (normalized) and retrieve the response', async () => {

      (fetch as any)
        .once(JSON.stringify(responses.SC_CALL_RESPONSE));

      const result: HancockCallResponse = await clientInstance.callSmartContract(alias, method, params, from);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${normalizedAlias}`);
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'call' }));

      expect(result).toEqual(responses.SC_CALL_RESPONSE);

    });

    it('should call a smartContract method by address (normalized) and fail if there is an error', async () => {

      (fetch as any)
        .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

      try {

        await clientInstance.callSmartContract(address, method, params, from);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${normalizedAddress}`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'call' }));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::adaptInvokeSmartContract', () => {

    const method: string = 'mockedMethod';
    const params: string[] = ['mockedParams'];
    const from: string = 'mockedFrom';

    it('should adapt a smartContract invoke by alias (normalized)', async () => {

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE));

      const result = await clientInstance.adaptInvokeSmartContract(alias, method, params, from);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${normalizedAlias}`);
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'send' }));

      expect(result).toEqual(responses.SC_INVOKE_ADAPT_RESPONSE);

    });

    it('should call a smartContract method by address (normalized) and fail if there is an error', async () => {

      (fetch as any)
        .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

      try {

        await clientInstance.adaptInvokeSmartContract(address, method, params, from);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockInvoke/${normalizedAddress}`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'send' }));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::sendTransaction', () => {

    const tx: any = responses.RAW_TX;

    it('should send the raw transaction to be signed by the node', async () => {

      (fetch as any)
        .once(JSON.stringify(responses.SEND_TX_RESPONSE));

      const result: HancockSendTxResponse = await clientInstance.sendTransaction(tx);

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

        await clientInstance.sendTransaction(tx);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSendTx`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ tx }));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::sendSignedTransaction', () => {

    const tx: any = responses.SIGNED_TX;

    it('should send the signed transaction to the dlt (by calling WalletHub)', async () => {

      (fetch as any)
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockSendSignedTxResponse = await clientInstance.sendSignedTransaction(tx);

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

        await clientInstance.sendSignedTransaction(tx);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSendSignedTx`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ tx }));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::sendTransactionToSign', () => {

    const rawTx: any = responses.RAW_TX;
    const signProvider: string = 'mockSignProvider';

    it('should send the raw transaction throught WalletHub to be signed by the signProvider', async () => {

      (fetch as any)
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockSignResponse = await clientInstance.sendTransactionToSign(rawTx, signProvider);

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

        await clientInstance.sendTransactionToSign(rawTx, signProvider);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockWallet:6666/mockBase/mockSignTx`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ rawTx, provider: signProvider }));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::registerSmartContract', () => {

    const abi: any[] = [];

    it('should regiter the contract in hancock (normalizing address and alias)', async () => {

      (fetch as any)
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockRegisterResponse = await clientInstance.registerSmartContract(alias, address, abi);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockRegister`);
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ address: normalizedAddress, alias: normalizedAlias, abi }));

      expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

    });

    it('should try to regiter the contract in hancock and fail if there is an error', async () => {

      (fetch as any)
        .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

      try {

        await clientInstance.registerSmartContract(alias, address, abi);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockRegister`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ address: normalizedAddress, alias: normalizedAlias, abi }));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::tokenRegister', () => {

    it('should regiter the token in hancock (normalizing address and alias)', async () => {

      (fetch as any)
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockRegisterResponse = await clientInstance.tokenRegister(alias, address);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken/mockRegister`);
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ address: normalizedAddress, alias: normalizedAlias }));

      expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

    });

    it('should try to regiter the token in hancock and fail if there is an error', async () => {

      (fetch as any)
        .mockRejectOnce(JSON.stringify(responses.COMMON_RESPONSE_ERROR), { status: 400 });

      try {

        await clientInstance.tokenRegister(alias, address);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken/mockRegister`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ address: normalizedAddress, alias: normalizedAlias }));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::getBalance', () => {

    it('should retrieve the balance in weis from the dlt', async () => {

      (fetch as any)
        .once(JSON.stringify(responses.GET_BALANCE_RESPONSE));

      const result: BigNumber = await clientInstance.getBalance(normalizedAddress);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockBalance/${normalizedAddress}`);

      expect(result).toEqual(new BigNumber(responses.GET_BALANCE_RESPONSE.data.balance));

    });

    it('should try to retrieve the balance in weis from the dlt and fail if there is an error', async () => {

      (fetch as any)
        .mockRejectOnce(JSON.stringify(responses.GET_BALANCE_ERROR_RESPONSE), { status: 400 });

      try {

        await clientInstance.getBalance(address);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockBalance/${normalizedAddress}`);

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::subscribeToContract', () => {

    beforeEach(() => {

      socketInstance._clear();

    });

    const contracts: string[] = ['mockedAlias', 'DE8E772F0350E992DDEF81BF8F51D94A8EA9216D'];
    const normalizedContracts: string[] = ['mocked-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'];
    const consumer: string = 'mockConsumer';

    it('should retrieve a HancockSocket instance that receive events from broker (related with contracts)', () => {

      const socketOn: jest.Mock = socketInstance.on;
      const socketSend: jest.Mock = socketInstance.send;
      const expectedMessage: HancockSocketMessage = {
        kind: 'watch-contracts',
        body: normalizedContracts,
        consumer,
      };

      const hancockSocket: HancockEthereumSocket = clientInstance.subscribeToContract(contracts, consumer);

      socketInstance._trigger('message', JSON.stringify({ kind: 'ready' }));

      expect(socket).toHaveBeenCalledWith(`ws://mockBroker:6666/mockBase/mockEvents?address=&sender=&consumer=${consumer}`);
      expect(hancockSocket instanceof HancockEthereumSocket).toBeTruthy();
      expect(socketOn).toHaveBeenCalledTimes(3);
      expect(socketSend).toHaveBeenCalledWith(JSON.stringify(expectedMessage));

    });

  });

  describe('::subscribeToTransfer', () => {

    beforeEach(() => {

      socketInstance._clear();

    });

    const addresses: string[] = ['DE8E772F0350E992DDEF81BF8F51D94A8EA9216D'];
    const normalizedAddresses: string[] = ['0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'];
    const consumer: string = 'mockConsumer';

    it('should retrieve a HancockSocket instance that receive events from broker (related with transfers)', () => {

      const socketOn: jest.Mock = socketInstance.on;
      const socketSend: jest.Mock = socketInstance.send;
      const expectedMessage: HancockSocketMessage = {
        kind: 'watch-addresses',
        body: normalizedAddresses,
        consumer,
      };

      const hancockSocket: HancockEthereumSocket = clientInstance.subscribeToTransfer(addresses, consumer);

      socketInstance._trigger('message', JSON.stringify({ kind: 'ready' }));

      expect(socket).toHaveBeenCalledWith(`ws://mockBroker:6666/mockBase/mockEvents?address=&sender=&consumer=${consumer}`);
      expect(hancockSocket instanceof HancockEthereumSocket).toBeTruthy();
      expect(socketOn).toHaveBeenCalledTimes(3);
      expect(socketSend).toHaveBeenCalledWith(JSON.stringify(expectedMessage));

    });

  });

  describe('::generateWallet', () => {

    it('should create a new wallet from scratch', () => {

      const hancockWallet: EthereumWallet = clientInstance.generateWallet();

      expect(typeof hancockWallet.address).toEqual('string');
      expect(typeof hancockWallet.publicKey).toEqual('string');
      expect(typeof hancockWallet.privateKey).toEqual('string');

      expect(hancockWallet.address).toMatch(/^(0x)?([a-fA-F0-9]{40})$/);

    });

  });

  describe('::signTransaction', () => {

    const rawTx: any = responses.RAW_TX;
    const privateKey: string = responses.PRIVATE_KEY;
    const expectedSignedTx: string = responses.SIGNED_TX;

    it('should sign a raw transaction with a private key', () => {

      const signedTx: string = clientInstance.signTransaction(rawTx, privateKey);

      expect(signedTx).toEqual(expectedSignedTx);

    });

  });

  describe('::transfer', () => {

    const from: string = 'F01B3C2131FB5BD8D1D1E5D44F8AD14A2728EC91';
    const to: string = '187ACE2D9051D74296A8E4E154D652B8B6EC4738';

    const normalizedFrom: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
    const normalizedTo: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

    const value: string = 'mockedValue';
    const data: string = 'mockedData';

    it('should fail if there is neither privateKey nor signProvider', async () => {

      const options: HancockInvokeOptions = {};

      try {

        await clientInstance.transfer(from, to, value, options, data);
        fail('It should fail');

      } catch (e) {

        expect(e).toEqual('No key nor provider');

      }

    });

    it('given a private key, should adapt a transfer, sign and send it to dlt', async () => {

      const options: HancockInvokeOptions = {
        privateKey: responses.PRIVATE_KEY,
      };

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockSignResponse = await clientInstance.transfer(from, to, value, options, data);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockTransfer`);
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, to: normalizedTo, value, data }));

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

      const result: HancockSignResponse = await clientInstance.transfer(from, to, value, options, data);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockTransfer`);
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, to: normalizedTo, value, data }));

      const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

      expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

    });

  });

  describe('::tokenTransfer', () => {

    const from: string = 'F01B3C2131FB5BD8D1D1E5D44F8AD14A2728EC91';
    const to: string = '187ACE2D9051D74296A8E4E154D652B8B6EC4738';

    const normalizedFrom: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
    const normalizedTo: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

    const value: string = 'mockedValue';
    const addressOrAlias: string = 'mockedAlias';

    it('should fail if there is neither privateKey nor signProvider', async () => {

      const options: HancockInvokeOptions = {};

      try {

        await clientInstance.tokenTransfer(from, to, value, addressOrAlias, options);
        fail('It should fail');

      } catch (e) {

        expect(e).toEqual('No key nor provider');

      }

    });

    it('given a private key, should adapt a tokenTransfer, sign and send it to dlt', async () => {

      const options: HancockInvokeOptions = {
        privateKey: responses.PRIVATE_KEY,
      };

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockSignResponse = await clientInstance.tokenTransfer(from, to, value, addressOrAlias, options);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + normalizedAlias + '/mockTransfer');
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, to: normalizedTo, value }));

      const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

      expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

    });

    it('given a sign provider, should adapt a tokenTransfer and send it to sign', async () => {

      const options: HancockInvokeOptions = {
        signProvider: 'mockProvider',
      };

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

      const result: HancockSignResponse = await clientInstance.tokenTransfer(from, to, value, addressOrAlias, options);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + normalizedAlias + '/mockTransfer');
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, to: normalizedTo, value }));

      const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

      expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

    });

  });

  describe('::tokenTransferFrom', () => {

    const from: string = 'F01B3C2131FB5BD8D1D1E5D44F8AD14A2728EC91';
    const sender: string = 'F01B3C2131FB5BD8D1D1E5D44F8AD14A2728EC91';
    const to: string = '187ACE2D9051D74296A8E4E154D652B8B6EC4738';

    const normalizedFrom: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
    const normalizedSender: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
    const normalizedTo: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';

    const value: string = 'mockedValue';
    const addressOrAlias: string = 'mockedAlias';

    it('should fail if there is neither privateKey nor signProvider', async () => {

      const options: HancockInvokeOptions = {};

      try {

        await clientInstance.tokenTransferFrom(from, sender, to, value, addressOrAlias, options);
        fail('It should fail');

      } catch (e) {

        expect(e).toEqual('No key nor provider');

      }

    });

    it('given a private key, should adapt a tokenTransferFrom, sign and send it to dlt', async () => {

      const options: HancockInvokeOptions = {
        privateKey: responses.PRIVATE_KEY,
      };

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockSignResponse = await clientInstance.tokenTransferFrom(from, sender, to, value, addressOrAlias, options);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + normalizedAlias + '/mockTransferFrom');
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, sender: normalizedSender, to: normalizedTo, value }));

      const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

      expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

    });

    it('given a sign provider, should adapt a tokenTransferFrom and send it to sign', async () => {

      const options: HancockInvokeOptions = {
        signProvider: 'mockProvider',
      };

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

      const result: HancockSignResponse = await clientInstance.tokenTransferFrom(from, sender, to, value, addressOrAlias, options);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + normalizedAlias + '/mockTransferFrom');
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, sender: normalizedSender, to: normalizedTo, value }));

      const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

      expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

    });

  });

  describe('::tokenAllowance', () => {

    const from: string = 'F01B3C2131FB5BD8D1D1E5D44F8AD14A2728EC91';
    const tokenOwner: string = '187ACE2D9051D74296A8E4E154D652B8B6EC4738';
    const spender: string = '187ACE2D9051D74296A8E4E154D652B8B6EC4745';

    const normalizedFrom: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
    const normalizedTokenOwner: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4738';
    const normalizedSpender: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4745';

    const addressOrAlias: string = 'mockedAlias';

    it('should fail if there is neither privateKey nor signProvider', async () => {

      const options: HancockInvokeOptions = {};

      try {

        await clientInstance.tokenAllowance(from, tokenOwner, spender, addressOrAlias, options);
        fail('It should fail');

      } catch (e) {

        expect(e).toEqual('No key nor provider');

      }

    });

    it('given a private key, should adapt a tokenAllowance, sign and send it to dlt', async () => {

      const options: HancockInvokeOptions = {
        privateKey: responses.PRIVATE_KEY,
      };

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockSignResponse = await clientInstance.tokenAllowance(from, tokenOwner, spender, addressOrAlias, options);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + normalizedAlias + '/mockAllowance');
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, tokenOwner: normalizedTokenOwner, spender: normalizedSpender }));

      const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

      expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

    });

    it('given a sign provider, should adapt a tokenAllowance and send it to sign', async () => {

      const options: HancockInvokeOptions = {
        signProvider: 'mockProvider',
      };

      (fetch as any)
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

      const result: HancockSignResponse = await clientInstance.tokenAllowance(from, tokenOwner, spender, addressOrAlias, options);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + normalizedAlias + '/mockAllowance');
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, tokenOwner: normalizedTokenOwner, spender: normalizedSpender }));

      const secondApiCall: any = (fetch as jest.Mock).mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

      expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

    });

  });

  describe('::encodeProtocol', () => {

    const to: string = '187ACE2D9051D74296A8E4E154D652B8B6EC4738';
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

      const result: HancockProtocolEncodeResponse = await clientInstance.encodeProtocol(action, value, to, data, dlt);

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

        await clientInstance.encodeProtocol(action, value, to, data, dlt);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockEncode`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify(expectedRequest));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::decodeProtocol', () => {

    const code: string = 'whateverEncoded';

    it('should encode the action payload using hancock protocol', async () => {

      (fetch as any)
        .once(JSON.stringify({ whatever: 'whatever' }));

      const result: HancockProtocolDecodeResponse = await clientInstance.decodeProtocol(code);

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

        await clientInstance.decodeProtocol(code);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockDecode`);
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ code }));

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::tokenMetadata', () => {

    const addressOrAlias: string = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d';

    it('should get TokenMetadata', async () => {

      (fetch as any)
        .once(JSON.stringify({ data: 'whatever' }));

      const result: HancockTokenMetadataResponse = await clientInstance.getTokenMetadata(addressOrAlias);

      const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
      expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata`);

      expect(result).toEqual('whatever');

    });

    it('should try to get TokenMetadata and fail if there is an error', async () => {

      (fetch as any)
        .mockRejectOnce(JSON.stringify(responses.GET_TOKEN_METADATA_ERROR_RESPONSE), { status: 500 });

      try {

        await clientInstance.getTokenMetadata(addressOrAlias);

      } catch (e) {

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata`);

        expect(e).toEqual(new Error());

      }

    });

  });

  describe('::tokenApprove', () => {

    const from: string = 'F01B3C2131FB5BD8D1D1E5D44F8AD14A2728EC91';
    const spender: string = '187ACE2D9051D74296A8E4E154D652B8B6EC4745';

    const normalizedFrom: string = '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91';
    const normalizedSpender: string = '0x187ace2d9051d74296a8e4e154d652b8b6ec4745';

    const value: string = 'mockedValue';
    const addressOrAlias: string = 'mockedAlias';

    it('should fail if there is neither privateKey nor signProvider', async () => {

      const options: HancockInvokeOptions = {};

      try {

        await clientInstance.tokenApprove(from, spender, value, addressOrAlias, options);
        fail('It should fail');

      } catch (e) {

        expect(e).toEqual('No key nor provider');

      }

    });

    it('given a private key, should adapt a tokenapprove, sign and send it to dlt', async () => {

      const options: HancockInvokeOptions = {
        privateKey: responses.PRIVATE_KEY,
      };

      fetch
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_SIGNED_TX_RESPONSE));

      const result: HancockSignResponse = await clientInstance.tokenApprove(from, spender, value, addressOrAlias, options);

      const firstApiCall: any = fetch.mock.calls[0];
      expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + normalizedAlias + '/mockApprove');
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, spender: normalizedSpender, value }));

      const secondApiCall: any = fetch.mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSendSignedTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: responses.SIGNED_TX }));

      expect(result).toEqual(responses.SEND_SIGNED_TX_RESPONSE);

    });

    it('given a sign provider, should adapt a tokenApprove and send it to sign', async () => {

      const options: HancockInvokeOptions = {
        signProvider: 'mockProvider'
      };

      fetch
        .once(JSON.stringify(responses.SC_INVOKE_ADAPT_RESPONSE))
        .once(JSON.stringify(responses.SEND_TO_SIGN_RESPONSE));

      const result: HancockSignResponse = await clientInstance.tokenApprove(from, spender, value, addressOrAlias, options);

      const firstApiCall: any = fetch.mock.calls[0];
      expect(firstApiCall[0]).toEqual('http://mockAdapter:6666/mockBase/mockToken/' + normalizedAlias + '/mockApprove');
      expect(firstApiCall[1].method).toEqual('POST');
      expect(firstApiCall[1].body).toEqual(JSON.stringify({ from: normalizedFrom, spender: normalizedSpender, value }));

      const secondApiCall: any = fetch.mock.calls[1];
      expect(secondApiCall[0]).toEqual('http://mockWallet:6666/mockBase/mockSignTx');
      expect(secondApiCall[1].method).toEqual('POST');
      expect(secondApiCall[1].body).toEqual(JSON.stringify({ rawTx: responses.SC_INVOKE_ADAPT_RESPONSE.data, provider: 'mockProvider' }));

      expect(result).toEqual(responses.SEND_TO_SIGN_RESPONSE);

    });

  });

});
