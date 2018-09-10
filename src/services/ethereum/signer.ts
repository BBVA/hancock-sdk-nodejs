import * as etherTx from 'ethereumjs-tx';
import * as etherWallet from 'ethereumjs-wallet';
import { DltRawTransaction, DltSignedTransaction, DltWallet } from '../hancock.model';

// TODO: Resolve this situation in webpack, not here
const _etherTx: any = process.browser ? etherTx.Tx : (etherTx.default || etherTx);
const _etherWallet: any = process.browser ? etherWallet.Wallet : (etherWallet.default || etherWallet);

export interface EthereumWallet extends DltWallet {
  privateKey: string;
  publicKey: string;
  address: string;
}

export type EthereumRawTransaction = DltRawTransaction;
export type EthereumSignedTransaction = DltSignedTransaction;

export function generateWallet(): EthereumWallet {

  const wallet: any = _etherWallet.generate();

  return {
    privateKey: wallet.getPrivateKeyString(),
    publicKey: wallet.getPublicKeyString(),
    address: wallet.getAddressString(),
  };

}

export function signTx(rawTx: EthereumRawTransaction, privateKey: string): string {

  const key = Buffer.from(privateKey.substr(2), 'hex');

  const tx = new _etherTx(rawTx);
  tx.sign(key);

  return `0x${tx.serialize().toString('hex')}`;

}
