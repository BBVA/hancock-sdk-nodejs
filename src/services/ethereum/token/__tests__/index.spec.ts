import fetch from 'isomorphic-fetch';
import 'jest';
import { HancockEthereumTokenClient } from '..';
import * as response from '../../__mocks__/responses';
import * as common from '../../common';
import { HancockError, hancockErrorType } from '../../error';
import { HancockEthereumTransactionClient } from '../../transaction';
import * as errorUtils from '../../utils';

jest.mock('isomorphic-fetch');
jest.mock('../../socket');
jest.mock('../../utils');
jest.mock('../../signer');
jest.mock('../../common');

describe('ethereum client', async () => {

  let transactionClient: HancockEthereumTransactionClient;
  let client: HancockEthereumTokenClient;
  const errorFnMock = errorUtils.error as jest.Mock;
  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: {
      tokenRegister: '/mockToken/mockRegister',
      tokenTransfer: '/mockToken/__ADDRESS_OR_ALIAS__/mockTransfer',
      tokenTransferFrom: '/mockToken/__ADDRESS_OR_ALIAS__/mockTransferFrom',
      tokenBalance: '/mockToken/__ADDRESS_OR_ALIAS__/mockBalance/__ADDRESS__',
      tokenMetadata: '/mockToken/__ADDRESS_OR_ALIAS__/mockMetadata',
      tokenApprove: '/mockToken/__ADDRESS_OR_ALIAS__/mockApprove',
      tokenAllowance: '/mockToken/__ADDRESS_OR_ALIAS__/mockAllowance',
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
    client = new HancockEthereumTokenClient(config, transactionClient);

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

  describe('::tokenRegister', () => {

    it('should call tokenRegister correctly', async () => {

      (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
      callParamFetch.body = JSON.stringify({
        address: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        alias: 'contract-alias',
      });

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await client.tokenRegister('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

      expect(fetch).toHaveBeenCalledWith('genericHost:1genericBase/mockToken/mockRegister', callParamFetch);
      expect(checkStatusSpy).toHaveBeenCalled();
      expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

    });

    it('should call registerSmartContract and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
      callParamFetch.body = JSON.stringify({
        address: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        alias: 'contract-alias',
      });

      const throwedError = new HancockError(hancockErrorType.Api, '001', 500, 'testError');
      const checkStatusSpy = errorHandlerMock
        .mockImplementation(() => { throw throwedError; });

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

  describe('::getTokenMetadata', () => {

    it('should call getTokenMetadata correctly', async () => {

      (fetch as any).once(JSON.stringify(response.GET_TOKEN_METADATA_RESPONSE));

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await client.getTokenMetadata('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata',
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response.GET_TOKEN_METADATA_RESPONSE.data);

    });

    it('should call getTokenMetadata and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.GET_TOKEN_METADATA_ERROR_RESPONSE), { status: 500 });

      const checkStatusSpy = errorHandlerMock
        .mockImplementation((res) => { throw new HancockError(hancockErrorType.Api, '002', JSON.parse(res).result.code, JSON.parse(res).result.description); });

      try {
        await client.getTokenMetadata('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata',
        );
        expect(error).toEqual(new HancockError(hancockErrorType.Api, '002', 500, response.GET_TOKEN_METADATA_ERROR_RESPONSE.result.description));
      }

    });
  });

  describe('::getTokenMetadata', () => {

    it('should call getTokenBalance correctly', async () => {

      (fetch as any).once(JSON.stringify(response.GET_TOKEN_BALANCE_RESPONSE));

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await client.getTokenBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result.balance).toEqual(response.GET_TOKEN_BALANCE_RESPONSE.data.balance);

    });

    it('should call getTokenBalance and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.GET_TOKEN_BALANCE_ERROR_RESPONSE), { status: 400 });

      const checkStatusSpy = errorHandlerMock
        .mockImplementation((res) => { throw new HancockError(hancockErrorType.Api, '002', res.code, res.description); });

      try {
        await client.getTokenBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        );
        expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      }

    });

  });

  describe('::tokenTransfer', () => {

    it('should call tokenTransfer correctly', async () => {

      const adaptTokenTransferSpy = jest.spyOn((HancockEthereumTokenClient.prototype as any), 'adaptTokenTransfer')
        .mockImplementation(() => Promise.resolve({ test: 'test' }));
      const signTransactionAndSendSpy = jest.spyOn((transactionClient as any), 'signTransactionAndSend')
        .mockImplementation(() => Promise.resolve('ok!'));

      const result = await client.tokenTransfer('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c', options);

      // tslint:disable-next-line:max-line-length
      expect(adaptTokenTransferSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
      expect(signTransactionAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
      expect(result).toBe('ok!');

    });

    it('should call tokenTransfer and throw error', async () => {

      try {
        // tslint:disable-next-line:max-line-length
        await client.tokenTransfer('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
        fail('it should fail');
      } catch (error) {
        expect(errorFnMock).toHaveBeenCalledWith(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
        expect(error).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
      }

    });

    it('should call adaptTokenTransfer correctly', async () => {

      (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
      const bodyFetch = {
        from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        to: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        value: '100000',
      };
      callParamFetch.body = JSON.stringify(bodyFetch);
      const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await (client as any).adaptTokenTransfer(
        bodyFetch.from,
        bodyFetch.to,
        bodyFetch.value,
        smartContractAddress,
      );

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockTransfer',
        callParamFetch,
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

    });

    it('should call adaptTokenTransfer and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
      const bodyFetch = {
        from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        to: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        value: '100000',
      };
      const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';
      callParamFetch.body = JSON.stringify(bodyFetch);

      const checkStatusSpy = errorHandlerMock
        .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

      try {
        await (client as any).adaptTokenTransfer(
          bodyFetch.from,
          bodyFetch.to,
          bodyFetch.value,
          smartContractAddress,
        );
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockTransfer',
          callParamFetch,
        );
        expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
      }

    });

  });

  describe('::tokenTransferFrom', () => {

    it('should call tokenTransferFrom correctly', async () => {

      const adaptTokenTransferFromSpy = jest.spyOn((HancockEthereumTokenClient.prototype as any), 'adaptTokenTransferFrom')
        .mockImplementation(() => Promise.resolve({ test: 'test' }));

      const signTransactionAndSendSpy = jest.spyOn((transactionClient as any), 'signTransactionAndSend')
        .mockImplementation(() => Promise.resolve('ok!'));

      const result = await client.tokenTransferFrom(
        '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '100',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c',
        options,
      );

      expect(adaptTokenTransferFromSpy).toHaveBeenCalledWith(
        '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '100',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c',
      );
      expect(signTransactionAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
      expect(result).toBe('ok!');

    });

    it('should call tokenTransferFrom and throw error', async () => {

      try {
        await client.tokenTransferFrom(
          '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
          '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
          '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
          '100',
          '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c',
        );
        fail('it should fail');
      } catch (error) {
        expect(errorFnMock).toHaveBeenCalledWith(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
        expect(error).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
      }

    });

    it('should call adaptTokenTransferFrom correctly', async () => {

      (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
      const bodyFetch = {
        from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        sender: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        to: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        value: '100000',
      };
      callParamFetch.body = JSON.stringify(bodyFetch);
      const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await (client as any).adaptTokenTransferFrom(
        bodyFetch.from,
        bodyFetch.sender,
        bodyFetch.to,
        bodyFetch.value,
        smartContractAddress,
      );

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockTransferFrom',
        callParamFetch,
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

    });

    it('should call adaptTokenTransferFrom and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
      const bodyFetch = {
        from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        sender: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        to: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        value: '100000',
      };
      const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';
      callParamFetch.body = JSON.stringify(bodyFetch);

      const checkStatusSpy = errorHandlerMock
        .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

      try {
        await (client as any).adaptTokenTransferFrom(
          bodyFetch.from,
          bodyFetch.sender,
          bodyFetch.to,
          bodyFetch.value,
          smartContractAddress,
        );
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockTransferFrom',
          callParamFetch,
        );
        expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
      }

    });

  });

  describe('::tokenAllowance', () => {

    it('should call tokenAllowance correctly', async () => {

      const adaptTokenAllowanceSpy = jest.spyOn((HancockEthereumTokenClient.prototype as any), 'adaptTokenAllowance')
        .mockImplementation(() => Promise.resolve({ test: 'test' }));
      const signTransactionAndSendSpy = jest.spyOn((transactionClient as any), 'signTransactionAndSend')
        .mockImplementation(() => Promise.resolve('ok!'));

      const result = await client.tokenAllowance('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9215e', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c', options);

      // tslint:disable-next-line:max-line-length
      expect(adaptTokenAllowanceSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '0xde8e772f0350e992ddef81bf8f51d94a8ea9215e', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
      expect(signTransactionAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
      expect(result).toBe('ok!');

    });

    it('should call tokenAllowance and throw error', async () => {

      try {
        // tslint:disable-next-line:max-line-length
        await client.tokenAllowance('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '0xde8e772f0350e992ddef81bf8f51d94a8ea9215e', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
        fail('it should fail');
      } catch (error) {
        expect(errorFnMock).toHaveBeenCalledWith(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
        expect(error).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
      }

    });

    it('should call adaptTokenAllowance correctly', async () => {

      (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
      const bodyFetch = {
        from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        tokenOwner: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        spender: '0xde8e772f0350e992ddef81bf8f51d94a8ea9215e',
      };
      callParamFetch.body = JSON.stringify(bodyFetch);
      const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await (client as any).adaptTokenAllowance(
        bodyFetch.from,
        bodyFetch.tokenOwner,
        bodyFetch.spender,
        smartContractAddress,
      );

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockAllowance',
        callParamFetch,
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

    });

    it('should call adaptTokenAllowance and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
      const bodyFetch = {
        from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        tokenOwner: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        spender: '0xde8e772f0350e992ddef81bf8f51d94a8ea9215e',
      };
      const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';
      callParamFetch.body = JSON.stringify(bodyFetch);

      const checkStatusSpy = errorHandlerMock
        .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

      try {
        await (client as any).adaptTokenAllowance(
          bodyFetch.from,
          bodyFetch.tokenOwner,
          bodyFetch.spender,
          smartContractAddress,
        );
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockAllowance',
          callParamFetch,
        );
        expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
      }

    });
  });

  describe('::tokenApprove', () => {

    it('should call tokenApprove correctly', async () => {

      const adaptTokenApproveSpy = jest.spyOn((HancockEthereumTokenClient.prototype as any), 'adaptTokenApprove')
        .mockImplementation(() => Promise.resolve({ test: 'test' }));
      const signTransactionAndSendSpy = jest.spyOn((transactionClient as any), 'signTransactionAndSend')
        .mockImplementation(() => Promise.resolve('ok!'));

      const result = await client.tokenApprove('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c', options);

      // tslint:disable-next-line:max-line-length
      expect(adaptTokenApproveSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
      expect(signTransactionAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
      expect(result).toBe('ok!');

    });

    it('should call tokenApprove and throw error', async () => {

      try {
        // tslint:disable-next-line:max-line-length
        await client.tokenApprove('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
        fail('it should fail');
      } catch (error) {
        expect(errorFnMock).toHaveBeenCalledWith(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
        expect(error).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
      }

    });

    it('should call adaptTokenApprove correctly', async () => {

      (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
      const bodyFetch = {
        from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        spender: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        value: '100000',
      };
      callParamFetch.body = JSON.stringify(bodyFetch);
      const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await (client as any).adaptTokenApprove(
        bodyFetch.from,
        bodyFetch.spender,
        bodyFetch.value,
        smartContractAddress,
      );

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockApprove',
        callParamFetch,
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

    });

    it('should call adaptTokenApprove and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
      const bodyFetch = {
        from: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        spender: '0xde8e772f0350e992ddef81bf8f51d94a8ea92123',
        value: '100000',
      };
      const smartContractAddress = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c';
      callParamFetch.body = JSON.stringify(bodyFetch);

      const checkStatusSpy = errorHandlerMock
        .mockImplementation(() => { throw new HancockError(hancockErrorType.Api, '001', 500, 'testError'); });

      try {
        await (client as any).adaptTokenApprove(
          bodyFetch.from,
          bodyFetch.spender,
          bodyFetch.value,
          smartContractAddress,
        );
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockToken/' + smartContractAddress + '/mockApprove',
          callParamFetch,
        );
        expect(error).toEqual(new HancockError(hancockErrorType.Api, '001', 500, 'testError'));
      }

    });
  });

});
