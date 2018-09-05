import config from 'config';
import merge from 'deepmerge';
import {
  HancockConfig,
  InitialHancockConfig,
} from '../hancock.model';
import {
  HancockClient,
} from '../hancock.model';
import { hancockWalletError } from './error';
import { HancockEthereumProtocolClient } from './protocol';
import {
  generateWallet,
} from './signer';
import { EthereumWallet } from './signer';
import { HancockEthereumSmartContractClient } from './smartcontract';
import { HancockEthereumTokenClient } from './token';
import { HancockEthereumTransactionClient } from './transaction';
import { HancockEthereumTransferClient } from './transfer';
import { error } from './utils';

export class HancockEthereumClient implements HancockClient {

  public transactionClient: HancockEthereumTransactionClient;
  public transferClient: HancockEthereumTransferClient;
  public protocolClient: HancockEthereumProtocolClient;
  public smartContractClient: HancockEthereumSmartContractClient;
  public tokenClient: HancockEthereumTokenClient;

  private config: InitialHancockConfig;

  constructor(cfg: HancockConfig = {}) {

    this.config = merge(config, cfg) as InitialHancockConfig;

    this.transactionClient = new HancockEthereumTransactionClient(this.config);
    this.transferClient = new HancockEthereumTransferClient(this.config, this.transactionClient);
    this.protocolClient = new HancockEthereumProtocolClient(this.config);
    this.smartContractClient = new HancockEthereumSmartContractClient(this.config, this.transactionClient);
    this.tokenClient = new HancockEthereumTokenClient(this.config, this.transactionClient);

  }

  // WALLET API

  public generateWallet(): EthereumWallet {

    try {

      return generateWallet();

    } catch (e) {

      throw error(hancockWalletError, e);

    }

  }

}
