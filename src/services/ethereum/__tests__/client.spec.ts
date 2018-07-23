import 'jest';
import fetch from 'isomorphic-fetch';
import * as socket from '../socket';
import * as response from '../__mocks__/responses';
import * as signer from '../signer';
import { HancockEthereumClient } from '../client';
import BigNumber from 'bignumber.js';
import { HancockAdaptInvokeResponse } from '../..';

// jest.mock('url');
jest.mock('isomorphic-fetch');
jest.mock('../socket');
jest.mock('../utils');
jest.mock('../signer');

describe('ethereum client constructor', async () => {

  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: { 'resource': 'genericResource' },
  };
  let config: any;
  let configAdapter: any = genericConfig;
  let configWallet: any = genericConfig;
  let configBroker: any = genericConfig;

  beforeEach(() => {

    config = {
      adapter: configAdapter,
      wallet: configWallet,
      broker: configBroker,
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call constructor correctly', async () => {

    configAdapter.host = 'adapterHost';
    const client = new HancockEthereumClient(config);
    const adapterurl = 'adapterHost:1genericBase';
    const brokerurl = (client as any).config.broker.host + ':' + (client as any).config.broker.port + (client as any).config.broker.base;
    expect((client as any).adapterApiBaseUrl).toBe(adapterurl);
    expect((client as any).brokerBaseUrl).toBe(brokerurl);

  });

  it('should call constructor without options correctly', async () => {

    configAdapter.host = 'adapterHost';
    const client = new HancockEthereumClient();
    const adapterurl = (client as any).config.adapter.host + ':' + (client as any).config.adapter.port + (client as any).config.adapter.base;
    const brokerurl = (client as any).config.broker.host + ':' + (client as any).config.broker.port + (client as any).config.broker.base;
    const walleturl = (client as any).config.wallet.host + ':' + (client as any).config.wallet.port + (client as any).config.wallet.base;
    expect((client as any).adapterApiBaseUrl).toBe(adapterurl);
    expect((client as any).brokerBaseUrl).toBe(brokerurl);
    expect((client as any).walletApiBaseUrl).toBe(walleturl);

  });
});

