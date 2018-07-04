
export const TX = jest.fn().mockImplementation(() => ({
  sign: () => 'txSigned',
  serialize: () => 'txSerialized'
}));

const _default = jest.fn().mockImplementation(() => ({
  sign: () => 'txSignedDefault',
  serialize: () => 'f8a93a8504a817c80082c7c594e3aee62f5bb4abab8b614fd80f1d92dbdbfd2f9a80b844a9059cbb0000000000000000000000006c0a14f7561898b9ddc0c57652a53b2c6665443e00000000000000000000000000000000000000000000000000000000000000011ba0352fed557e3225e363e804264a4fd97ac5e450dad2d8352b80baa105272bd752a03a4656f228b3f3163c72b59776add6867808b834668140dd2233f2350724b318'
}));

export default _default;