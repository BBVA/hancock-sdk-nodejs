
import fetch from 'isomorphic-fetch';
import {
  HancockTokenAllowanceRequest,
  HancockTokenApproveRequest,
  HancockTokenMetadataResponse,
  HancockTokenTransferRequest,
} from '../..';
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
import { checkStatus, errorHandler } from '../common';
import {
  hancockFormatParameterError,
  hancockInvalidParameterError,
  hancockNoKeyNorProviderError,
} from '../error';
import { HancockEthereumTransactionClient } from '../transaction';
import { error, isAddress, isAddressAny, isEmpty, isEmptyAny, normalizeAddress, normalizeAddressOrAlias, normalizeAlias } from '../utils';

export class HancockEthereumTokenClient {

  private adapterApiBaseUrl: string;

  constructor(private config: InitialHancockConfig, private transactionClient: HancockEthereumTransactionClient) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
  }

  public async register(alias: string, address: DltAddress): Promise<HancockTokenRegisterResponse> {

    if (isEmptyAny(alias, address)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(address)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    alias = normalizeAlias(alias);
    address = normalizeAddress(address);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.register}`;
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

        return this.transactionClient.signAndSend(resBody, options);

      });

  }

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

        return this.transactionClient.signAndSend(resBody, options);

      });

  }

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

        return this.transactionClient.signAndSend(resBody, options);

      });

  }

  public async getBalance(addresOrAlias: string, address: string): Promise<HancockTokenBalanceResponse> {

    if (isEmptyAny(address, addresOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(address)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    address = normalizeAddress(address);
    addresOrAlias = normalizeAddressOrAlias(addresOrAlias);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.balance}`
      .replace(/__ADDRESS_OR_ALIAS__/, addresOrAlias)
      .replace(/__ADDRESS__/, address);

    return fetch(url)
      .then(
        (res: any) => checkStatus(res),
        (err: any) => errorHandler(err),
      )
      .then((resBody: any) => {
        return resBody.data;
      });
  }

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

        return this.transactionClient.signAndSend(resBody, options);

      });

  }

  public async getMetadata(addressOrAlias: string): Promise<HancockTokenMetadataResponse> {

    if (isEmpty(addressOrAlias)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);
    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.metadata}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);

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
    from = normalizeAddressOrAlias(from);
    spender = normalizeAddress(spender);
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.approve}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);
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
    from = normalizeAddress(from);
    sender = normalizeAddress(sender);
    to = normalizeAddress(to);
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.transferFrom}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);
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
    from = normalizeAddress(from);
    to = normalizeAddress(to);
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.transfer}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);
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
    from = normalizeAddress(from);
    tokenOwner = normalizeAddress(tokenOwner);
    spender = normalizeAddress(spender);
    addressOrAlias = normalizeAddressOrAlias(addressOrAlias);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.token.allowance}`.replace(/__ADDRESS_OR_ALIAS__/, addressOrAlias);
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
