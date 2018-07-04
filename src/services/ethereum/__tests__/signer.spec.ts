import 'jest';
import * as signer from '../signer';
import * as etherTx from 'ethereumjs-tx';
import * as etherWallet from 'ethereumjs-wallet';

jest.mock('ethereumjs-tx');
jest.mock('ethereumjs-wallet');

describe('signer', async () => {

  it('should call generateWallet correctly', async () => {

    const resultExpected = {
      privateKey: 'getPrivateKeyStringdefault',
      publicKey: 'getPublicKeyStringdefault',
      address: 'getAddressStringdefault',
    }

    const response = signer.generateWallet();
    expect(response).toEqual(resultExpected);
  });

  it('should call signTx correctly', async () => {

    const response = signer.signTx({},'0x0000000000000000000000000000000000000000000000000000000000000002');
    expect(etherTx.default).toHaveBeenCalledTimes(1);
    expect(response).toEqual('0xtxSerializedDefault');
  });
});