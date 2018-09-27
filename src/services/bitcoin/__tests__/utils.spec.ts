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
  it('should call isAddressAny correctly', async () => {

    const response = utils.isAddressAny('142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx', '142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx');
    expect(response).toBeTruthy();
  });
  it('should call isAddress correctly', async () => {

    const response = utils.isAddress('142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx');
    expect(response).toBeTruthy();
  });

  it('should call isAddress correctly and return false', async () => {

    const response = utils.isAddress('0xde8e772f0350e992ddef818ea92123');
    expect(response).toBeFalsy();
  });

  it('should call isAlias correctly', async () => {

    const response = utils.isAlias('contractAlias');
    expect(response).toBeTruthy();
  });

  it('should call isAlias correctly and return false', async () => {

    const response = utils.isAlias('142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx');
    expect(response).toBeFalsy();
  });

  it('should call normalizeAddress correctly', async () => {

    const response = utils.normalizeAddress('142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx');
    expect(response).toBe('142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx');
  });

  it('should call normalizeAddress correctly and return address modified', async () => {

    const response = utils.normalizeAddress('17MpqPGHrEcUqHdwtyViwrWgLvFGho7mdh');
    expect(response).toBe('17MpqPGHrEcUqHdwtyViwrWgLvFGho7mdh');
  });

  it('should call normalizeAlias correctly', async () => {

    const response = utils.normalizeAlias('ContractAddress');
    expect(response).toBe('contract-address');
  });

  it('should call normalizeAddressOrAlias correctly and call normalizeAddress', async () => {

    const response = utils.normalizeAddressOrAlias('142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx');
    expect(response).toBe('142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx');
  });

  it('should call normalizeAddressOrAlias correctly and call normalizeAlias', async () => {

    const response = utils.normalizeAddressOrAlias('ContractAddress');
    expect(response).toBe('contract-address');
  });

});
