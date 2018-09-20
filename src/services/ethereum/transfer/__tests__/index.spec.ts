import 'jest';

import fetch from 'isomorphic-fetch';
import { HancockEthereumTransferClient } from '..';
import * as common from '../../../common';
import { HancockError, hancockErrorType } from '../../../error';
import * as response from '../../__mocks__/responses';
import * as socket from '../../socket';
import { HancockEthereumTransactionClient } from '../../transaction';

jest.mock('isomorphic-fetch');
jest.mock('../../socket');
jest.mock('../../utils');
jest.mock('../../signer');
jest.mock('../../../common');

describe('ethereum client', async () => {

  let transactionClient: HancockEthereumTransactionClient;
  let client: HancockEthereumTransferClient;
  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: {
      balance: '/mockBalance/__ADDRESS__',
      events: '/mockEvents',
      transfer: '/mockTransfer',
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
    client = new HancockEthereumTransferClient(config, transactionClient);

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

  it('should call transfer correctly', async () => {

    const adaptTransferSpy = jest
      .spyOn((HancockEthereumTransferClient.prototype as any), 'adaptSend')
      .mockImplementation(() => Promise.resolve({data: { test: 'test' }}));

    const signAndSendSpy = jest
      .spyOn(transactionClient as any, 'signAndSend')
      .mockImplementation(() => Promise.resolve('ok!'));

    // tslint:disable-next-line:max-line-length
    const result = await client.send('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', options, 'whatever');

    // tslint:disable-next-line:max-line-length
    expect(adaptTransferSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', 'whatever');
    expect(signAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
    expect(result).toBe('ok!');

  });

  it('should call transfer and throw error', async () => {

    try {
      await client.send('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100');
      fail('it should fail');
    } catch (error) {
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '002', 500, 'No key nor provider'));
    }

  });

  it('should call adaptSend correctly', async () => {

    (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
    const bodyFetch = {
      from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      to: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
      value: '100000',
      data: 'test',
    };
    callParamFetch.body = JSON.stringify(bodyFetch);

    const checkStatusSpy = checkStatusMock
      .mockImplementation((res) => Promise.resolve(res.json()));

    const result = await (client as any).adaptSend(
      bodyFetch.from,
      bodyFetch.to,
      bodyFetch.value,
      bodyFetch.data,
    );

    expect(fetch).toHaveBeenCalledWith(
      'genericHost:1genericBase/mockTransfer',
      callParamFetch,
    );
    expect(checkStatusSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

  });

  it('should call adaptSend and throw error', async () => {

    (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
    const bodyFetch = {
      from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      to: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
      value: '100000',
      data: 'test',
    };
    callParamFetch.body = JSON.stringify(bodyFetch);

    const checkStatusSpy = errorHandlerMock
      .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

    try {
      await (client as any).adaptSend(
        bodyFetch.from,
        bodyFetch.to,
        bodyFetch.value,
        bodyFetch.data,
      );
      fail('it should fail');
    } catch (error) {
      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockTransfer',
        callParamFetch,
      );
      expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
    }

  });

  it('should call subscribe correctly', async () => {
    // tslint:disable-next-line:no-shadowed-variable
    const response = client.subscribe(['0x1234']);

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addTransfer).toHaveBeenCalledWith(['0x1234']);

  });

  it('should call subscribe empty correctly', async () => {
    // tslint:disable-next-line:no-shadowed-variable
    const response = client.subscribe();

    expect(socket.HancockEthereumSocket).toHaveBeenCalledTimes(1);
    expect(response.on).toHaveBeenCalledTimes(1);
    expect(response.addTransfer).toHaveBeenCalledWith([]);

  });

});
