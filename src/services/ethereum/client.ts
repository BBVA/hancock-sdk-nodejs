import config from 'config';
import merge from 'deepmerge';
import {
  HancockConfig,
  InitialHancockConfig,
} from '../hancock.model';
import {
  HancockClient,
} from '../hancock.model';
import { HancockEthereumProtocolClient } from './protocol';
import { HancockEthereumSmartContractClient } from './smartcontract';
import { HancockEthereumTokenClient } from './token';
import { HancockEthereumTransactionClient } from './transaction';
import { HancockEthereumTransferClient } from './transfer';
import { HancockEthereumWalletClient } from './wallet';

export class HancockEthereumClient implements HancockClient {

  public transaction: HancockEthereumTransactionClient;
  public transfer: HancockEthereumTransferClient;
  public wallet: HancockEthereumWalletClient;
  public protocol: HancockEthereumProtocolClient;
  public smartContract: HancockEthereumSmartContractClient;
  public token: HancockEthereumTokenClient;

  private config: InitialHancockConfig;

  /**
   * Main interface to interact with Hancock
   * @param cfg Initial configuration of the client
   */
  constructor(cfg: HancockConfig = {}) {

    this.config = merge(config, cfg) as InitialHancockConfig;

    this.transaction = new HancockEthereumTransactionClient(this.config);
    this.wallet = new HancockEthereumWalletClient(this.config);
    this.transfer = new HancockEthereumTransferClient(this.config, this.transaction);
    this.protocol = new HancockEthereumProtocolClient(this.config);
    this.smartContract = new HancockEthereumSmartContractClient(this.config, this.transaction);
    this.token = new HancockEthereumTokenClient(this.config, this.transaction);

  }

}
