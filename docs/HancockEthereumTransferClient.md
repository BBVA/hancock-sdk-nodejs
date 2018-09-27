## HancockEthereumTransferClient

### Introduction

We can use this interface to manage transfers of ether over blockchain

### Send transfer

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.transfers.send(
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
    '0x28a0686efb7dd9b625288a08649a6278cc4fd154',
    1000000000000000000,
    {
      privateKey: '0xd06026d5b8664036bdec0a924b8c7360566e678a2291e9440156365b040a7b83'
    }
  );
  console.log(result);

```

Console output:
```bash
{
  success: true
}
```

### Subscribe to transfers

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const subscription = hancockEthClient.transfers.subscribe([
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF'
  ]);
  subscription.on('tx', (data) => { console.log(data) });
  subscription.on('error', (error) => { console.error(error) });

```
