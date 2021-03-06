import 'jest';

import { HancockEthereumClient } from '../client';

jest.mock('isomorphic-fetch');
jest.mock('../socket');
jest.mock('../utils');

describe('ethereum client constructor', async () => {

  const genericConfig = {
    host: 'genericHost',
    port: 1,
    base: 'genericBase',
    resources: { resource: 'genericResource' },
  };
  let config: any;
  const configAdapter: any = genericConfig;
  const configWallet: any = {};
  const configBroker: any = {};

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
    expect((client as any).config.adapter.host).toBe(genericConfig.host);
    expect((client as any).config.broker.host).toBe('ws://mockBroker');

  });

});
