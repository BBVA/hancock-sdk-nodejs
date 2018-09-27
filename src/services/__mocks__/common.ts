export const checkStatus = jest.fn();
export const errorHandler = jest.fn();

export const error = jest.fn().mockImplementation((e) => e);

export enum SupportedPlatforms {
  bitcoin = 'mockBitcoin',
  ethereum = 'mockEthereum',
}
