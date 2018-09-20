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
export const normalizeAlias = (alias: string): string => {
  return alias.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};
