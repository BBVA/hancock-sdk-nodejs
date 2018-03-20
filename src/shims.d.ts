
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
