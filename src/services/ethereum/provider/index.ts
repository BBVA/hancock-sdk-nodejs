import * as ProviderEngine from 'web3-provider-engine';
import * as FiltersSubprovider from 'web3-provider-engine/subproviders/filters.js';
import * as RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
import { DeploySubprovider } from './deploySubprovider';

export class HancockDeployProvider {

  public engine: any;
  private from!: string;

  constructor(provider: string, providerUrl: string, from: string, hancockClient: any) {

    this.from = from;

    this.engine = new ProviderEngine();

    this.engine.addProvider(new FiltersSubprovider());
    this.engine.addProvider(new DeploySubprovider(provider, [this.from], hancockClient));
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

  public getAddress(i: number) {
    return this.from;
  }

  public getAddresses() {
    return [this.from];
  }

}
