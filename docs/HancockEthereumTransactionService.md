## HancockEthereumTransactionService

### Introduction

We can use this interface to manage transactions over blockchain

### Sign transaction locally and send it to the blockchain

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const signedTransaction = hancockEthClient.transaction.sign({
    "from": "0xde8e772f0350e992ddef81bf8f51d94a8ea9216d",
    "nonce": "0x00",
    "gasPrice": "0x04a817c800",
    "gasLimit": "0x5208",
    "to": "0xd452cb5c4ba4c71ef7c14db0d930dc35c4c97ac7",
    "value": "0x0de0b6b3a7640000",
    "data": "",
    "chainId": 1
  });

  const result = await hancockEthClient.transaction.sendSigned(signedTransaction);
  console.log(result);

```

Console output:
```bash
{
  success: true
}
```

### Subscribe to transactions

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const subscription = hancockEthClient.transaction.subscribe([
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF'
  ]);
  subscription.on('tx', (data) => { console.log(data) });
  subscription.on('error', (error) => { console.error(error) });

```