describe('ethereum client', async () => {

  let client: HancockEthereumClient;

  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: { 'resource': 'genericResource' },
  };
  let config: any;
  let configAdapter: any = genericConfig;
  let configWallet: any = genericConfig;
  let configBroker: any = genericConfig;
  let callParamFetch: any;
  let options: any;
  let hancockAdaptInvokeResponse: HancockAdaptInvokeResponse;
  let encodeBody: any;

  beforeEach(() => {
    config = {
      adapter: configAdapter,
      wallet: configWallet,
      broker: configBroker,
    };
    client = new HancockEthereumClient(config);

    callParamFetch = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'method',
        from: 'from',
        params: ['params'],
        action: 'send'
      })
    };

    hancockAdaptInvokeResponse = {
      result: {
        code: 123,
        description: "descriptionTest",
      },
      data: "testData",
    }

    encodeBody = {
      'action': 'transfer',
      'body': {
        'value': '1000',
        'to': '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        'data': 'dataTest'
      },
      'dlt': 'ethereum'
    };

    options = {
      privateKey: '0x0000000000000000000000000000000000000000000000000000000000000002'
    };

    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call invokeSmartContract correctly', async () => {

    const adaptSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'adaptInvokeSmartContract')
      .mockImplementation(() => Promise.resolve('whatever'));
    const signAndSendSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'signAndSend')
      .mockImplementation(() => Promise.resolve('whatever'));

    await client.invokeSmartContract('contractAddressOrAlias', 'method', ['params'], 'from', options);

    expect(adaptSpy).toHaveBeenCalledWith('contractAddressOrAlias', 'method', ['params'], 'from');
    expect(signAndSendSpy).toHaveBeenCalledWith('whatever', options);

  });

  it('should call invokeSmartContract and throw reject', async () => {

    try {
      await client.invokeSmartContract('contractAddressOrAlias', 'method', ['params'], 'from')
      fail('it should fail');
    } catch (error) {
      expect(error).toBe('No key nor provider');
    }

  });

  it('should call callSmartContract correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({
      method: 'method',
      from: 'from',
      params: ['params'],
      action: 'call'
    });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.callSmartContract('contractAddressOrAlias', 'method', ['params'], 'from');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockInvoke/contractAddressOrAlias',
      callParamFetch
    );

    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call callSmartContract and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({
      method: 'method',
      from: 'from',
      params: ['params'],
      action: 'call'
    });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await client.callSmartContract('contractAddressOrAlias', 'method', ['params'], 'from');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockInvoke/contractAddressOrAlias',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call adaptInvokeSmartContract correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.adaptInvokeSmartContract('contractAddressOrAlias', 'method', ['params'], 'from');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockInvoke/contractAddressOrAlias',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call adaptInvokeSmartContract and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await client.adaptInvokeSmartContract('contractAddressOrAlias', 'method', ['params'], 'from');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockInvoke/contractAddressOrAlias',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call sendTransaction correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({ 'tx': { 'whatever': 'whatevervalue' } });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.sendTransaction({ 'whatever': 'whatevervalue' });

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockSendTx',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call sendTransaction and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({ 'tx': { 'whatever': 'whatevervalue' } });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await client.sendTransaction({ 'whatever': 'whatevervalue' });
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockSendTx',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call sendSignedTransaction correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({ 'tx': { 'whatever': 'whatevervalue' } });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.sendSignedTransaction({ 'whatever': 'whatevervalue' });

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockSendSignedTx',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call sendSignedTransaction and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({ 'tx': { 'whatever': 'whatevervalue' } });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await client.sendSignedTransaction({ 'whatever': 'whatevervalue' });
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockSendSignedTx',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call sendTransactionToSign correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({ 'rawTx': { 'whatever': 'whatevervalue' }, 'provider': 'provider' });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.sendTransactionToSign({ 'whatever': 'whatevervalue' }, 'provider');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockSignTx',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call sendSignedTransaction and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({ 'rawTx': { 'whatever': 'whatevervalue' }, 'provider': 'provider' });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await client.sendTransactionToSign({ 'whatever': 'whatevervalue' }, 'provider');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockSignTx',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call registerSmartContract correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({
      'address': '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      'alias': 'contract-alias',
      'abi': ['abi']
    });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.registerSmartContract('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', ['abi']);

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockRegister',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call registerSmartContract and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({
      'address': '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      'alias': 'contract-alias',
      'abi': ['abi']
    });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await client.registerSmartContract('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', ['abi']);
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockRegister',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  describe('::tokenRegister', () => {

    it('should call tokenRegister correctly', async () => {

      (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
      callParamFetch.body = JSON.stringify({
        'address': '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        'alias': 'contract-alias'
      });

      const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus').mockImplementation((res) => Promise.resolve(res.json()));

      const result = await client.tokenRegister('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

      expect(fetch).toHaveBeenCalledWith('genericHost:1genericBase/mockToken/mockRegister', callParamFetch);
      expect(checkStatusSpy).toHaveBeenCalled();
      expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

    });

    it('should call registerSmartContract and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
      callParamFetch.body = JSON.stringify({
        'address': '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        'alias': 'contract-alias',
      });

      const throwedError = new Error('testError');
      const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
        .mockImplementation(() => { throw throwedError });

      try {

        await client.tokenRegister('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
        fail('it should fail');

      } catch (error) {

        expect(fetch).toHaveBeenCalledWith('genericHost:1genericBase/mockToken/mockRegister', callParamFetch);
        expect(checkStatusSpy).toHaveBeenCalled();
        expect(error).toEqual(throwedError);

      }

    });

  });


  it('should call getBalance correctly', async () => {

    (fetch as any).once(JSON.stringify(response.GET_BALANCE_RESPONSE));

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.getBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(new BigNumber(response.GET_BALANCE_RESPONSE.data.balance));

  });

  it('should call getBalance and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.GET_BALANCE_ERROR_RESPONSE), { status: 400 });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation((res) => { throw new Error(res.description) });

    try {
      const result = await client.getBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    }

  });


  it('should call getTokenBalance correctly', async () => {

    (fetch as any).once(JSON.stringify(response.GET_TOKEN_BALANCE_RESPONSE));

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
    .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.getTokenBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d','0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result.balance).toEqual(response.GET_TOKEN_BALANCE_RESPONSE.data.balance);

  });

  it('should call getTokenBalance and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.GET_TOKEN_BALANCE_ERROR_RESPONSE), { status: 400 });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
    .mockImplementation((res) => {throw new Error(res.description)});

    try {
      await client.getTokenBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d','0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d'
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    }

  });

  it('should call generateWallet correctly', async () => {

    const response = client.generateWallet();

    expect(signer.generateWallet).toHaveBeenCalledTimes(1);

  });

  it('should call signTransaction correctly', async () => {

    const rawtx = "{\"test\":\"test\"}";
    const privatekey = '0x0000000000000000000000000000000000000000000000000000000000000002';

    const response = client.signTransaction(rawtx, privatekey);

    expect(signer.signTx).toHaveBeenCalledWith(JSON.parse(rawtx), privatekey);

  });

  it('should call signTransaction without string correctly', async () => {

    const rawtx = { "test": "test" };
    const privatekey = '0x0000000000000000000000000000000000000000000000000000000000000002';

    const response = client.signTransaction(rawtx, privatekey);

    expect(signer.signTx).toHaveBeenCalledWith(rawtx, privatekey);

  });

  it('should call checkStatus correctly', async () => {

    const checkstatusparam = {
      "ok": true,
      "json": () => "response",
    };
    const result = await (client as any).checkStatus(checkstatusparam);

    expect(result).toBe("response");

  });

  it('should call checkStatus and throw error', async () => {

    const checkstatusparam = {
      "ok": false,
      "json": () => "response",
    };

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation((res) => Promise.resolve(res));
    const result = await (client as any).checkStatus(checkstatusparam);

    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(checkStatusSpy).toHaveBeenCalledWith(checkstatusparam);

  });

  it('should call errorHandler with error correctly', async () => {

    try {
      (client as any).errorHandler(new Error('testError'));
      fail('it should fail')
    } catch (error) {
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call errorHandler without error correctly', async () => {

    try {
      (client as any).errorHandler({ "body": { "message": "testErrorBody" } });
      fail('it should fail')
    } catch (error) {
      expect(error).toEqual(new Error('testErrorBody'));
    }

  });

  it('should call transfer correctly', async () => {

    const adaptTransferSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'adaptTransfer')
      .mockImplementation(() => Promise.resolve({ "test": "test" }));
    const signAndSendSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'signAndSend')
      .mockImplementation(() => Promise.resolve("ok!"));

    const result = await client.transfer('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', "100", options, 'whatever');

    expect(adaptTransferSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', "100", 'whatever');
    expect(signAndSendSpy).toHaveBeenCalledWith({ "test": "test" }, options);
    expect(result).toBe('ok!');

  });

  it('should call transfer and throw error', async () => {

    try {
      await client.transfer('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', "100");
      fail('it should fail');
    } catch (error) {
      expect(error).toBe('No key nor provider');
    }

  });

  it('should call adaptTransfer correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    const bodyFetch = {
      'from': '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      'to': '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
      'value': '100000',
      'data': 'test',
    };
    callParamFetch.body = JSON.stringify(bodyFetch);

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await (client as any).adaptTransfer(
      bodyFetch.from,
      bodyFetch.to,
      bodyFetch.value,
      bodyFetch.data
    );

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockTransfer',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call adaptTransfer and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    const bodyFetch = {
      'from': '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      'to': '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
      'value': '100000',
      'data': 'test',
    };
    callParamFetch.body = JSON.stringify(bodyFetch);

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await (client as any).adaptTransfer(
        bodyFetch.from,
        bodyFetch.to,
        bodyFetch.value,
        bodyFetch.data
      );
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockTransfer',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call tokenTransfer correctly', async () => {

    const adaptTokenTransferSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'adaptTokenTransfer')
      .mockImplementation(() => Promise.resolve({ "test": "test" }));
    const signAndSendSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'signAndSend')
      .mockImplementation(() => Promise.resolve("ok!"));

    const result = await client.tokenTransfer('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', 
    "100", '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c', options);

    expect(adaptTokenTransferSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', "100", '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
    expect(signAndSendSpy).toHaveBeenCalledWith({ "test": "test" }, options);
    expect(result).toBe('ok!');

  });

  it('should call tokenTransfer and throw error', async () => {

    try {
      await client.tokenTransfer('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', "100", '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
      fail('it should fail');
    } catch (error) {
      expect(error).toBe('No key nor provider');
    }

  });

  it('should call adaptTokenTransfer correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    const bodyFetch = {
      'from': '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      'to': '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
      'value':'100000',
    };
    callParamFetch.body = JSON.stringify(bodyFetch);
    const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await (client as any).adaptTokenTransfer(
      bodyFetch.from,
      bodyFetch.to,
      bodyFetch.value,
      smartContractAddress
    );

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockTransfer',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call adaptTokenTransfer and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    const bodyFetch = {
      'from': '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      'to': '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
      'value':'100000'
    };
    const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';
    callParamFetch.body = JSON.stringify(bodyFetch);

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await (client as any).adaptTokenTransfer(
        bodyFetch.from,
        bodyFetch.to,
        bodyFetch.value,
        smartContractAddress
      );
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockTransfer',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call signAndSend and sendTransactionTosign with signProvider correctly', async () => {

    const sendTransactionToSignSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'sendTransactionToSign')
      .mockImplementation(() => Promise.resolve('response'));

    options.signProvider = "providerTest";
    const result = await (client as any).signAndSend(hancockAdaptInvokeResponse, options);

    expect(sendTransactionToSignSpy).toHaveBeenCalledTimes(1);
    expect(sendTransactionToSignSpy).toHaveBeenCalledWith(hancockAdaptInvokeResponse.data, options.signProvider);
    expect(result).toBe('response');


  });

  it('should call signAndSend and signTransaction and sendSignedTransaction with privateKey correctly', async () => {

    const signTransactionSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'signTransaction')
      .mockImplementation(() => 'responseSignTransaction');
    const sendSignedTransactionSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'sendSignedTransaction')
      .mockImplementation(() => Promise.resolve('response'));

    const result = await (client as any).signAndSend(hancockAdaptInvokeResponse, options);

    expect(signTransactionSpy).toHaveBeenCalledTimes(1);
    expect(signTransactionSpy).toHaveBeenCalledWith(hancockAdaptInvokeResponse.data, options.privateKey);
    expect(sendSignedTransactionSpy).toHaveBeenCalledTimes(1);
    expect(sendSignedTransactionSpy).toHaveBeenCalledWith('responseSignTransaction');
    expect(result).toBe('response');

  });

  it('should call signAndSend without options correctly', async () => {

    const sendTransactionSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'sendTransaction')
      .mockImplementation(() => Promise.resolve('response'));

    const result = await (client as any).signAndSend(hancockAdaptInvokeResponse, {});

    expect(sendTransactionSpy).toHaveBeenCalledTimes(1);
    expect(sendTransactionSpy).toHaveBeenCalledWith(hancockAdaptInvokeResponse.data);
    expect(result).toBe('response');


  });

  it('should call encodeProtocol correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify(encodeBody);

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.encodeProtocol('transfer', '1000', '0xde8e772f0350e992ddef81bf8f51d94a8ea92123', 'dataTest', 'ethereum');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockEncode',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call encodeProtocol and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify(encodeBody);

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await client.encodeProtocol('transfer', '1000', '0xde8e772f0350e992ddef81bf8f51d94a8ea92123', 'dataTest', 'ethereum');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockEncode',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call decodeProtocol correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({ 'code': 'testCode' });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.decodeProtocol('testCode');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockDecode',
      callParamFetch
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call decodeProtocol and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({ 'code': 'testCode' });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
      .mockImplementation(() => { throw new Error('testError') });

    try {
      await client.decodeProtocol('testCode');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockDecode',
        callParamFetch
      );
      expect(error).toEqual(new Error('testError'));
    }

  });

  it('should call getTokenMetadata correctly', async () => {

    (fetch as any).once(JSON.stringify(response.GET_TOKEN_METADATA_RESPONSE));

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'checkStatus')
    .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.getTokenMetadata('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata'
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.GET_TOKEN_METADATA_RESPONSE.data);

  });

  it('should call getTokenMetadata and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.GET_TOKEN_METADATA_ERROR_RESPONSE), { status: 500 });

    const checkStatusSpy = jest.spyOn((HancockEthereumClient.prototype as any), 'errorHandler')
    .mockImplementation((res) => {throw new Error(JSON.parse(res).result.description)});

    try {
      await client.getTokenMetadata('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata'
      );
      expect(error).toEqual(new Error(response.GET_TOKEN_METADATA_ERROR_RESPONSE.result.description));
    }

  });





  it('should call subscribeToContract correctly', async () => {

    const response = client.subscribeToContract(['testContract']);

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addContract).toHaveBeenCalledWith(['testContract']);

  });

  it('should call subscribeToTransfer correctly', async () => {

    const response = client.subscribeToTransfer(['0x1234']);

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addTransfer).toHaveBeenCalledWith(['0x1234']);

  });

  it('should call subscribeToContract empty correctly', async () => {

    const response = client.subscribeToContract();

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addContract).toHaveBeenCalledWith([]);

  });

  it('should call subscribeToTransfer empty correctly', async () => {

    const response = client.subscribeToTransfer();

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addTransfer).toHaveBeenCalledWith([]);

  });

});