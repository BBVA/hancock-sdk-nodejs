## HancockEthereumProtocolClient

### Introduction

We can use this interface to manage Hancock's protocol operations

### Encode transaction with Hancock's protocol

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.protocol.encode(
    'transfer',
    10000000000000000000,
    '0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91',
    '',
    'ethereum'
  );
  console.log(result.data.qrEncode);

```

Console output:
```bash
hancock://qr?code=%7B%22action%22%3A%22transfer%22%2C%22body%22%3A%7B%22value%22%3A%2210000000000000000000%22%2C%22to%22%3A%220xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91%22%7D%2C%22dlt%22%3A%22ethereum%22%7D
```

### Decode transaction with Hancock's protocol

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.protocol.decode('code=%7B%22action%22%3A%22transfer%22%2C%22body%22%3A%7B%22value%22%3A%2210000000000000000000%22%2C%22to%22%3A%220xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91%22%7D%2C%22dlt%22%3A%22ethereum%22%7D');
  console.log(result.data);

```

Console output:
```bash
{
  "action": "transfer",
  "body": {
    "to": "0xf01b3c2131fb5bd8d1d1e5d44f8ad14a2728ec91",
    "value": "10000000000000000000",
    "data": ""
  },
  "dlt": "ethereum"
}
```
