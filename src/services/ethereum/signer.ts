import * as etherTx from 'ethereumjs-tx';
import * as etherWallet from 'ethereumjs-wallet';
import { DltWallet, DltRawTransaction } from '../hancock.model';

export interface EthereumWallet extends DltWallet {
  privateKey: string;
  publicKey: string;
  address: string;
}

export type EthereumRawTransaction = DltRawTransaction;


export function generateWallet(): EthereumWallet {

  const wallet: any = etherWallet.Wallet.generate();

  return {
    privateKey: wallet.getPrivateKeyString(),
    publicKey: wallet.getPublicKeyString(),
    address: wallet.getAddressString(),
  };

}

export function signTx(rawTx: EthereumRawTransaction, privateKey: string): string {

  const key = Buffer.from(privateKey.substr(2), 'hex');

  const tx = new etherTx.Tx(rawTx);
  tx.sign(key);

  return `0x${tx.serialize().toString('hex')}`;

}
