
import fetch from 'isomorphic-fetch';
import {
  HancockTokenAllowanceRequest,
  HancockTokenApproveRequest,
  HancockTokenInstance,
  HancockTokenMetadataResponse,
  HancockTokenTransferRequest,
} from '../..';
import { checkStatus, error, errorHandler, SupportedPlatforms } from '../../common';
import { isEmpty } from '../../common/utils';
import {
  hancockFormatParameterError,
  hancockInvalidParameterError,
  hancockNoKeyNorProviderError,
} from '../../error';
import {
  HancockTokenTransferFromRequest,
} from '../../hancock.model';
import {
  DltAddress,
  HancockAdaptInvokeResponse,
  HancockInvokeOptions,
} from '../../hancock.model';
import {
  HancockSignResponse,
  HancockTokenBalanceResponse,
  HancockTokenRegisterRequest,
  HancockTokenRegisterResponse,
  InitialHancockConfig,
} from '../../hancock.model';
import { HancockEthereumTransactionService } from '../transaction';
import { isAddress, isAddressAny, isEmptyAny } from '../utils';

/**
 * [[include:HancockEthereumTokenService.md]]
 */
export class HancockEthereumTokenService {

  private adapterApiBaseUrl: string;

  constructor(private config: InitialHancockConfig, private transactionService: HancockEthereumTransactionService) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
  }

  /**
   * Register a new ERC20 token instance in Hancock
   * @param alias An alias for the token
   * @param address The address of the deployed smart contract token instance
   * @returns The result of the request
   */
  public async register(alias: string, address: DltAddress): Promise<HancockTokenRegisterResponse> {

    if (isEmptyAny(alias, address)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(address)) {
      return Promise.reject(error(hancockFormatParameterError));
    }

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.register}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum);

    const body: HancockTokenRegisterRequest = {
      address,
      alias,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );

  }

  /**
   * Transfer the balance from token owner's account to `to` account
   * - Owner's account must have sufficient balance to transfer
   * - 0 value transfers are allowed
   * @param from The token sender's address
   * @param to The token receiver's address
   * @param value The amount of tokens to transfer (in weis)
   * @param addressOrAlias Address or alias of the token smart contract registered in Hancock
   * @param options Configuration of how the transaction will be send to the network
   * @returns The result of the request
   */
  public async transfer(
    from: string, to: string, value: string, addressOrAlias: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    if (isEmptyAny(to, from, addressOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(to, from)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(error(hancockNoKeyNorProviderError));
    }

    return this
      .adaptSend(from, to, value, addressOrAlias)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionService.signAndSend(resBody.data, options);

      });

  }

  /**
   * Transfer `tokens` from the `sender` account to the `to` account
   * The calling account must already have sufficient tokens approved for spending from the `sender` account and
   * - Sender account must have sufficient balance to transfer
   * - Spender must have sufficient allowance to transfer
   * - 0 value transfers are allowed
   * @param from The aproved spender's address
   * @param sender The token sender's address
   * @param to The token receiver's address
   * @param value The amount of tokens to transfer (in weis)
   * @param addressOrAlias Address or alias of the token smart contract registered in Hancock
   * @param options Configuration of how the transaction will be send to the network
   * @returns The result of the request
   */
  public async transferFrom(
    from: string, sender: string, to: string, value: string, addressOrAlias: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    if (isEmptyAny(to, from, addressOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(to, from)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(error(hancockNoKeyNorProviderError));
    }

    return this
      .adaptTransferFrom(from, sender, to, value, addressOrAlias)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionService.signAndSend(resBody.data, options);

      });

  }

  /**
   * Returns the amount of tokens approved by the owner that can be transferred to the spender's account
   * @param from The caller's address
   * @param tokenOwner The token owner's address
   * @param spender The token spender's address
   * @param value The amount of tokens to transfer (in weis)
   * @param addressOrAlias Address or alias of the token smart contract registered in Hancock
   * @param options Configuration of how the transaction will be send to the network
   * @returns The result of the request
   */
  public async allowance(
    from: string, tokenOwner: string, spender: string, addressOrAlias: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    if (isEmptyAny(spender, from, addressOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(from, spender)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(error(hancockNoKeyNorProviderError));
    }

    return this
      .adaptAllowance(from, tokenOwner, spender, addressOrAlias)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionService.signAndSend(resBody.data, options);

      });

  }

  /**
   * Get the token balance for account `tokenOwner`
   * @param addressOrAlias Address or alias of the token smart contract registered in Hancock
   * @param tokenOwner The token owner's address
   * @returns The result of the request with the balance
   */
  public async getBalance(addressOrAlias: string, tokenOwner: string): Promise<HancockTokenBalanceResponse> {

    if (isEmptyAny(tokenOwner, addressOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(tokenOwner)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.balance}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias)
      .replace(/__ADDRESS__/, tokenOwner);

    return fetch(url)
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      )
      .then((resBody: any) => {
        return resBody.data;
      });
  }

  /**
   * Token owner can approve for `spender` to transferFrom(...) `tokens` from the token owner's account
   * @param from The token owner's address
   * @param spender The token spender's address
   * @param value The amount of tokens to transfer (in weis)
   * @param addressOrAlias Address or alias of the token smart contract registered in Hancock
   * @param options Configuration of how the transaction will be send to the network
   * @returns The result of the request
   */
  public async approve(
    from: string, spender: string, value: string, addressOrAlias: string, options: HancockInvokeOptions = {},
  ): Promise<HancockSignResponse> {

    if (isEmptyAny(spender, from, addressOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(from, spender)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(error(hancockNoKeyNorProviderError));
    }

    return this
      .adaptApprove(from, spender, value, addressOrAlias)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionService.signAndSend(resBody.data, options);

      });

  }

  /**
   * Retrieves the metadata of the token
   * @param addressOrAlias Address or alias of the token smart contract registered in Hancock
   * @returns name, symbol, decimals, and totalSupply of the token
   */
  public async getMetadata(addressOrAlias: string): Promise<HancockTokenMetadataResponse> {

    if (isEmpty(addressOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.metadata}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);

    return fetch(url)
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      )
      .then((resBody: any) => {
        return resBody.data;
      });
  }

  /**
   * Get the list of all tokens registered in Hancock
   * @returns The list of all tokens registered in Hancock
   */
  public async getAllTokens(): Promise<HancockTokenInstance[]> {

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.findAll}`
    .replace(/__DLT__/, SupportedPlatforms.ethereum);

    return fetch(url)
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      )
      .then((resBody: any) => {
        return resBody.data;
      });
  }

  private async adaptApprove(from: string, spender: string, value: string, addressOrAlias: string): Promise<HancockAdaptInvokeResponse> {

    if (isEmptyAny(from, spender, addressOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(from, spender)) {
      return Promise.reject(error(hancockFormatParameterError));
    }

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.approve}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);

    const body: HancockTokenApproveRequest = {
      from,
      spender,
      value,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );
  }

  private async adaptTransferFrom(from: string, sender: string, to: string, value: string, addressOrAlias: string): Promise<HancockAdaptInvokeResponse> {

    if (isEmptyAny(from, sender, addressOrAlias, to)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(from, sender, to)) {
      return Promise.reject(error(hancockFormatParameterError));
    }

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.transferFrom}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);

    const body: HancockTokenTransferFromRequest = {
      from,
      sender,
      to,
      value,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );
  }

  private async adaptSend(from: string, to: string, value: string, addressOrAlias: string): Promise<HancockAdaptInvokeResponse> {

    if (isEmptyAny(from, addressOrAlias, to)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(from, to)) {
      return Promise.reject(error(hancockFormatParameterError));
    }

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.transfer}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);

    const body: HancockTokenTransferRequest = {
      from,
      to,
      value,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );
  }

  private async adaptAllowance(from: string, tokenOwner: string, spender: string, addressOrAlias: string): Promise<HancockAdaptInvokeResponse> {

    if (isEmptyAny(from, spender, addressOrAlias, tokenOwner)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(from, spender, tokenOwner)) {
      return Promise.reject(error(hancockFormatParameterError));
    }

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.allowance}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);

    const body: HancockTokenAllowanceRequest = {
      from,
      tokenOwner,
      spender,
    };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      );
  }

}
