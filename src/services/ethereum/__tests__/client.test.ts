
import 'jest';
import fetch from 'isomorphic-fetch';
import { HancockEthereumClient } from '../client';
import * response from '../__mocks__/responses';

jest.mock('isomorphic-fetch');

describe('EthereumClient integration tests', () => {

  let clientInstance: HancockEthereumClient;
  const alias: string = 'mockedAlias';
  const address: string = '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d';

  beforeAll(() => {

    clientInstance = new HancockEthereumClient();

  });

  beforeEach(() => {

  });

  describe('::invokeSmartContract', () => {

    const method: string = 'mockedMethod';
    const params: string[] = ['mockedParams'];
    const from: string = 'mockedFrom';

    describe('given a private key', () => {

      const options: any = {
        privateKey: '0x4dc34569751ddb28166ff21eb5b8ad2f070d9cb205a28d142da13c8996368c75'
      };

      it('should fail if there is neither privateKey nor signProvider', async () => {

        try {

          const result = await clientInstance.invokeSmartContract(alias, method, params, from);
          fail('It should fail');

        } catch (e) {

          expect(e).toEqual('No key nor provider');

        }

      });

      it('should adapt a smartContract invoke by alias, sign and send it to dlt', async () => {

        fetch
          .once(JSON.stringify(response.SC_INVOKE_ADAPT_RESPONSE))
          .once(JSON.stringify(response.SC_INVOKE_SEND_SIGNED_TX_RESPONSE));

        const result = await clientInstance.invokeSmartContract(alias, method, params, from, options);

        const firstApiCall: any = fetch.mock.calls[0];
        expect(firstApiCall[0]).toEqual('http://mockAdapter:6666mockBase/mockInvoke/mocked-alias');
        expect(firstApiCall[1].method).toEqual('POST');
        expect(firstApiCall[1].body).toEqual(JSON.stringify({ method, from, params, action: 'send' }));

        const secondApiCall: any = fetch.mock.calls[1];
        expect(secondApiCall[0]).toEqual('http://mockWallet:6666mockBasemockSendSignedTx');
        expect(secondApiCall[1].method).toEqual('POST');
        expect(secondApiCall[1].body).toEqual(JSON.stringify({ tx: response.SC_INVOKE_SIGNED_TX }));

        expect(result).toEqual(response.SC_INVOKE_SEND_SIGNED_TX_RESPONSE);

      });

    });

  });

});

