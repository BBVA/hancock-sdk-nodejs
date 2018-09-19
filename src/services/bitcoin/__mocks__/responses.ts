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
