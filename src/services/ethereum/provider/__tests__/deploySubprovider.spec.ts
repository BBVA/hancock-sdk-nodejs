import 'jest';
import { DeploySubprovider } from '../deploySubprovider';

describe('DeploySubProvider', async () => {

  let hancockCli: any;
  let next: any;
  let end: any;
  let payload: any;
  let socket: any;
  let message: any;
  let data: any;

  beforeEach(() => {

    data = {
      result: '0x1c',
    };

    message = {
      body: {
        hash: 'testHash',
        to: null,
      },
    };

    socket = {
      closeSocket: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation((kind, cb) => cb(message)),
    };

    hancockCli = {
      sendTransactionToSignProvider: jest.fn().mockResolvedValue('okSend'),
      subscribeToTransaction: jest.fn().mockReturnValue(socket),
    };

    next = jest.fn().mockReturnThis();
    end = jest.fn().mockReturnThis();
    payload = {
      method : 'eth_sendTransaction',
      params: [
        {
          from: 'testFrom',
          to: 'testTo',
        },
      ],
    };

    jest.restoreAllMocks();

  });

  it('should call constructor correctly', async () => {

    const testProvider = new DeploySubprovider('test', hancockCli);

    expect(testProvider.hancockClient).toEqual(hancockCli);
    expect(testProvider.provider).toBe('test');

  });

  describe('handleRequest', async () => {

    it('should call handleRequest correctly with sendTransaction', async () => {

      const testProvider = new DeploySubprovider('test', hancockCli);
      const emitPayloadSpy = jest.spyOn((DeploySubprovider.prototype as any), 'emitPayload')
        .mockImplementation((obj, cb) => cb(undefined, {test: 'test'}));
      const addNonceAndSendSpy = jest.spyOn((DeploySubprovider.prototype as any), 'addNonceAndSend')
        .mockImplementation(() => 'addNonceAndSendSpy');

      testProvider.handleRequest(payload, next, end);

      expect(emitPayloadSpy).toHaveBeenCalledTimes(1);
      expect(addNonceAndSendSpy).toHaveBeenCalledWith({test: 'test'}, payload.params[0], end);

    });

    it('should call handleRequest correctly with sendTransaction and end with error', async () => {

      const testProvider = new DeploySubprovider('test', hancockCli);
      const emitPayloadSpy = jest.spyOn((DeploySubprovider.prototype as any), 'emitPayload')
        .mockImplementation((obj, cb) => cb({test: 'test'}, undefined));
      const addNonceAndSendSpy = jest.spyOn((DeploySubprovider.prototype as any), 'addNonceAndSend')
        .mockImplementation(() => 'addNonceAndSendSpy');

      testProvider.handleRequest(payload, next, end);

      expect(emitPayloadSpy).toHaveBeenCalledTimes(1);
      expect(addNonceAndSendSpy).not.toHaveBeenCalled();
      expect(end).toHaveBeenCalledWith(null, null);

    });

    it('should call handleRequest and next', async () => {

      payload.method = 'whatever';

      const testProvider = new DeploySubprovider('test', hancockCli);

      testProvider.handleRequest(payload, next, end);

      expect(next).toHaveBeenCalledTimes(1);
    });

  });

  describe('addNonceAndSend', async () => {

    it('should call addNonceAndSend correctly', async () => {

      const subscribeToTransactionSpy = jest.spyOn((DeploySubprovider.prototype as any), 'subscribeToTransaction')
        .mockImplementation(() => 'socketTest');

      const testProvider = new DeploySubprovider('test', hancockCli);

      (testProvider as any).addNonceAndSend(data, payload.params[0], end);

      expect(hancockCli.sendTransactionToSignProvider).toHaveBeenCalledWith(payload.params[0], 'test');
      expect(subscribeToTransactionSpy).toHaveBeenCalledWith([payload.params[0].from], end, payload.params[0].to == null);

    });

    it('should call addNonceAndSend and catch', async () => {

      hancockCli.sendTransactionToSignProvider = jest.fn().mockRejectedValue('badSend');
      const subscribeToTransactionSpy = jest.spyOn((DeploySubprovider.prototype as any), 'subscribeToTransaction')
        .mockReturnValue(socket);

      const testProvider = new DeploySubprovider('test', hancockCli);

      (testProvider as any).addNonceAndSend(data, payload.params[0], end);

      expect(hancockCli.sendTransactionToSignProvider).toHaveBeenCalledWith(payload.params[0], 'test');
      expect(subscribeToTransactionSpy).toHaveBeenCalledWith([payload.params[0].from], end, payload.params[0].to == null);

    });

  });

  describe('subscribeToTransaction', async () => {

    it('should call subscribeToTransaction correctly', async () => {

      const testProvider = new DeploySubprovider('test', hancockCli);

      (testProvider as any).subscribeToTransaction(payload, end, true);

      expect(hancockCli.subscribeToTransaction).toHaveBeenCalledTimes(1);
      expect(end).toHaveBeenCalledWith(null, message.body.hash);

    });

    it('should call subscribeToTransaction correctly with deploy = false', async () => {

      const testProvider = new DeploySubprovider('test', hancockCli);

      (testProvider as any).subscribeToTransaction(payload, end, false);

      expect(hancockCli.subscribeToTransaction).toHaveBeenCalledTimes(1);
      expect(end).toHaveBeenCalledWith(null, message.body.hash);

    });

    it('should call subscribeToTransaction correctly with to 0x0000..0', async () => {

      const testProvider = new DeploySubprovider('test', hancockCli);
      message.body.to = '0x0000000000000000000000000000000000000000';

      (testProvider as any).subscribeToTransaction(payload, end, true);

      expect(hancockCli.subscribeToTransaction).toHaveBeenCalledTimes(1);
      expect(end).toHaveBeenCalledWith(null, message.body.hash);

    });

  });

});
