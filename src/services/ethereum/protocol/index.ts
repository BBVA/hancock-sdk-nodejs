import fetch from 'isomorphic-fetch';
import {
  HancockProtocolDecodeRequest,
  HancockProtocolDlt,
  HancockProtocolEncode,
  HancockProtocolEncodeResponse,
} from '../..';
import { checkStatus, error, errorHandler } from '../../common';
import { hancockFormatParameterError,
   hancockInvalidParameterError } from '../../error';
import {
  HancockProtocolAction,
  HancockProtocolDecodeResponse,
  InitialHancockConfig,
} from '../../hancock.model';
import { isAddress, isEmpty, normalizeAddress } from '../utils';

/**
 * [[include:HancockEthereumProtocolClient.md]]
 */
export class HancockEthereumProtocolClient {

  private adapterApiBaseUrl: string;

  constructor(private config: InitialHancockConfig) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
  }

  /**
   * Encode an operation over the blockchain (a static predefined transaction for example) using Hancock's protocol
   * @param code The sender address
   * @returns The content successfully encoded
   */
  public async encode(
    action: HancockProtocolAction, value: string, to: string, data: string, dlt: HancockProtocolDlt,
  ): Promise<HancockProtocolEncodeResponse> {

    if (isEmpty(to)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddress(to)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    to = normalizeAddress(to);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.encode}`;
    const body: HancockProtocolEncode = {
      action,
      body: {
        value,
        to,
        data,
      },
      dlt,
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
   * Decode content (a static predefined transaction for example) encoded Hancock's protocol
   * @param code The encoded content
   * @returns The encoded content successfully decoded
   */
  public async decode(code: string): Promise<HancockProtocolDecodeResponse> {

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.decode}`;
    const body: HancockProtocolDecodeRequest = {
      code,
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
