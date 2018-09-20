import 'jest';
import * as utils from '../utils';

describe('utils', async () => {

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should call isEmptyAny correctly', async () => {

    const response = utils.isEmptyAny('address', 'address');
    expect(response).toBeFalsy();
  });
  it('should call isEmpty correctly', async () => {

    const response = utils.isEmpty('address');
    expect(response).toBeFalsy();
  });

  it('should call normalizeAlias correctly', async () => {

    const response = utils.normalizeAlias('ContractAddress');
    expect(response).toBe('contract-address');
  });

});
