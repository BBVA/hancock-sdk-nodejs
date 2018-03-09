import * as etherTx from 'ethereumjs-tx';
import * as etherWallet from 'ethereumjs-wallet';
import { IWallet, ITransaction } from './ethereum-signer.model';

export function generateWallet(): IWallet {

  const wallet: any = etherWallet.Wallet.generate();

  return {
    privateKey: wallet.getPrivateKeyString(),
    publicKey: wallet.getPublicKeyString(),
    address: wallet.getAddressString(),
  };

}

export function signTx(rawTx: ITransaction, privateKey: string): string {

  const key = Buffer.from(privateKey.substr(2), 'hex');

  const tx = new etherTx.Tx(rawTx);
  tx.sign(key);

  return `0x${tx.serialize().toString('hex')}`;

}
