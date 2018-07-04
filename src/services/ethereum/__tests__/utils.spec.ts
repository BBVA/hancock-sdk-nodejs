import 'jest';
import * as utils from '../utils';
import { exec } from 'child_process';


describe('utils', async () => {

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should call isAddress correctly', async () => {

    const response = utils.isAddress('0xde8e772f0350e992ddef81bf8f51d94a8ea92123');
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

    const response = utils.isAlias('0xde8e772f0350e992ddef81bf8f51d94a8ea92123');
    expect(response).toBeFalsy();
  });

  it('should call normalizeAddress correctly', async () => {

    const response = utils.normalizeAddress('0xde8e772f0350e992ddef81bf8f51d94a8ea92123');
    expect(response).toBe('0xde8e772f0350e992ddef81bf8f51d94a8ea92123');
  });

  it('should call normalizeAddress correctly and return address modified', async () => {

    const response = utils.normalizeAddress('de8e772f0350e992ddef81bf8f51d94a8ea92123');
    expect(response).toBe('0xde8e772f0350e992ddef81bf8f51d94a8ea92123');
  });

  it('should call normalizeAlias correctly', async () => {

    const response = utils.normalizeAlias('ContractAddress');
    expect(response).toBe('contract-address');
  });
  
  it('should call normalizeAddressOrAlias correctly and call normalizeAddress', async () => {

    const response = utils.normalizeAddressOrAlias('0xde8e772f0350e992ddef81bf8f51d94a8ea92123');
    expect(response).toBe('0xde8e772f0350e992ddef81bf8f51d94a8ea92123');
  });

  it('should call normalizeAddressOrAlias correctly and call normalizeAlias', async () => {

    const response = utils.normalizeAddressOrAlias('ContractAddress');
    expect(response).toBe('contract-address');
  });
  
});