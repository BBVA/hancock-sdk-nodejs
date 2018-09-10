// tslint:disable-next-line:variable-name
export const __hancockEthereumTransactionClientInstance__ = {
  send: jest.fn(),
  sendSigned: jest.fn(),
  sendToSignProvider: jest.fn(),
  subscribe: jest.fn(),
  sign: jest.fn(),
  signAndSend: jest.fn(),
};

// tslint:disable-next-line:variable-name
export const HancockEthereumTransactionClient = jest.fn().mockImplementation(() => __hancockEthereumTransactionClientInstance__);
