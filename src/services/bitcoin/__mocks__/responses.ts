export const GET_BALANCE_RESPONSE = {
  result: {
    code: 202,
    description: 'Bitcoin - Operation successfully requested',
  },
  data: {
    balance: '10000',
  },
};

export const GET_BALANCE_ERROR_RESPONSE = {
  result: {
    code: 500,
    description: 'Bitcoin - Blockchain request error',
  },
};

export const GET_TOKEN_BALANCE_RESPONSE = {
  result: {
    code: 202,
    description: 'Bitcoin Token - Operation successfully requested',
  },
  data: {
    balance: 10000,
    decimals: 18,
  },
};

export const RAW_TX = {};

export const SC_INVOKE_ADAPT_RESPONSE = {
  result: {
    code: 200,
    description: 'Smart Contract - Success',
  },
  data: RAW_TX,
};

export const ERROR: any = {
  body: {
    code_internal: 'DC4040',
    code_http: 404,
    message: 'Not Found',
  },
};
