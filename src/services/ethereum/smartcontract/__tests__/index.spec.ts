import fetch from 'isomorphic-fetch';
import 'jest';
import { HancockEthereumSmartContractClient } from '..';
import * as response from '../../__mocks__/responses';
import * as common from '../../common';
import { HancockError, hancockErrorType } from '../../error';
import * as socket from '../../socket';
import { HancockEthereumTransactionClient } from '../../transaction';
import * as errorUtils from '../../utils';

jest.mock('isomorphic-fetch');
jest.mock('../../socket');
jest.mock('../../utils');
jest.mock('../../signer');
jest.mock('../../common');
jest.mock('../../transaction');

describe('HancockEthereumSmartContractClient', async () => {

  let transactionClient: HancockEthereumTransactionClient;
  let client: HancockEthereumSmartContractClient;

  const errorFnMock = errorUtils.error as jest.Mock;
  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: {
      invoke: '/mockInvoke/__ADDRESS_OR_ALIAS__',
      register: '/mockRegister',
      events: '/mockEvents',
    },
  };
  let config: any;
  const configAdapter: any = genericConfig;
  const configWallet: any = genericConfig;
  const configBroker: any = genericConfig;
  let callParamFetch: any;
  let options: any;

  const checkStatusMock: jest.Mock = common.checkStatus as any;
  const errorHandlerMock: jest.Mock = common.errorHandler as any;

  beforeEach(() => {
    config = {
      adapter: configAdapter,
      wallet: configWallet,
      broker: configBroker,
    };
    transactionClient = new HancockEthereumTransactionClient(config);
    client = new HancockEthereumSmartContractClient(config, transactionClient);

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

    options = {
      privateKey: '0x0000000000000000000000000000000000000000000000000000000000000002',
    };

    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call invoke correctly', async () => {

    const adaptSpy = jest
      .spyOn((HancockEthereumSmartContractClient.prototype as any), 'adaptInvoke')
      .mockImplementation(() => Promise.resolve({ data: 'whatever' }));

    const signTransactionAndSendSpy = jest
      .spyOn(transactionClient as any, 'signAndSend')
      .mockImplementation(() => Promise.resolve('whatever'));

    await client.invoke('contractAddressOrAlias', 'method', ['params'], 'from', options);

    expect(adaptSpy).toHaveBeenCalledWith('contractAddressOrAlias', 'method', ['params'], 'from');
    expect(signTransactionAndSendSpy).toHaveBeenCalledWith('whatever', options);

  });

  it('should call invoke and throw reject', async () => {

    try {
      await client.invoke('contractAddressOrAlias', 'method', ['params'], 'from');
      fail('it should fail');
    } catch (error) {
      expect(errorFnMock).toHaveBeenCalledWith(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
      expect(error).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
    }

  });

  it('should call call correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({
      method: 'method',
      from: 'from',
      params: ['params'],
      action: 'call',
    });

    const checkStatusSpy = checkStatusMock
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.call('contractAddressOrAlias', 'method', ['params'], 'from');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockInvoke/contractAddressOrAlias',
      callParamFetch,
    );

    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call call and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({
      method: 'method',
      from: 'from',
      params: ['params'],
      action: 'call',
    });

    const checkStatusSpy = errorHandlerMock
      .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

    try {
      await client.call('contractAddressOrAlias', 'method', ['params'], 'from');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockInvoke/contractAddressOrAlias',
        callParamFetch,
      );
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
    }

  });

  it('should call adaptInvoke correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));

    const checkStatusSpy = checkStatusMock
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await (client as any).adaptInvoke('contractAddressOrAlias', 'method', ['params'], 'from');

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockInvoke/contractAddressOrAlias',
      callParamFetch,
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call adaptInvoke and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));

    const checkStatusSpy = errorHandlerMock
      .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

    try {
      await (client as any).adaptInvoke('contractAddressOrAlias', 'method', ['params'], 'from');
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockInvoke/contractAddressOrAlias',
        callParamFetch,
      );
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
    }

  });

  it('should call register correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    callParamFetch.body = JSON.stringify({
      address: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      alias: 'contract-alias',
      abi: ['abi'],
    });

    const checkStatusSpy = checkStatusMock
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await client.register('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', ['abi']);

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockRegister',
      callParamFetch,
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call register and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    callParamFetch.body = JSON.stringify({
      address: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      alias: 'contract-alias',
      abi: ['abi'],
    });

    const checkStatusSpy = errorHandlerMock
      .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

    try {
      await client.register('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', ['abi']);
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockRegister',
        callParamFetch,
      );
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
    }

  });

  it('should call subscribe correctly', async () => {

    // tslint:disable-next-line:no-shadowed-variable
    const response = client.subscribe(['testContract']);

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addContract).toHaveBeenCalledWith(['testContract']);

  });

  it('should call subscribe empty correctly', async () => {
    // tslint:disable-next-line:no-shadowed-variable
    const response = client.subscribe();

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addContract).toHaveBeenCalledWith([]);

  });

});
