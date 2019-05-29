## HancockEthereumTokenService

### Introduction

We can use this interface to manage operations related with ERC20 Ethereum tokens over blockchain

### Token registration

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.token.register(
    'token-contract-alias',
    '0x28a0686efb7dd9b625288a08649a6278cc4fd154'
  );
  console.log(result);

```

Console output:
```bash
{
  success: true
}
```

### Transfer token

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.token.transfer(
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
    '0x28a0686efb7dd9b625288a08649a6278cc4fd154',
    250000000,
    'token-contract-alias',
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

### Transfer token from

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.token.transferFrom(
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
    '0x28a0686efb7dd9b625288a08649a6278cc4fd154',
    '0x6c0a14f7561898b9ddc0c57652a53b2c6665443e',
    250000000,
    'token-contract-alias',
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

### Allowance to transfer tokens

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.token.allowance(
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
    '0x6c0a14f7561898b9ddc0c57652a53b2c6665443e',
    '0x6c0a14f7561898b9ddc0c57652a53b2c6665443e',
  );
  console.log('allowance: ' + result);

```

Console output:
```bash
allowance: 12
```

### Get token balance

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.token.getBalance(
    'contract-alias',
    '0x6c0a14f7561898b9ddc0c57652a53b2c6665443e'
  );
  console.log(result);

```

Console output:
```bash
{
  balance: "120000000000000000",
  decimals: 18
}
```

### Get token balance

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.token.getBalance(
    'contract-alias',
    '0x6c0a14f7561898b9ddc0c57652a53b2c6665443e'
  );
  console.log(result);

```

Console output:
```bash
{
  balance: "120000000000000000",
  decimals: 18
}
```

### Approve transfer

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.token.approve(
    '0x6c0a14f7561898b9ddc0c57652a53b2c6665443e',
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
    '3',
    'contract-alias',
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
