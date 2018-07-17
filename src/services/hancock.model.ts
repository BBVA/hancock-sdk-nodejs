import EventEmitter from 'eventemitter3';
import { BigNumber } from 'bignumber.js';
import { HancockEthereumSocket } from './ethereum/socket';

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
  action?: HancockInvokeAction;
}

export interface HancockAdaptInvokeRequest extends HancockInvokeRequest {
  action: 'send'
}

export interface HancockCallRequest extends HancockInvokeRequest {
  action: 'call'
}

export interface HancockAdaptInvokeResponse {
  result: {
    code: number;
    description: string;
  };
  data: DltRawTransaction;
}

export interface HancockCallResponse {
  result: {
    code: number;
    description: string;
  };
  data: any;
}

// Send to sign

export interface HancockSignRequest {
  rawTx: any;
  provider: string;
}

export interface HancockSignResponse {
  success: boolean;
}

// Send Tx

export interface HancockSendTxRequest {
  tx: DltRawTransaction;
}

export interface HancockSendTxResponse {
  success: boolean;
}

// Send signedTx

export interface HancockSendSignedTxRequest {
  tx: DltSignedTransaction;
}

export interface HancockSendSignedTxResponse {
  success: boolean;
}

// Register

export interface HancockRegisterRequest {
  alias: string;
  address: DltAddress;
  abi: any;
}

export interface HancockRegisterResponse {
  result: {
    code: number;
    description: string;
  };
}

// Transfer

export interface HancockTransferRequest {
  from: string,
  to: string,
  value: string,
  data?: string
}

// TokenTransfer

export interface HancockTokenTransferRequest {
  from: string,
  to: string,
  value: string
}

// CONFIG

export interface HancockAdapterConfig {
  host?: string;
  port?: number;
  base?: string;
  resources?: { [k: string]: string };
}

export interface HancockWalletHubConfig {
  host?: string;
  port?: number;
  base?: string;
  resources?: { [k: string]: string };
}

export interface HancockBrokerConfig {
  host?: string;
  port?: number;
  base?: string;
  resources?: { [k: string]: string };
}

export interface HancockConfig {
  adapter?: HancockAdapterConfig;
  wallet?: HancockWalletHubConfig;
  broker?: HancockBrokerConfig;
}

export interface InitialHancockAdapterConfig {
  host: string;
  port: number;
  base: string;
  resources: { [k: string]: string };
}

export interface InitialHancockWalletHubConfig {
  host: string;
  port: number;
  base: string;
  resources: { [k: string]: string };
}

export interface InitialHancockBrokerConfig {
  host: string;
  port: number;
  base: string;
  resources: { [k: string]: string };
}

export interface InitialHancockConfig {
  adapter: InitialHancockAdapterConfig;
  wallet: InitialHancockWalletHubConfig;
  broker: InitialHancockBrokerConfig;
}

// PROTOCOL

export type HancockProtocolAction = 'transfer';
export type HancockProtocolDlt = 'ethereum';

export interface HancockProtocolEncodeBody {
  value: string;
  to: string;
  data: string;
}

export interface HancockProtocolEncode {
  action: HancockProtocolAction;
  body: HancockProtocolEncodeBody;
  dlt: HancockProtocolDlt;
}

export interface HancockProtocolEncodeResponse {
  qrEncode: HancockProtocolAction;
}

export interface HancockProtocolDecodeRequest {
  code: string;
}

export interface HancockProtocolDecodeResponse {
  result: {
    code: number;
    description: string;
  },
  data: HancockProtocolEncode
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

  invokeSmartContract(contractAddress: string, method: string, params: string[], from: string, options?: HancockInvokeOptions): Promise<HancockSignResponse>;
  callSmartContract(contractAddress: string, method: string, params: string[], from: string): Promise<HancockCallResponse>;
  adaptInvokeSmartContract(contractAddress: string, method: string, params: string[], from: string): Promise<HancockAdaptInvokeResponse>;
  sendTransaction(tx: any): Promise<HancockSendTxResponse>;
  sendSignedTransaction(tx: any): Promise<HancockSendSignedTxResponse>;
  sendTransactionToSign(rawTx: any, provider: string): Promise<HancockSignResponse>;
  signTransaction(rawTx: DltRawTransaction, privateKey: string): string;
  generateWallet(): DltWallet;
  subscribeToContract(contracts: string[]): HancockEthereumSocket;
  subscribeToTransfer(addresses: string[]): HancockEthereumSocket;
  getBalance(address:string): Promise<BigNumber>;
  transfer(from: string, to: string, value: string, options?: HancockInvokeOptions, data?:string): Promise<HancockSignResponse>;
  encodeProtocol(action:HancockProtocolAction, dlt:HancockProtocolDlt, value: string, to:string, data:string): Promise<HancockProtocolEncodeResponse>;
  decodeProtocol(code: string): Promise<HancockProtocolDecodeResponse>;
}

export type HancockInvokeAction = 'send' | 'call';

export interface HancockInvokeOptions {
  privateKey?: string;
  signProvider?: string;
}

export type HancockSocketKind = 'watch-addresses' | 'watch-contracts';
export type HancockSocketBody = any;
export interface HancockSocketMessage {
  kind: HancockSocketKind;
  body: HancockSocketBody;
  consumer?: string;
}