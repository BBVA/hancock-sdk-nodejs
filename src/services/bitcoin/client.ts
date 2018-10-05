import config from 'config';
import merge from 'deepmerge';
import { HancockProtocolService } from '../common/protocol';
import {
  HancockClient,
  HancockConfig,
  InitialHancockConfig,

} from '../hancock.model';
import { HancockBitcoinWalletService } from './wallet';

export class HancockBitcoinClient implements HancockClient {

  public wallet: HancockBitcoinWalletService;
  public protocol: HancockProtocolService;

  // TODO: Work in progress integrating bitcoin
  public transaction: any;
  public transfer: any;

  private config: InitialHancockConfig;

  /**
   * Main interface to interact with Hancock's bitcoin interface
   * @param cfg Initial configuration of the client
   */
  constructor(cfg: HancockConfig = {}) {

    this.config = merge(config, cfg) as InitialHancockConfig;

    this.wallet = new HancockBitcoinWalletService(this.config);
    this.protocol = new HancockProtocolService(this.config);

    // TODO: Work in progress integrating bitcoin
    // this.transaction = new HancockBitcoinTransactionService(this.config);
    // this.transfer = new HancockBitcoinTransferService(this.config, this.transaction);

  }

}
