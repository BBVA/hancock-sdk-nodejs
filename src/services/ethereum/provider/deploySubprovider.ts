import Subprovider from 'web3-provider-engine/subproviders/subprovider';
import { HancockEthereumClient } from './../client';

/**
 * @hidden
 */
export class DeploySubprovider extends Subprovider {

  public provider: string;
  public hancockClient: HancockEthereumClient;

  constructor(provider: string, hancockClient: any) {
    super();
    this.provider = provider;
    this.hancockClient = hancockClient;
  }

  public handleRequest(payload: any, next: any, end: any) {

    console.log('Intercepted ---> ', payload.method);

    switch (payload.method) {
      case 'eth_sendTransaction':
        console.info('Intercepted Ethereum Send Transaction');
        this.emitPayload({ method: 'eth_getTransactionCount', params: [payload.params[0].from, 'pending'] },
          (error: any, data: any) => {
            if (error) {
              console.log(error);
              end(null, null);
            } else {
              this.addNonceAndSend(data, payload.params[0], end);
            }
          },
        );
        return;
      default:
        next();
        return;
    }
  }

  private addNonceAndSend(data: any, rawTx: any, end: any) {
    const socket = this.subscribe([rawTx.from], end, rawTx.to == null);
    rawTx.nonce = data.result;
    this.hancockClient.transaction
      .sendToSignProvider(rawTx, this.provider)
      .then((response: any) => console.log(response))
      .catch((err: any) => {
        console.log(err);
        socket.closeSocket();
      });
  }

  private subscribe(from: any, end: any, deploy: boolean) {

    const socket = this.hancockClient.transaction.subscribe(from, undefined, 'pending');

    socket.on('tx', (message: any) => {

      const expectedTxKind = deploy ? 'deployment' : 'transaction';

      console.log('received transaction', message.body);
      console.log(`expecting: ${expectedTxKind} `);

      socket.closeSocket();

      if (!deploy || (message.body.to === null || message.body.to === '0x0000000000000000000000000000000000000000')) {

        end(null, message.body.hash);

      } else {

        end(new Error(`Wrong ${expectedTxKind} received`), null);

      }

    });

    return socket;
  }

}
