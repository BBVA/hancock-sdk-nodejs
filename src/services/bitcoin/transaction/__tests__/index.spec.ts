import 'jest';

import { HancockBitcoinTransactionService } from '..';
import { SupportedPlatforms } from '../../../common';
import { HancockTransactionService } from '../../../common/transaction';
import { signTx } from '../../signer';
import { HancockBitcoinSocket } from '../../socket';

jest.mock('../../signer');
jest.mock('../../socket');
jest.mock('../../../common/transaction');

describe('HancockBitcoinTransactionService', async () => {

  let client: HancockBitcoinTransactionService;
  const genericConfig = {};
  let config: any;
  const constructorMock: jest.Mock = HancockTransactionService as any;
  const signTxMock: jest.Mock = signTx as any;
  const socketMock: typeof HancockBitcoinSocket = HancockBitcoinSocket;

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

    client = new HancockBitcoinTransactionService(config);

    expect(constructorMock).toHaveBeenCalledWith(config, SupportedPlatforms.bitcoin, signTxMock, socketMock);

  });

});
