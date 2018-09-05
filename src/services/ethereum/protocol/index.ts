import fetch from 'isomorphic-fetch';
import {
  HancockProtocolDecodeRequest,
  HancockProtocolDlt,
  HancockProtocolEncode,
  HancockProtocolEncodeResponse,
} from '../..';
import {
  HancockProtocolAction,
  HancockProtocolDecodeResponse,
  InitialHancockConfig,
} from '../../hancock.model';
import { checkStatus, errorHandler } from '../common';
import { hancockFormatParameterError,
   hancockInvalidParameterError } from '../error';
import { error, isAddress, isEmpty, normalizeAddress } from '../utils';

export class HancockEthereumProtocolClient {

  private adapterApiBaseUrl: string;

  constructor(private config: InitialHancockConfig) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
  }

  public async encodeProtocol(
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

  public async decodeProtocol(code: string): Promise<HancockProtocolDecodeResponse> {

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
