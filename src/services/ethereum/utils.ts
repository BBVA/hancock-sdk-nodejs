import { isEmpty, normalizeAlias } from '../common/utils';

const addressPattern = new RegExp(/^(0x)?([a-fA-F0-9]{40})$/i);

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
  address = address.toLowerCase();
  return address.indexOf('0x') !== 0
    ? '0x' + address
    : address;
};

/**
 * @hidden
 */
export const normalizeAddressOrAlias = (addressOrAlias: string) => {
  return isAddress(addressOrAlias)
    ? normalizeAddress(addressOrAlias)
    : normalizeAlias(addressOrAlias);
};
