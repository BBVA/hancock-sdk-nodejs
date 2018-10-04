// tslint:disable-next-line:variable-name
export const __HancockEthereumTransactionServiceInstance__ = {
  send: jest.fn(),
  sendSigned: jest.fn(),
  sendToSignProvider: jest.fn(),
  subscribe: jest.fn(),
  sign: jest.fn(),
  signAndSend: jest.fn(),
};

// tslint:disable-next-line:variable-name
export const HancockEthereumTransactionService = jest.fn().mockImplementation(() => __HancockEthereumTransactionServiceInstance__);
