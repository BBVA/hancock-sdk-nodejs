import 'jest';

import { HancockEthereumClient } from '../client';
import { hancockWalletError } from '../error';
import * as signer from '../signer';
import * as errorUtils from '../utils';

jest.mock('isomorphic-fetch');
jest.mock('../socket');
jest.mock('../utils');
jest.mock('../signer');

describe('ethereum client constructor', async () => {

  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: { resource: 'genericResource' },
  };
  let config: any;
  const configAdapter: any = genericConfig;
  const configWallet: any = genericConfig;
  const configBroker: any = genericConfig;

  beforeEach(() => {

    config = {
      adapter: configAdapter,
      wallet: configWallet,
      broker: configBroker,
    };
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call constructor correctly', async () => {

    configAdapter.host = 'adapterHost';
    const client = new HancockEthereumClient(config);
    const adapterurl = 'adapterHost:1genericBase';
    const brokerurl = (client as any).config.broker.host + ':' + (client as any).config.broker.port + (client as any).config.broker.base;
    expect((client as any).adapterApiBaseUrl).toBe(adapterurl);
    expect((client as any).brokerBaseUrl).toBe(brokerurl);

  });

  it('should call constructor without options correctly', async () => {

    configAdapter.host = 'adapterHost';
    const client = new HancockEthereumClient();
    const adapterurl = (client as any).config.adapter.host + ':' + (client as any).config.adapter.port + (client as any).config.adapter.base;
    const brokerurl = (client as any).config.broker.host + ':' + (client as any).config.broker.port + (client as any).config.broker.base;
    const walleturl = (client as any).config.wallet.host + ':' + (client as any).config.wallet.port + (client as any).config.wallet.base;
    expect((client as any).adapterApiBaseUrl).toBe(adapterurl);
    expect((client as any).brokerBaseUrl).toBe(brokerurl);
    expect((client as any).walletApiBaseUrl).toBe(walleturl);

  });
});

describe('ethereum client', async () => {

  let client: HancockEthereumClient;
  const errorFnMock = errorUtils.error as jest.Mock;
  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: { resource: 'genericResource' },
  };
  let config: any;
  const configAdapter: any = genericConfig;
  const configWallet: any = genericConfig;
  const configBroker: any = genericConfig;

  beforeEach(() => {
    config = {
      adapter: configAdapter,
      wallet: configWallet,
      broker: configBroker,
    };
    client = new HancockEthereumClient(config);

    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should call generateWallet correctly', async () => {

    client.generateWallet();

    expect(signer.generateWallet).toHaveBeenCalledTimes(1);

  });

  it('should fail calling generateWallet if there is an error generating the wallet', async () => {

    (signer.generateWallet as jest.Mock).mockImplementationOnce(() => { throw new Error('Boom!'); });

    try {

      client.generateWallet();
      fail('it should fail');

    } catch (e) {

      expect(e).toEqual(hancockWalletError);

    }

  });

});
