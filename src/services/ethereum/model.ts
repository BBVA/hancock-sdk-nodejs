import {HancockEvent, HancockEventEmitter, HancockEventKind} from '..';

export type EthereumAddress = string;
export type EthereumContractAddress = string;
export type EthereumTxHash = string;
export type EthereumBlockHash = string;
export type EthereumData = string;
export type EthereumTopic = string;
export type EthereumContractEventStatus = 'mined' | 'pending';
export type EthereumContractLogId = string;

export type EthereumAbi = any[];

export interface HancockEthereumEventEmitter extends HancockEventEmitter {
  on(event: HancockEventKind, fn: (payload: HancockEvent) => void, context?: any): this;
}

export interface EthereumBlockHeader {
  hash: string;
  parentHash: EthereumBlockHash;
  sha3Uncles: string;
  miner: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  logsBloom: string;
  difficulty: string;
  number: number;
  gasLimit: number;
  gasUsed: number;
  nonce: string;
  timestamp: number;
  extraData: string;
  size: undefined;
}

export interface IHancockSocketCurrency {
  amount: string;
  decimals: number;
  currency: CURRENCY;
}

export enum CURRENCY {
  Ethereum = 'Ethereum',
}
