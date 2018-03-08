import EventEmitter from 'eventemitter3';

export interface HancockInvokeRequest {
  method: string;
  from: string;
  params: string[];
}

export interface HancockInvokeResponse {
  statusCode: number;
  code: string;
  message: string;
}

export interface HancockSignRequest {
  rawTx: any;
  provider: string;
}

export interface HancockSignResponse {
  success: boolean;
}



export interface HancockAdapterConfig {
  host: string;
  port: number;
  base: string;
  resources: {[k: string]: string};
}

export interface HancockWalletHubConfig {
  host: string;
  port: number;
  base: string;
  resources: {[k: string]: string};
}

export interface HancockBrokerConfig {
  host: string;
  port: number;
  base: string;
  resources: {[k: string]: string};
}

export interface HancockConfig {
  adapter: HancockAdapterConfig;
  wallet: HancockWalletHubConfig;
  broker: HancockBrokerConfig;
}

export interface HancockEventEmitter extends EventEmitter {
}