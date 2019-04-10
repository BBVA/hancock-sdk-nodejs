import { HancockSocket } from '../common/socket';
import { HancockSocketStatus } from '../hancock.model';

/**
 * Manages events emmited by the ethereum blockchain network
 */
export class HancockEthereumSocket extends HancockSocket {

  constructor(url: string, consumer?: string, status?: HancockSocketStatus) {
    super(url, consumer, status);
  }

}
