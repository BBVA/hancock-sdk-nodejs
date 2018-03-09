export interface IWallet {
  privateKey: string;
  publicKey: string;
  address: string;
}

export interface ITransaction {
  _id: string;
  userId: string;
  tx: any;
  dltUrl: string;
  signDate: string;
}

export interface IApiListTransactionResponse {
  data: ITransaction[];
}

export interface IApiSendSignedTxResponse {
  success: boolean;
}

export interface IApiUpdateTxResponse {
  success: boolean;
}
