// tslint:disable-next-line:variable-name
export const __socketInstance__ = {
  on: jest.fn().mockImplementation((kind, callback) => {
    callback();
  }),
  watchContractEvent: jest.fn().mockReturnThis(),
  watchContractTransaction: jest.fn().mockReturnThis(),
  watchTransfer: jest.fn().mockReturnThis(),
  watchTransaction: jest.fn().mockReturnThis(),
};

// tslint:disable-next-line:variable-name
export const HancockSocket = jest.fn().mockImplementation(() => __socketInstance__);
