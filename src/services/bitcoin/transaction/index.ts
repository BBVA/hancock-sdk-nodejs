import { SupportedPlatforms } from '../../common';
import { HancockTransactionService } from '../../common/transaction';
import { InitialHancockConfig } from '../../hancock.model';
import { signTx } from '../signer';
import { HancockBitcoinSocket } from './../socket';

export class HancockBitcoinTransactionService extends HancockTransactionService {

  constructor(config: InitialHancockConfig) {
    super(config, SupportedPlatforms.bitcoin, signTx, HancockBitcoinSocket);
  }

}
