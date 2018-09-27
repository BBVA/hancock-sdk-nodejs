import 'jest';

import * as signer from '../signer';

jest.mock('bitcoinjs-lib');

describe('bitcoinSigner', async () => {

  it('should call generateWallet correctly', async () => {

    const resultExpected = {
      privateKey: 'privateKeyBitcoin',
      publicKey: 'publicKeyBitcoin',
      address: 'addressBitcoin',
    };

    const response = signer.generateWallet();
    expect(response).toEqual(resultExpected);
  });

  it('should call signTx correctly', async () => {

    const response = signer.signTx({}, '0cdb138f6d49ed055c5c6a3169b920c3f7f94ded2df12065371803d4371c9b42');
    expect(response).toEqual('signedTx');

  });
});
