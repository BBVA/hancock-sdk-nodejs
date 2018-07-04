export const isAddress = jest.fn().mockReturnValue(true);

export const isAlias = jest.fn().mockReturnValue(true);

export const normalizeAddress = jest.fn().mockImplementation((res) => res);

export const normalizeAlias = jest.fn().mockImplementation((res) => res);

export const normalizeAddressOrAlias = jest.fn().mockImplementation((res) => res);