import EventEmitter from 'eventemitter3';
import { ITransaction } from './signer/ethereum-signer.model';

export type DltAddress = string;
export type DltRawTransaction = any;
export type DltSignedTransaction = string;


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

export interface HancockEventEmitter extends EventEmitter {
}

export interface HancockClient {
  invokeSmartContract(contractAddress: string, method: string, params: string[], from: string, privateKey?: string, signProvider?: string): Promise<HancockSignResponse>;
  adaptInvokeSmartContract(contractAddress: string, method: string, params: string[], from: string): Promise<HancockSignResponse>;
  sendSignedTransaction(tx: any, provider: string): Promise<HancockSignResponse>;
  signTransaction(rawTx: ITransaction, provider: string): string;
  subscribeSmartContractEvents(contractAddress: string, sender: string): HancockEventEmitter;
}