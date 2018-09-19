const addressPattern = new RegExp(/^(1|3)([a-zA-Z0-9]{25,34})$/i);

/**
 * @hidden
 */
export const isEmpty = (param: string): boolean => {
  return !param.trim();
};

/**
 * @hidden
 */
export const isEmptyAny = (...param: string[]): boolean => {
  param.forEach((element) => {
    if (isEmpty(element)) {
      return true;
    }
  });
  return false;
};

/**
 * @hidden
 */
export const isAddressAny = (...addressOrAlias: string[]): boolean => {
  addressOrAlias.forEach((element) => {
    if (!addressPattern.test(element)) {
      return false;
    }
  });
  return true;
};

/**
 * @hidden
 */
export const isAddress = (addressOrAlias: string): boolean => {
  return addressPattern.test(addressOrAlias);
};

/**
 * @hidden
 */
export const isAlias = (addressOrAlias: string): boolean => {
  return !addressPattern.test(addressOrAlias);
};

/**
 * @hidden
 */
export const normalizeAddress = (address: string): string => {
  return address;
};

/**
 * @hidden
 */
export const normalizeAlias = (alias: string): string => {
  return alias.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * @hidden
 */
export const normalizeAddressOrAlias = (addressOrAlias: string) => {
  return isAddress(addressOrAlias)
    ? normalizeAddress(addressOrAlias)
    : normalizeAlias(addressOrAlias);
};
