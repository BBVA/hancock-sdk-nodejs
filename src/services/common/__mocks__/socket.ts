// tslint:disable-next-line:variable-name
export const __socketInstance__ = {
  on: jest.fn().mockImplementation((kind, callback) => {
    callback();
  }),
  addContract: jest.fn().mockReturnThis(),
  addTransfer: jest.fn().mockReturnThis(),
  addTransaction: jest.fn().mockReturnThis(),
};

// tslint:disable-next-line:variable-name
export const HancockSocket = jest.fn().mockImplementation(() => __socketInstance__);
