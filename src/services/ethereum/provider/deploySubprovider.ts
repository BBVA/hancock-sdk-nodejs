import Subprovider from 'web3-provider-engine/subproviders/subprovider';

/**
 * @hidden
 */
export class DeploySubprovider extends Subprovider {

  public provider: string;
  public hancockClient: any;

  constructor(provider: string, hancockClient: any) {
    super();
    this.provider = provider;
    this.hancockClient = hancockClient;
  }

  public async handleRequest(payload: any, next: any, end: any) {

    switch (payload.method) {
      case 'eth_sendTransaction':
        console.log('Intercepted Ethereum Send Transaction');
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
    this.hancockClient
      .sendToSignProvider(rawTx, this.provider)
      .then((response: any) => console.log(response))
      .catch((err: any) => {
        console.log(err);
        socket.closeSocket();
      });
  }

  private subscribe(from: any, end: any, deploy: boolean) {
    const socket = this.hancockClient.subscribe(from);
    socket.on('tx', (message: any) => {
      console.log(message.body);
      if (deploy && (message.body.to === null || message.body.to === '0x0000000000000000000000000000000000000000' ) || !deploy) {
        socket.closeSocket();
        end(null, message.body.hash);
      }
    });
    return socket;
  }

}
