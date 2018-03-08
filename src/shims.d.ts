
declare module "config" {
  const conf: any;
  export default conf;
}

declare module "isomorphic-ws" {
  import ws from 'ws'
  export = ws;
}