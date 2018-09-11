## HancockEthereumTokenClient

### Introduction

We can use this interface to manage operations related with ERC20 Ethereum tokens over blockchain

### Token transfer

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.token.transfer(
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
    '0x28a0686efb7dd9b625288a08649a6278cc4fd154',
    250000000,
    'token-contract-alias'
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
