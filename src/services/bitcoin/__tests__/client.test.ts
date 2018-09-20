import 'jest';

import BigNumber from 'bignumber.js';
import fetch from 'isomorphic-fetch';
import { HancockBitcoinClient } from '../../..';
import { HancockError, hancockErrorType } from '../../error';
import * as responses from '../__mocks__/responses';
import { BitcoinWallet } from '../signer';

jest.mock('isomorphic-fetch');
jest.unmock('bitcoinjs-lib');

describe('HancockBitcoinClient integration tests', () => {

  let clientInstance: HancockBitcoinClient;
  const address: string = '142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx';
  const normalizedAddress: string = '142kXJP52FjqVVBev7vi2YqK7pgwWuBCRx';

  beforeAll(() => {

    clientInstance = new HancockBitcoinClient();

  });

  beforeEach(() => {

    jest.clearAllMocks();

  });

  describe('::wallet', () => {

    describe('::getBalance', () => {

      it('should retrieve the balance in weis from the dlt', async () => {

        (fetch as any)
          .once(JSON.stringify(responses.GET_BALANCE_RESPONSE));

        const result: BigNumber = await clientInstance.wallet.getBalance(normalizedAddress);

        const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
        expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockBalance/${normalizedAddress}`);

        expect(result).toEqual(new BigNumber(responses.GET_BALANCE_RESPONSE.data.balance));

      });

      it('should try to retrieve the balance in weis from the dlt and fail if there is an error', async () => {

        (fetch as any)
          .mockRejectOnce(JSON.stringify(responses.GET_BALANCE_ERROR_RESPONSE), { status: 400 });

        try {

          await clientInstance.wallet.getBalance(address);

        } catch (e) {

          const firstApiCall: any = (fetch as jest.Mock).mock.calls[0];
          expect(firstApiCall[0]).toEqual(`http://mockAdapter:6666/mockBase/mockBalance/${normalizedAddress}`);

          expect(e).toEqual(new HancockError(hancockErrorType.Api, e.internalError, e.error, e.message));

        }

      });

    });

    describe('::generate', () => {

      it('should create a new wallet from scratch', () => {

        const hancockWallet: BitcoinWallet = clientInstance.wallet.generate();

        expect(typeof hancockWallet.address).toEqual('string');
        expect(typeof hancockWallet.publicKey).toEqual('string');
        expect(typeof hancockWallet.privateKey).toEqual('string');

        expect(hancockWallet.address).toMatch(/^(1|3)([a-zA-Z0-9]{25,34})$/i);

      });
    });

  });

});
