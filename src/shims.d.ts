declare module 'web3-provider-engine';
declare module 'web3-provider-engine/subproviders/rpc';
declare module 'web3-provider-engine/subproviders/filters.js';

declare module 'web3-provider-engine/subproviders/subprovider' {
  class Subprovider {
    engine: any;
    constructor();
    public emitPayload(...args: any[]): any;
  }
  export = Subprovider;
}

declare module "config" {
}

declare module "isomorphic-ws" {
  import ws from 'ws'
  export = ws;
}

declare module NodeJS  {
  interface Process {
    browser: boolean;
  }
}

declare module "ethereumjs-wallet" {
  export class Wallet {
    static generate(): any;
  }
  export default Wallet;
}

declare module "ethereumjs-tx" {
  export class Tx {
    constructor(rawTx: any);
    sign(privateKey: any): any;
    serialize(): any;
  }
  export default Tx;
}
