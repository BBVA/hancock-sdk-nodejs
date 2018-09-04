import { BigNumber } from 'bignumber.js';
import EventEmitter from 'eventemitter3';
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

export interface HancockGenericResponse {
  result: {
    code: number;
    description: string;
  };
}

export interface HancockInvokeRequest {
  method: string;
  from: string;
  params: string[];
  action?: HancockInvokeAction;
}

export interface HancockAdaptInvokeRequest extends HancockInvokeRequest {
  action: 'send';
}

export interface HancockCallRequest extends HancockInvokeRequest {
  action: 'call';
}

export interface HancockAdaptInvokeResponse extends HancockGenericResponse {
  data: DltRawTransaction;
}

export interface HancockCallResponse extends HancockGenericResponse {
  data: any;
}

// Send to sign

export interface HancockSignRequest {
  rawTx: any;
  provider: string;
  backUrl?: string;
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

// tslint:disable-next-line:no-empty-interface
export interface HancockRegisterResponse extends HancockGenericResponse {
}

// Transfer

export interface HancockTransferRequest {
  from: string;
  to: string;
  value: string;
  data?: string;
}

// TokenTransfer

export interface HancockTokenTransferRequest {
  from: string;
  to: string;
  value: string;
}

// tslint:disable-next-line:no-empty-interface
export interface HancockTokenTransferResponse extends HancockGenericResponse {
}

// TokenTransferFrom

export interface HancockTokenTransferFromRequest {
  from: string;
  sender: string;
  to: string;
  value: string;
}

// tslint:disable-next-line:no-empty-interface
export interface HancockTokenTransferFromResponse extends HancockGenericResponse {
}

// TokenAllowance

export interface HancockTokenAllowanceRequest {
  from: string;
  tokenOwner: string;
  spender: string;
}

// Token Register

export interface HancockTokenRegisterRequest {
  alias: string;
  address: DltAddress;
}

// tslint:disable-next-line:no-empty-interface
export interface HancockTokenRegisterResponse extends HancockGenericResponse {
}

// Token metadata

export interface HancockTokenMetadataResponse {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
}

// Token approve

export interface HancockTokenApproveRequest {
  from: string;
  spender: string;
  value: string;
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

export interface HancockTokenBalanceResponse {
  balance: BigNumber;
  decimals: number;
}

export interface HancockProtocolDecodeResponse extends HancockGenericResponse {
  data: HancockProtocolEncode;
}

// ERROR

export interface IHancockError extends Error {
  internalError: string;
  error: number;
  message: string;
  extendedMessage: string;
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
  sendTransactionToSign(rawTx: any, provider: string, callback?: HancockCallBackOptions): Promise<HancockSignResponse>;
  signTransaction(rawTx: DltRawTransaction, privateKey: string): string;
  generateWallet(): DltWallet;
  subscribeToContract(contracts: string[]): HancockEthereumSocket;
  subscribeToTransfer(addresses: string[]): HancockEthereumSocket;
  subscribeToTransaction(addresses: string[]): HancockEthereumSocket;
  getBalance(address: string): Promise<BigNumber>;
  transfer(from: string, to: string, value: string, options?: HancockInvokeOptions, data?: string): Promise<HancockSignResponse>;
  tokenTransfer(from: string, to: string, value: string, addressOrAlias: string, options?: HancockInvokeOptions): Promise<HancockSignResponse>;
  tokenApprove(from: string, spender: string, value: string, addressOrAlias: string, options?: HancockInvokeOptions): Promise<HancockSignResponse>;
  // tslint:disable-next-line:max-line-length
  tokenTransferFrom(from: string, sender: string, to: string, value: string, addressOrAlias: string, options?: HancockInvokeOptions): Promise<HancockSignResponse>;
  tokenAllowance(from: string, tokenOwner: string, spender: string, addressOrAlias: string, options?: HancockInvokeOptions): Promise<HancockSignResponse>;
  encodeProtocol(action: HancockProtocolAction, dlt: HancockProtocolDlt, value: string, to: string, data: string): Promise<HancockProtocolEncodeResponse>;
  decodeProtocol(code: string): Promise<HancockProtocolDecodeResponse>;
  getTokenBalance(addressOrAlias: string, address: string): Promise<HancockTokenBalanceResponse>;
  getTokenMetadata(addressOrAlias: string): Promise<HancockTokenMetadataResponse>;
  tokenRegister(alias: string, address: DltAddress): Promise<HancockTokenRegisterResponse>;
}

export type HancockInvokeAction = 'send' | 'call';

export interface HancockInvokeOptions {
  privateKey?: string;
  signProvider?: string;
  callback?: HancockCallBackOptions;
}

export interface HancockCallBackOptions {
  backUrl?: string;
  requestId?: string;
}

export type HancockSocketKind = 'watch-transfers' | 'watch-transactions' | 'watch-contracts';
export type HancockSocketBody = any;
export interface HancockSocketMessage {
  kind: HancockSocketKind;
  body: HancockSocketBody;
  consumer?: string;
}
