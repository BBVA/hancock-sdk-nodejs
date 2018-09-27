## HancockEthereumSmartContractClient

### Introduction

We can use this interface to manage operations related with Ethereum smart contracts over blockchain

### Smart contract invoke

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.smartcontract.invoke(
    'token-contract-alias',
    'balanceOf',
    ['0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF'],
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
    {privateKey: '0xd06026d5b8664036bdec0a924b8c7360566e678a2291e9440156365b040a7b83'}
  );
  console.log(result);

```

Console output:
```bash
{
  success: true
}
```

### Subscribe to smart contract events

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const subscription = hancockEthClient.smartcontract.subscribe([
    'contract-alias',
  ]);
  subscription.on('event', (data) => { console.log(data) });
  subscription.on('error', (error) => { console.error(error) });

```
