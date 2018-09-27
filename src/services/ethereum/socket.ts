import { HancockSocket } from './../common/socket';
import { normalizeAddressOrAlias } from './utils';

/**
 * Manages events emmited by the ethereum blockchain network
 */
export class HancockEthereumSocket extends HancockSocket {

  constructor(url: string, consumer?: string) {
    super(url, consumer);
  }

  /**
   * Add a list of smart contract addresses to the watch lists of smart contract events
   * An event will be received each time that some smart contract identified by one of the given addresses emits an event
   * @param addresses addresses of smart contracts to watch
   */
  public addContract(contracts: string[]) {
    if (contracts.length > 0) {
      const normalizedAddressesOrAliases: string[] = contracts.map((addrOrAlias: string) => normalizeAddressOrAlias(addrOrAlias));
      this.sendMessage('watch-contracts', normalizedAddressesOrAliases);
    }
  }

}
