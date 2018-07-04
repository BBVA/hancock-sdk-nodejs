
export const TX = jest.fn().mockImplementation(() => ({
  sign: () => 'txSigned',
  serialize: () => 'txSerialized'
}));

const _default = jest.fn().mockImplementation(() => ({
  sign: () => 'txSignedDefault',
  serialize: () => 'txSerializedDefault'
}));

export default _default;