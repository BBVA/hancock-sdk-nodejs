export const isEmpty = jest.fn().mockReturnValue(false);

export const isEmptyAny = jest.fn().mockReturnValue(false);

export const isAddress = jest.fn().mockReturnValue(true);

export const isAddressAny = jest.fn().mockReturnValue(true);

export const isAlias = jest.fn().mockReturnValue(true);

export const normalizeAddress = jest.fn().mockImplementation((res) => res);

export const normalizeAlias = jest.fn().mockImplementation((res) => res);

export const normalizeAddressOrAlias = jest.fn().mockImplementation((res) => res);

export const error = jest.fn().mockImplementation((e) => e);
