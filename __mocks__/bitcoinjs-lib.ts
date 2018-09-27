const _keyPair = {
  privateKey: 'privateKeyBitcoin',
  publicKey: 'publicKeyBitcoin',
};

const _tx = {
  ins: [],
};

export const networks = {
  bitcoin: 0,
  testnet: 1,
};

export const _txb = {
  sign: jest.fn(),
  build: jest.fn(() => ({
    toHex: jest.fn(() => 'signedTx'),
  })),
};

export const payments = {
  p2pkh: jest.fn(() => ({
    address: 'addressBitcoin',
  })),
};

// tslint:disable-next-line:variable-name
export const ECPair = {
  makeRandom: jest.fn(() => _keyPair),
  fromPrivateKey: jest.fn(() => _keyPair),
};

// tslint:disable-next-line:variable-name
export const Transaction = {
  fromHex: jest.fn(() => _tx),
};

// tslint:disable-next-line:variable-name
export const TransactionBuilder = {
  fromTransaction: jest.fn(() => _txb),
};
