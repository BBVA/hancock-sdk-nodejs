import { BigNumber } from 'bignumber.js';
import fetch from 'isomorphic-fetch';
import { InitialHancockConfig } from '../../hancock.model';
import { checkStatus, errorHandler } from '../common';
import {
  hancockFormatParameterError,
  hancockInvalidParameterError,
  hancockWalletError,
} from '../error';
import { EthereumWallet, generateWallet } from '../signer';
import { error, isAddress, isEmpty, normalizeAddress } from '../utils';

export class HancockEthereumWalletClient {

  private adapterApiBaseUrl: string;

  constructor(private config: InitialHancockConfig) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
  }

  public async getBalance(address: string): Promise<BigNumber> {

    if (isEmpty(address)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(address)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    address = normalizeAddress(address);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.balance}`.replace(/__ADDRESS__/, address);

    return fetch(url)
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      )
      .then((resBody: any) => {
        return new BigNumber(resBody.data.balance);
      });
  }

  public generate(): EthereumWallet {

    try {

      return generateWallet();

    } catch (e) {

      throw error(hancockWalletError, e);

    }

  }

}
