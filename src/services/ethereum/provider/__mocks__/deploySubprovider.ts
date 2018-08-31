// tslint:disable-next-line:variable-name
export const __deploySubproviderInstance__ = {
  handleRequest: jest.fn().mockReturnThis(),
  addNonceAndSend: jest.fn().mockReturnThis(),
  subscribeToDeploy: jest.fn().mockReturnThis(),
  subscribeToTransaction: jest.fn().mockReturnThis(),
};

// tslint:disable-next-line:variable-name
export const DeploySubprovider = jest.fn().mockImplementation(() => __deploySubproviderInstance__);
