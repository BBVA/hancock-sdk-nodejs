
export const Wallet = {
  generate: () => ({
    getPrivateKeyString: () => 'getPrivateKeyStringWallet',
    getPublicKeyString: () => 'getPublicKeyStringWallet',
    getAddressString: () => 'getAddressStringWallet',
  })
};

const _default = {
  generate: () => ({
    getPrivateKeyString: () => 'getPrivateKeyStringdefault',
    getPublicKeyString: () => 'getPublicKeyStringdefault',
    getAddressString: () => 'getAddressStringdefault',
  })
};

export default _default;