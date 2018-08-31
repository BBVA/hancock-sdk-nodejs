import * as ProviderEngine from 'web3-provider-engine';
import * as RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import { DeploySubprovider } from './deploySubprovider';

export class HancockDeployProvider {

  public engine: any;

  constructor(provider: string, providerUrl: string, hancockClient: any) {

    this.engine = new ProviderEngine();
    this.engine.addProvider(new DeploySubprovider(provider, hancockClient));
    this.engine.addProvider(new RpcSubprovider({rpcUrl: providerUrl}));

    this.engine.on('error', (err: Error) => {
      console.error(err.stack);
    });

    this.engine.start();

  }

  public sendAsync() {
    this.engine.sendAsync.apply(this.engine, arguments);
  }

  public send() {
    return this.engine.send.apply(this.engine, arguments);
  }
}
