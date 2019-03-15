import 'jest';

import { HancockEthereumTransactionService } from '..';
import { HancockTransactionService } from '../../../common/transaction';
import { signTx } from '../../signer';
import { HancockEthereumSocket } from '../../socket';
import { SupportedPlatforms } from '../../../common';

jest.mock('../../signer');
jest.mock('../../socket');
jest.mock('../../../common/transaction');

describe('HancockEthereumTransactionService', async () => {

  let client: HancockEthereumTransactionService;
  const genericConfig = {};
  let config: any;
  const constructorMock: jest.Mock = HancockTransactionService as any;
  const signTxMock: jest.Mock = signTx as any;
  const socketMock: typeof HancockEthereumSocket = HancockEthereumSocket;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should instanciate correctly extending from HancockTransactionService', async () => {

    config = {
      adapter: {...genericConfig},
      wallet: {...genericConfig},
      broker: {...genericConfig},
    };

    client = new HancockEthereumTransactionService(config);

    expect(constructorMock).toHaveBeenCalledWith(config, SupportedPlatforms.ethereum, signTxMock, socketMock);

  });

});
