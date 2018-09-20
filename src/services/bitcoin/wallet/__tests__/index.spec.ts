import { BigNumber } from 'bignumber.js';
import fetch from 'isomorphic-fetch';
import 'jest';
import { HancockBitcoinWalletClient } from '..';
import * as common from '../../../common';
import { HancockError, hancockErrorType } from '../../../error';
import { hancockWalletError } from '../../../error';
import * as response from '../../__mocks__/responses';
import * as signer from '../../signer';

jest.mock('isomorphic-fetch');
jest.mock('../../utils');
jest.mock('../../../common');
jest.mock('../../signer');

describe('HancockBitcoinWalletClient', async () => {

  let client: HancockBitcoinWalletClient;
  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: {
      encode: '/mockEncode',
      decode: '/mockDecode',
      balance: '/mockBalance/__ADDRESS__',
    },
  };
  let config: any;
  const configAdapter: any = genericConfig;
  const configWallet: any = genericConfig;
  const configBroker: any = genericConfig;
  let callParamFetch: any;
  let encodeBody: any;

  const checkStatusMock: jest.Mock = common.checkStatus as any;
  const errorHandlerMock: jest.Mock = common.errorHandler as any;

  beforeEach(() => {
    config = {
      adapter: configAdapter,
      wallet: configWallet,
      broker: configBroker,
    };

    client = new HancockBitcoinWalletClient(config);

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

    encodeBody = {
      action: 'transfer',
      body: {
        value: '1000',
        to: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        data: 'dataTest',
      },
      dlt: 'bitcoin',
    };

    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('::getBalance', () => {

    it('should call getBalance correctly', async () => {

      (fetch as any).once(JSON.stringify(response.GET_BALANCE_RESPONSE));

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await client.getBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(new BigNumber(response.GET_BALANCE_RESPONSE.data.balance));

    });

    it('should call getBalance and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.GET_BALANCE_ERROR_RESPONSE), { status: 400 });

      const checkStatusSpy = errorHandlerMock
        .mockImplementation((res) => { throw new HancockError(hancockErrorType.Api, '002', res.code, res.description); });

      try {
        const result = await client.getBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        );
        expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      }

    });
  });

  describe('::generate', () => {

    it('should call generateWallet correctly', async () => {

      client.generate();

      expect(signer.generateWallet).toHaveBeenCalledTimes(1);

    });

    it('should fail calling generateWallet if there is an error generating the wallet', async () => {

      (signer.generateWallet as jest.Mock).mockImplementationOnce(() => { throw new Error('Boom!'); });

      try {

        client.generate();
        fail('it should fail');

      } catch (e) {

        expect(e).toEqual(hancockWalletError);

      }

    });

  });

});
