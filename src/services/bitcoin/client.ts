import config from 'config';
import merge from 'deepmerge';
import { HancockProtocolClient } from '../common/protocol';
import {
  HancockClient,
  HancockConfig,
  InitialHancockConfig,

} from '../hancock.model';
import { HancockBitcoinWalletClient } from './wallet';

export class HancockBitcoinClient implements HancockClient {

  public wallet: HancockBitcoinWalletClient;
  public protocol: HancockProtocolClient;

  // TODO: Work in progress integrating bitcoin
  public transaction: any;
  public transfer: any;
  public smartContract: any;
  public token: any;

  private config: InitialHancockConfig;

  /**
   * Main interface to interact with Hancock's bitcoin interface
   * @param cfg Initial configuration of the client
   */
  constructor(cfg: HancockConfig = {}) {

    this.config = merge(config, cfg) as InitialHancockConfig;

    this.wallet = new HancockBitcoinWalletClient(this.config);
    this.protocol = new HancockProtocolClient(this.config);

    // TODO: Work in progress integrating bitcoin
    // this.transaction = new HancockBitcoinTransactionClient(this.config);
    // this.transfer = new HancockBitcoinTransferClient(this.config, this.transaction);
    // this.smartContract = new HancockBitcoinSmartContractClient(this.config, this.transaction);
    // this.token = new HancockBitcoinTokenClient(this.config, this.transaction);

  }

}
