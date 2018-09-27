import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'safe-buffer';
import { DltRawTransaction, DltSignedTransaction, DltWallet } from '../hancock.model';

export interface BitcoinWallet extends DltWallet {
  privateKey: string;
  publicKey: string;
  address: string;
}

export type BitcoinRawTransaction = DltRawTransaction;
export type BitcoinSignedTransaction = DltSignedTransaction;

/**
 * @hidden
 */
export function generateWallet(): BitcoinWallet {

  const keyPair: bitcoin.ECPair = bitcoin.ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });

  return {
    privateKey: keyPair.privateKey.toString('hex'),
    publicKey: keyPair.publicKey.toString('hex'),
    address,
  };

}

/**
 * @hidden
 */
export function signTx(rawTx: BitcoinRawTransaction, privateKey: string): string {

  const key: Buffer = Buffer.from(privateKey, 'hex');
  const keyPair: bitcoin.ECPair = bitcoin.ECPair.fromPrivateKey(key as any);

  const tx = bitcoin.Transaction.fromHex(rawTx);
  const txb = bitcoin.TransactionBuilder.fromTransaction(tx, bitcoin.networks.bitcoin);

  tx.ins.forEach((input: bitcoin.In, index: number) => {
    txb.sign(index, keyPair);
  });

  console.log(JSON.stringify(tx, null, 4));

  return txb.build().toHex();

}
