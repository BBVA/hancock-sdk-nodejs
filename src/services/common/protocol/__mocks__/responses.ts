
export const PROTOCOL_RESPONSE = {
  result: {
    code: 200,
    description: 'Smart Contract - Success',
  },
  data: {
    action: 'transfer',
    body: {
      to: '0xde8e772f0350e992ddef81bf8f51d94a8ea9216d',
      value: '100000000',
      data: '',
    },
    dlt: 'ethereum',
  },
};

export const ERROR: any = {
  body: {
    code_internal: 'DC4040',
    code_http: 404,
    message: 'Not Found',
  },
};
