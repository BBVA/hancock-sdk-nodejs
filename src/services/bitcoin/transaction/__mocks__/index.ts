// tslint:disable-next-line:variable-name
export const __HancockBitcoinTransactionServiceInstance__ = {
  send: jest.fn(),
  sendSigned: jest.fn(),
  sendToSignProvider: jest.fn(),
  subscribe: jest.fn(),
  sign: jest.fn(),
  signAndSend: jest.fn(),
};

// tslint:disable-next-line:variable-name
export const HancockBitcoinTransactionService = jest.fn().mockImplementation(() => __HancockBitcoinTransactionServiceInstance__);
