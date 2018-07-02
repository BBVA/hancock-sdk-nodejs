const addressPattern = new RegExp(/^(0x)?([a-fA-F0-9]{40})$/i);

export function isAddress(addressOrAlias: string): boolean {
  return addressPattern.test(addressOrAlias);
}

export function isAlias(addressOrAlias: string): boolean {
  return !addressPattern.test(addressOrAlias);
}

export function normalizeAddress(address: string): string {
  address = address.toLowerCase();
  return address.indexOf('0x') !== 0 
    ? '0x' + address
    : address;
}

export function normalizeAlias(alias: string): string {  
  return alias.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();
}

export function normalizeAddressOrAlias(addressOrAlias: string) {
  return isAddress(addressOrAlias)
    ? normalizeAddress(addressOrAlias)
    : normalizeAlias(addressOrAlias);
}