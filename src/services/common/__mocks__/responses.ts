import { DltRawTransaction, DltSignedTransaction } from '../../hancock.model';

export const RAW_TX: DltRawTransaction = {};
export const PRIVATE_KEY: string = 'whatever';
export const SIGNED_TX: DltSignedTransaction = 'whatever';

export const SEND_SIGNED_TX_RESPONSE = {
  success: true,
  txReceipt: {},
};

export const SEND_TX_RESPONSE = SEND_SIGNED_TX_RESPONSE;

export const SEND_TO_SIGN_RESPONSE = {
  success: true,
};

export const SC_INVOKE_ADAPT_RESPONSE = {
  result: {
    code: 200,
    description: 'Smart Contract - Success',
  },
  data: RAW_TX,
};

export const SC_CALL_RESPONSE = {
  result: {
    code: 200,
    description: 'Smart Contract - Success',
  },
  data: {},
};

export const GET_BALANCE_RESPONSE = {
  result: {
    code: 202,
    description: 'Ethereum - Operation successfully requested',
  },
  data: {
    balance: '10000',
  },
};

export const GET_BALANCE_ERROR_RESPONSE = {
  result: {
    code: 500,
    description: 'Ethereum - Blockchain request error',
  },
};

export const GET_TOKEN_BALANCE_RESPONSE = {
  result: {
    code: 202,
    description: 'Ethereum Token - Operation successfully requested',
  },
  data: {
    balance: 10000,
    decimals: 18,
  },
};

export const GET_TOKEN_BALANCE_ERROR_RESPONSE = {
  result: {
    code: 500,
    description: 'Ethereum Token - Blockchain request error',
  },
};

export const GET_TOKEN_METADATA_RESPONSE = {
  result: {
    code: 200,
    description: 'Ethereum Token - Operation successfully requested',
  },
  data: {
    name: 'mockedName',
    symbol: 'mockedSymbol',
    decimals: 18,
    totalSupply: 100000,
  },
};

export const GET_TOKEN_METADATA_ERROR_RESPONSE = {
  result: {
    code: 500,
    description: 'Ethereum Metadata Token - Blockchain request error',
  },
};

export const COMMON_RESPONSE_ERROR = {
  code_internal: 'DC4000',
  code_http: 400,
  message: 'Bad request',
};

export const ERROR: any = {
  body: {
    code_internal: 'DC4040',
    code_http: 404,
    message: 'Not Found',
  },
};
