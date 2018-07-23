import { HancockEventEmitter, HancockEventKind } from '..';

export type EthereumAddress = string;
export type EthereumContractAddress = string;
export type EthereumTxHash = string;
export type EthereumBlockHash = string;
export type EthereumData = string;
export type EthereumTopic = string;
export type EthereumContractEventStatus = 'mined' | 'pending';
export type EthereumContractLogId = string;

export type EthereumAbi = any[];

export type HancockEthereumEventBody = EthereumContractEventBody | EthereumContractLogBody;

export interface HancockEthereumEvent {
  kind: HancockEventKind;
  body: HancockEthereumEventBody;
}

export interface HancockEthereumEventEmitter extends HancockEventEmitter {
  on(event: HancockEventKind, fn: (payload: HancockEthereumEvent) => void, context?: any): this;

}

export interface EthereumContractEventBody {
  address: EthereumContractAddress;
  blockHash: EthereumBlockHash;
  blockNumber: number;
  event: undefined;
  id: EthereumContractLogId;
  logIndex: number;
  raw: {
    data: EthereumData;
    topics: EthereumTopic[];
  };
  returnValues: any;
  signature: null;
  transactionHash: EthereumTxHash;
  transactionIndex: number;
  type: EthereumContractEventStatus;
}

export interface EthereumContractLogBody {
  address: EthereumContractAddress;
  blockHash: EthereumBlockHash;
  blockNumber: number;
  data: EthereumData;
  id: EthereumContractLogId;
  logIndex: number;
  topics: EthereumTopic[];
  transactionHash: EthereumTxHash;
  transactionIndex: number;
  type: EthereumContractEventStatus;
}

export interface EthereumTransactionBody {
  blockHash: EthereumBlockHash;
  blockNumber: number;
  from: EthereumAddress;
  gas: number;
  gasPrice: string;
  hash: EthereumTxHash;
  input: string;
  nonce: number;
  to: EthereumContractAddress;
  transactionIndex: number;
  value: string;
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
