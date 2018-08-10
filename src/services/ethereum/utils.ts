import { HancockError } from './error';

const addressPattern = new RegExp(/^(0x)?([a-fA-F0-9]{40})$/i);

export const isEmpty = (param: string): boolean => {
  return !param.trim();
};

export const isAddress = (addressOrAlias: string): boolean => {
  return addressPattern.test(addressOrAlias);
};

export const isAlias = (addressOrAlias: string): boolean => {
  return !addressPattern.test(addressOrAlias);
};

export const normalizeAddress = (address: string): string => {
  address = address.toLowerCase();
  return address.indexOf('0x') !== 0
    ? '0x' + address
    : address;
};

export const normalizeAlias = (alias: string): string => {
  return alias.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export const normalizeAddressOrAlias = (addressOrAlias: string) => {
  return isAddress(addressOrAlias)
    ? normalizeAddress(addressOrAlias)
    : normalizeAlias(addressOrAlias);
};

export function error(hancockError: HancockError, originalError?: HancockError | Error): HancockError {

  let retError: HancockError = hancockError;

  if (originalError instanceof HancockError) {

    retError = originalError;
    retError.errorStack.push(hancockError);

  } else {

    retError.extendedError = originalError;

  }

  return retError;

}
