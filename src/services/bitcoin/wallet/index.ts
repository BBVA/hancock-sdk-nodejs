import { BigNumber } from 'bignumber.js';
import fetch from 'isomorphic-fetch';
import { checkStatus, error, errorHandler } from '../../common';
import { isEmpty } from '../../common/utils';
import {
  hancockFormatParameterError,
  hancockInvalidParameterError,
  hancockWalletError,
} from '../../error';
import { InitialHancockConfig } from '../../hancock.model';
import { BitcoinWallet, generateWallet } from '../signer';
import { isAddress, normalizeAddress } from '../utils';

/**
 * [[include:HancockBitcoinWalletClient.md]]
 */
export class HancockBitcoinWalletClient {

  private adapterApiBaseUrl: string;

  constructor(private config: InitialHancockConfig) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
  }

  /**
   * Retrieves the ethers balance of an account
   * @param address The token owner's address
   * @returns The account balance (in weis)
   */
  public async getBalance(address: string): Promise<BigNumber> {

    if (isEmpty(address)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(address)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    address = normalizeAddress(address);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.balance}`.replace(/__DLT__/, 'bitcoin').replace(/__ADDRESS__/, address);

    return fetch(url)
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      )
      .then((resBody: any) => {
        console.log(resBody);
        return new BigNumber(resBody.data.balance);
      });
  }

  /**
   * Generates a new wallet
   * @returns address, publicKey, and privateKey of the new wallet
   */
  public generate(): BitcoinWallet {

    try {

      return generateWallet();

    } catch (e) {

      throw error(hancockWalletError, e);

    }

  }

}
