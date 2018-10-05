import { SupportedPlatforms } from '../../common';
import { HancockTransactionService } from '../../common/transaction';
import { InitialHancockConfig } from '../../hancock.model';
import { signTx } from '../signer';
import { HancockEthereumSocket } from './../socket';

export class HancockEthereumTransactionService extends HancockTransactionService {

  constructor(config: InitialHancockConfig) {
    super(config, SupportedPlatforms.ethereum, signTx, HancockEthereumSocket);
  }

}
