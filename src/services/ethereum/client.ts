import config from 'config';
import merge from 'deepmerge';
import { HancockProtocolService } from '../common/protocol';
import {
  HancockClient,
  HancockConfig,
  InitialHancockConfig,
} from '../hancock.model';
import { HancockEthereumSmartContractService } from './smartcontract';
import { HancockEthereumTokenService } from './token';
import { HancockEthereumTransactionService } from './transaction';
import { HancockEthereumTransferService } from './transfer';
import { HancockEthereumWalletService } from './wallet';

export class HancockEthereumClient implements HancockClient {

  public transaction: HancockEthereumTransactionService;
  public transfer: HancockEthereumTransferService;
  public wallet: HancockEthereumWalletService;
  public protocol: HancockProtocolService;
  public smartContract: HancockEthereumSmartContractService;
  public token: HancockEthereumTokenService;

  private config: InitialHancockConfig;

  /**
   * Main interface to interact with Hancock's ethereum interface
   * @param cfg Initial configuration of the client
   */
  constructor(cfg: HancockConfig = {}) {

    this.config = merge(config, cfg) as InitialHancockConfig;

    this.transaction = new HancockEthereumTransactionService(this.config);
    this.wallet = new HancockEthereumWalletService(this.config);
    this.transfer = new HancockEthereumTransferService(this.config, this.transaction);
    this.protocol = new HancockProtocolService(this.config);
    this.smartContract = new HancockEthereumSmartContractService(this.config, this.transaction);
    this.token = new HancockEthereumTokenService(this.config, this.transaction);

  }

}
