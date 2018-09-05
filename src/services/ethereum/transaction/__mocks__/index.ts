// tslint:disable-next-line:variable-name
export const __hancockEthereumTransactionClientInstance__ = {
  sendTransaction: jest.fn(),
  sendSignedTransaction: jest.fn(),
  sendTransactionToSignProvider: jest.fn(),
  subscribeToTransaction: jest.fn(),
  signTransaction: jest.fn(),
  signTransactionAndSend: jest.fn(),
};

// tslint:disable-next-line:variable-name
export const HancockEthereumTransactionClient = jest.fn().mockImplementation(() => __hancockEthereumTransactionClientInstance__);
