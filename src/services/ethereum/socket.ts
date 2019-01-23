import { HancockSocket } from './../common/socket';
import { HancockSocketStatus } from './../hancock.model';

/**
 * Manages events emmited by the ethereum blockchain network
 */
export class HancockEthereumSocket extends HancockSocket {

  constructor(url: string, consumer?: string, status?: HancockSocketStatus) {
    super(url, consumer, status);
  }

  /**
   * Add a list of smart contract addresses to the watch lists of smart contract events
   * An event will be received each time that some smart contract identified by one of the given addresses emits an event
   * @param addresses addresses of smart contracts to watch
   */
  public addContract(contracts: string[]) {
    if (contracts.length > 0) {
      this.sendMessage('watch-contracts', contracts);
    }
  }

}
