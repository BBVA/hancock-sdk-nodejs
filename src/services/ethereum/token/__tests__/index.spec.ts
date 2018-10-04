import fetch from 'isomorphic-fetch';
import 'jest';
import { HancockEthereumTokenService } from '..';
import * as common from '../../../common';
import { HancockError, hancockErrorType } from '../../../error';
import * as response from '../../__mocks__/responses';
import { HancockEthereumTransactionService } from '../../transaction';

jest.mock('isomorphic-fetch');
jest.mock('../../socket');
jest.mock('../../utils');
jest.mock('../../signer');
jest.mock('../../../common');

describe('ethereum client', async () => {

  let transactionService: HancockEthereumTransactionService;
  let client: HancockEthereumTokenService;
  const errorFnMock = common.error as jest.Mock;
  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: {
      token: {
        register: '/mockToken/mockRegister',
        transfer: '/mockToken/__ADDRESS_OR_ALIAS__/mockTransfer',
        transferFrom: '/mockToken/__ADDRESS_OR_ALIAS__/mockTransferFrom',
        balance: '/mockToken/__ADDRESS_OR_ALIAS__/mockBalance/__ADDRESS__',
        metadata: '/mockToken/__ADDRESS_OR_ALIAS__/mockMetadata',
        approve: '/mockToken/__ADDRESS_OR_ALIAS__/mockApprove',
        allowance: '/mockToken/__ADDRESS_OR_ALIAS__/mockAllowance',
      },
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
    transactionService = new HancockEthereumTransactionService(config);
    client = new HancockEthereumTokenService(config, transactionService);

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

  describe('::register', () => {

    it('should call register correctly', async () => {

      (fetch as any).once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE));
      callParamFetch.body = JSON.stringify({
        address: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        alias: 'contract-alias',
      });

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await client.register('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

      expect(fetch).toHaveBeenCalledWith('genericHost:1genericBase/mockToken/mockRegister', callParamFetch);
      expect(checkStatusSpy).toHaveBeenCalled();
      expect(result).toEqual(response.SC_INVOKE_ADAPT_RESPONSE);

    });

    it('should call register and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.ERROR));
      callParamFetch.body = JSON.stringify({
        address: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        alias: 'contract-alias',
      });

      const throwedError = new HancockError(hancockErrorType.Api, '001', 500, 'testError');
      const checkStatusSpy = errorHandlerMock
        .mockImplementation(() => { throw throwedError; });

      try {

        await client.register('contract-alias', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
        fail('it should fail');

      } catch (error) {

        expect(fetch).toHaveBeenCalledWith('genericHost:1genericBase/mockToken/mockRegister', callParamFetch);
        expect(checkStatusSpy).toHaveBeenCalled();
        expect(error).toEqual(throwedError);

      }

    });

  });

  describe('::getMetadata', () => {

    it('should call getMetadata correctly', async () => {

      (fetch as any).once(JSON.stringify(response.GET_TOKEN_METADATA_RESPONSE));

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await client.getMetadata('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata',
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response.GET_TOKEN_METADATA_RESPONSE.data);

    });

    it('should call getMetadata and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.GET_TOKEN_METADATA_ERROR_RESPONSE), { status: 500 });

      const checkStatusSpy = errorHandlerMock
        .mockImplementation((res) => { throw new HancockError(hancockErrorType.Api, '002', JSON.parse(res).result.code, JSON.parse(res).result.description); });

      try {
        await client.getMetadata('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockMetadata',
        );
        expect(error).toEqual(new HancockError(hancockErrorType.Api, '002', 500, response.GET_TOKEN_METADATA_ERROR_RESPONSE.result.description));
      }

    });
  });

  describe('::getMetadata', () => {

    it('should call getBalance correctly', async () => {

      (fetch as any).once(JSON.stringify(response.GET_TOKEN_BALANCE_RESPONSE));

      const checkStatusSpy = checkStatusMock
        .mockImplementation((res) => Promise.resolve(res.json()));

      const result = await client.getBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');

      expect(fetch).toHaveBeenCalledWith(
        'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      );
      expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      expect(result.balance).toEqual(response.GET_TOKEN_BALANCE_RESPONSE.data.balance);

    });

    it('should call getBalance and throw error', async () => {

      (fetch as any).mockRejectOnce(JSON.stringify(response.GET_TOKEN_BALANCE_ERROR_RESPONSE), { status: 400 });

      const checkStatusSpy = errorHandlerMock
        .mockImplementation((res) => { throw new HancockError(hancockErrorType.Api, '002', res.code, res.description); });

      try {
        await client.getBalance('0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d');
        fail('it should fail');
      } catch (error) {
        expect(fetch).toHaveBeenCalledWith(
          'genericHost:1genericBase/mockToken/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d/mockBalance/0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        );
        expect(checkStatusSpy).toHaveBeenCalledTimes(1);
      }

    });

  });

  describe('::transfer', () => {

    it('should call transfer correctly', async () => {

      const adaptTransferSpy = jest.spyOn((HancockEthereumTokenService.prototype as any), 'adaptSend')
        .mockImplementation(() => Promise.resolve({data: { test: 'test' }}));
      const signTransactionAndSendSpy = jest.spyOn((transactionService as any), 'signAndSend')
        .mockImplementation(() => Promise.resolve('ok!'));

      const result = await client.transfer('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c', options);

      // tslint:disable-next-line:max-line-length
      expect(adaptTransferSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
      expect(signTransactionAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
      expect(result).toBe('ok!');

    });

    it('should call transfer and throw error', async () => {

      try {
        // tslint:disable-next-line:max-line-length
        await client.transfer('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
        fail('it should fail');
      } catch (error) {
        expect(errorFnMock).toHaveBeenCalledWith(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
        expect(error).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
      }

    });

    it('should call adaptSend correctly', async () => {

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

      const result = await (client as any).adaptSend(
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

    it('should call adaptSend and throw error', async () => {

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
        await (client as any).adaptSend(
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

  describe('::transferFrom', () => {

    it('should call transferFrom correctly', async () => {

      const adaptTransferFromSpy = jest.spyOn((HancockEthereumTokenService.prototype as any), 'adaptTransferFrom')
        .mockImplementation(() => Promise.resolve({data: { test: 'test' }}));

      const signTransactionAndSendSpy = jest.spyOn((transactionService as any), 'signAndSend')
        .mockImplementation(() => Promise.resolve('ok!'));

      const result = await client.transferFrom(
        '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '100',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c',
        options,
      );

      expect(adaptTransferFromSpy).toHaveBeenCalledWith(
        '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea12345',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '100',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c',
      );
      expect(signTransactionAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
      expect(result).toBe('ok!');

    });

    it('should call transferFrom and throw error', async () => {

      try {
        await client.transferFrom(
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

    it('should call adaptTransferFrom correctly', async () => {

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

      const result = await (client as any).adaptTransferFrom(
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

    it('should call adaptTransferFrom and throw error', async () => {

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
        await (client as any).adaptTransferFrom(
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

  describe('::allowance', () => {

    it('should call allowance correctly', async () => {

      const adaptAllowanceSpy = jest.spyOn((HancockEthereumTokenService.prototype as any), 'adaptAllowance')
        .mockImplementation(() => Promise.resolve({data: { test: 'test' }}));
      const signTransactionAndSendSpy = jest.spyOn((transactionService as any), 'signAndSend')
        .mockImplementation(() => Promise.resolve('ok!'));

      const result = await client.allowance('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '0xde8e772f0350e992ddef81bf8f51d94a8ea9215e', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c', options);

      // tslint:disable-next-line:max-line-length
      expect(adaptAllowanceSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '0xde8e772f0350e992ddef81bf8f51d94a8ea9215e', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
      expect(signTransactionAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
      expect(result).toBe('ok!');

    });

    it('should call allowance and throw error', async () => {

      try {
        // tslint:disable-next-line:max-line-length
        await client.allowance('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '0xde8e772f0350e992ddef81bf8f51d94a8ea9215e', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
        fail('it should fail');
      } catch (error) {
        expect(errorFnMock).toHaveBeenCalledWith(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
        expect(error).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
      }

    });

    it('should call adaptAllowance correctly', async () => {

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

      const result = await (client as any).adaptAllowance(
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

    it('should call adaptAllowance and throw error', async () => {

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
        await (client as any).adaptAllowance(
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

  describe('::approve', () => {

    it('should call approve correctly', async () => {

      const adaptApproveSpy = jest.spyOn((HancockEthereumTokenService.prototype as any), 'adaptApprove')
        .mockImplementation(() => Promise.resolve({data: { test: 'test' }}));
      const signTransactionAndSendSpy = jest.spyOn((transactionService as any), 'signAndSend')
        .mockImplementation(() => Promise.resolve('ok!'));

      const result = await client.approve('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
        '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c', options);

      // tslint:disable-next-line:max-line-length
      expect(adaptApproveSpy).toHaveBeenCalledWith('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
      expect(signTransactionAndSendSpy).toHaveBeenCalledWith({ test: 'test' }, options);
      expect(result).toBe('ok!');

    });

    it('should call approve and throw error', async () => {

      try {
        // tslint:disable-next-line:max-line-length
        await client.approve('0xde8e772f0350e992ddef81bf8f51d94a8ea12345', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d', '100', '0xde8e772f0350e992ddef81bf8f51d94a8ea9216c');
        fail('it should fail');
      } catch (error) {
        expect(errorFnMock).toHaveBeenCalledWith(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
        expect(error).toEqual(new HancockError(hancockErrorType.Internal, '002', 500, 'No key nor provider'));
      }

    });

    it('should call adaptApprove correctly', async () => {

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

      const result = await (client as any).adaptApprove(
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

    it('should call adaptApprove and throw error', async () => {

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
        await (client as any).adaptApprove(
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
