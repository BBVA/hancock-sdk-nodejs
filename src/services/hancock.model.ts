import EventEmitter from 'eventemitter3';

export type DltAddress = string;
export type DltRawTransaction = any;
export type DltSignedTransaction = string;

export interface DltWallet {
  privateKey: string;
  publicKey: string;
  address: string;
}

// API

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

export interface HancockSendSignedTxRequest {
  tx: DltSignedTransaction;
}

export interface HancockSendSignedTxResponse {
  success: boolean;
}


// CONFIG

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


// INTERFACES

export type HancockEventKind = 'error' | 'event' | 'logs' | 'tx';
export type HancockEventBody = any;
export interface HancockEvent {
  kind: HancockEventKind;
  body: HancockEventBody;
}

export interface HancockEventEmitter extends EventEmitter {
  on(event: HancockEventKind, fn: (payload: HancockEvent) => void, context?: any): this;
}

export interface HancockClient {
  invokeSmartContract(contractAddress: string, method: string, params: string[], from: string, privateKey?: string, signProvider?: string): Promise<HancockSignResponse>;
  adaptInvokeSmartContract(contractAddress: string, method: string, params: string[], from: string): Promise<HancockSignResponse>;
  signTransaction(rawTx: DltRawTransaction, privateKey: string): string;
  generateWallet(): DltWallet;
  sendSignedTransaction(tx: any): Promise<HancockSendSignedTxResponse>;
  sendTransactionToSign(rawTx: any, provider: string): Promise<HancockSignResponse>
  subscribeSmartContractEvents(contractAddress: string, sender?: string): HancockEventEmitter;
}