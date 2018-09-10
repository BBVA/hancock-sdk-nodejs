import fetch from 'isomorphic-fetch';
import 'jest';
import { HancockEthereumTransactionClient } from '..';
import { HancockAdaptInvokeResponse } from '../../..';
import * as response from '../../__mocks__/responses';
import * as common from '../../common';
import { HancockError, hancockErrorType } from '../../error';
import * as signer from '../../signer';
import * as socket from '../../socket';

jest.mock('isomorphic-fetch');
jest.mock('../../signer');
jest.mock('../../common');
jest.mock('../../socket');

describe('ethereum client', async () => {

  let client: HancockEthereumTransactionClient;
  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: {
      sendTx: '/mockSendTx',
      sendSignedTx: '/mockSendSignedTx',
      signTx: '/mockSignTx',
      events: '/mockEvents',
    },
  };
  let config: any;
  const configAdapter: any = genericConfig;
  const configWallet: any = genericConfig;
  const configBroker: any = genericConfig;
  let callParamFetch: any;
  let options: any;
  let hancockAdaptInvokeResponse: HancockAdaptInvokeResponse;

  const checkStatusMock: jest.Mock = common.checkStatus as any;
  const errorHandlerMock: jest.Mock = common.errorHandler as any;

  beforeEach(() => {
    config = {
      adapter: configAdapter,
      wallet: configWallet,
      broker: configBroker,
    };
    client = new HancockEthereumTransactionClient(config);

    callParamFetch = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'method',
        from: 'from',
        params: ['params'],
        action: 'send',
      }),
    };

    hancockAdaptInvokeResponse = {
      result: {
        code: 123,
        description: 'descriptionTest',
      },
      data: 'testData',
    };

    options = {
      privateKey: '0x0000000000000000000000000000000000000000000000000000000000000002',
    };

    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call send correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({ tx: { whatever: 'whatevervalue' } });

    const checkStatusSpy = checkStatusMock
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.send({ whatever: 'whatevervalue' });

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockSendTx',
      callParamFetch,
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call send and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({ tx: { whatever: 'whatevervalue' } });

    const checkStatusSpy = errorHandlerMock
      .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

    try {
      await client.send({ whatever: 'whatevervalue' });
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockSendTx',
        callParamFetch,
      );
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
    }

  });

  it('should call sendSigned correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({ tx: { whatever: 'whatevervalue' } });

    const checkStatusSpy = checkStatusMock
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.sendSigned({ whatever: 'whatevervalue' });

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockSendSignedTx',
      callParamFetch,
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call sendSigned and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({ tx: { whatever: 'whatevervalue' } });

    const checkStatusSpy = errorHandlerMock
      .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

    try {
      await client.sendSigned({ whatever: 'whatevervalue' });
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockSendSignedTx',
        callParamFetch,
      );
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
    }

  });

  it('should call sendToSignProvider correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({ rawTx: { whatever: 'whatevervalue' }, provider: 'provider' });

    const checkStatusSpy = checkStatusMock
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.sendToSignProvider({ whatever: 'whatevervalue' }, 'provider');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockSignTx',
      callParamFetch,
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call sendSigned and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({ rawTx: { whatever: 'whatevervalue' }, provider: 'provider' });

    const checkStatusSpy = errorHandlerMock
      .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

    try {
      await client.sendToSignProvider({ whatever: 'whatevervalue' }, 'provider');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockSignTx',
        callParamFetch,
      );
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
    }

  });

  it('should call sign correctly', async () => {

    const rawtx = '{\"test\":\"test\"}';
    const privatekey = '0x0000000000000000000000000000000000000000000000000000000000000002';

    client.sign(rawtx, privatekey);

    expect(signer.signTx).toHaveBeenCalledWith(JSON.parse(rawtx), privatekey);

  });

  it('should call sign without string correctly', async () => {

    const rawtx = { test: 'test' };
    const privatekey = '0x0000000000000000000000000000000000000000000000000000000000000002';

    client.sign(rawtx, privatekey);

    expect(signer.signTx).toHaveBeenCalledWith(rawtx, privatekey);

  });

  it('should call signAndSend and sendToSignProvider with signProvider correctly', async () => {

    const sendTransactionToSignProviderSpy = jest.spyOn((HancockEthereumTransactionClient.prototype as any), 'sendToSignProvider')
      .mockImplementation(() => Promise.resolve('response'));

    options.signProvider = 'providerTest';
    const result = await client.signAndSend(hancockAdaptInvokeResponse, options);

    expect(sendTransactionToSignProviderSpy).toHaveBeenCalledTimes(1);
    expect(sendTransactionToSignProviderSpy).toHaveBeenCalledWith(hancockAdaptInvokeResponse.data, options.signProvider);
    expect(result).toBe('response');

  });

  it('should call signAndSend and sign and sendSigned with privateKey correctly', async () => {

    const signTransactionSpy = jest.spyOn((HancockEthereumTransactionClient.prototype as any), 'sign')
      .mockImplementation(() => 'responseSignTransaction');
    const sendSignedTransactionSpy = jest.spyOn((HancockEthereumTransactionClient.prototype as any), 'sendSigned')
      .mockImplementation(() => Promise.resolve('response'));

    const result = await client.signAndSend(hancockAdaptInvokeResponse, options);

    expect(signTransactionSpy).toHaveBeenCalledTimes(1);
    expect(signTransactionSpy).toHaveBeenCalledWith(hancockAdaptInvokeResponse.data, options.privateKey);
    expect(sendSignedTransactionSpy).toHaveBeenCalledTimes(1);
    expect(sendSignedTransactionSpy).toHaveBeenCalledWith('responseSignTransaction');
    expect(result).toBe('response');

  });

  it('should call signAndSend without options correctly', async () => {

    const sendTransactionSpy = jest.spyOn((HancockEthereumTransactionClient.prototype as any), 'send')
      .mockImplementation(() => Promise.resolve('response'));

    const result = await (client as any).signAndSend(hancockAdaptInvokeResponse, {});

    expect(sendTransactionSpy).toHaveBeenCalledTimes(1);
    expect(sendTransactionSpy).toHaveBeenCalledWith(hancockAdaptInvokeResponse.data);
    expect(result).toBe('response');

  });

  it('should call subscribe correctly', async () => {
    // tslint:disable-next-line:no-shadowed-variable
    const response = client.subscribe(['0x1234']);

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addTransaction).toHaveBeenCalledWith(['0x1234']);

  });

  it('should call subscribe empty correctly', async () => {
    // tslint:disable-next-line:no-shadowed-variable
    const response = client.subscribe();

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addTransaction).toHaveBeenCalledWith([]);

  });
});
