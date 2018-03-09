
declare module "config" {
  const conf: any;
  export default conf;
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
}

declare module "ethereumjs-tx" {
  export class Tx {
    constructor(rawTx: any);
    sign(privateKey: any): any;
    serialize(): any;
  }
}
