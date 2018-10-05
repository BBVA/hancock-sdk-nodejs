// tslint:disable-next-line:variable-name
export const __HancockTransactionServiceInstance__ = {
  send: jest.fn(),
  sendSigned: jest.fn(),
  sendToSignProvider: jest.fn(),
  subscribe: jest.fn(),
  sign: jest.fn(),
  signAndSend: jest.fn(),
};

// tslint:disable-next-line:variable-name
export const HancockTransactionService = jest.fn().mockImplementation(() => __HancockTransactionServiceInstance__);
