import fetch from 'isomorphic-fetch';
import { checkStatus, error, errorHandler, SupportedPlatforms } from '../../common';
import {
  hancockFormatParameterError,
  hancockInvalidParameterError,
  hancockNoKeyNorProviderError,
} from '../../error';
import {
  HancockSignResponse,
  HancockTransferRequest,
  InitialHancockConfig,
} from '../../hancock.model';
import {
  HancockAdaptInvokeResponse,
  HancockInvokeOptions,
} from '../../hancock.model';
import { HancockEthereumSocket } from '../socket';
import { HancockEthereumTransactionService } from '../transaction';
import { isAddressAny, isEmptyAny, normalizeAddress } from '../utils';

/**
 * [[include:HancockEthereumTransferService.md]]
 */
export class HancockEthereumTransferService {

  private adapterApiBaseUrl: string;
  private brokerBaseUrl: string;

  constructor(private config: InitialHancockConfig, private transactionService: HancockEthereumTransactionService) {
    this.adapterApiBaseUrl = `${config.adapter.host}:${config.adapter.port}${config.adapter.base}`;
    this.brokerBaseUrl = `${config.broker.host}:${config.broker.port}${config.broker.base}`;
  }

  /**
   * Send ethers between two accounts
   * @param from The sender address
   * @param to The receiver address
   * @param value The amount of ether to transfer (in weis)
   * @param options Configuration of how the transaction will be send to the network
   * @param data Extra information that will be sent with the transfer (a remark for example)
   * @returns An event emmiter that will fire the watched "transfers" events
   */
  public async send(from: string, to: string, value: string, options: HancockInvokeOptions = {}, data: string = ''): Promise<HancockSignResponse> {

    if (isEmptyAny(to, from)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(to, from)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    if (!options.signProvider && !options.privateKey) {
      return Promise.reject(error(hancockNoKeyNorProviderError));
    }

    return this
      .adaptSend(from, to, value, data)
      .then((resBody: HancockAdaptInvokeResponse) => {

        return this.transactionService.signAndSend(resBody.data, options);

      });

  }

  /**
   * Create a websocket subscription to watch transactions of type "transfers" in the network
   * @param addresses An array of address that will be added to the watch list
   * @param consumer A consumer plugin previously configured in hancock that will handle each received event
   * @returns An event emmiter that will fire the watched "transfers" events
   */
  public subscribe(addresses: string[] = [], consumer: string = ''): HancockEthereumSocket {

    const url: string = `${this.brokerBaseUrl + this.config.broker.resources.events}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum)
      .replace(/__ADDRESS__/, '')
      .replace(/__SENDER__/, '')
      .replace(/__CONSUMER__/, consumer);

    const hancockSocket = new HancockEthereumSocket(url, consumer);
    hancockSocket.on('ready', () => {
      hancockSocket.addTransfer(addresses);
    });

    return hancockSocket;

  }

  private async adaptSend(from: string, to: string, value: string, data: string): Promise<HancockAdaptInvokeResponse> {

    if (isEmptyAny(from, to)) {
      return Promise.reject(error(hancockInvalidParameterError));
    }
    if (!isAddressAny(from, to)) {
      return Promise.reject(error(hancockFormatParameterError));
    }
    from = normalizeAddress(from);
    to = normalizeAddress(to);

    const url: string = `${this.adapterApiBaseUrl + this.config.adapter.resources.transfer}`
      .replace(/__DLT__/, SupportedPlatforms.ethereum);

    const body: HancockTransferRequest = {
      from,
      to,
      value,
      data,
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
