## HancockEthereumWalletClient

### Introduction

We can use this interface to do operations related with blockchain wallets

### Generate new wallet

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const wallet = hancockEthClient.wallet.generate();
  console.log(wallet);

```

Console output:
```bash
{
  privateKey: '0xd06026d5b8664036bdec0a924b8c7360566e678a2291e9440156365b040a7b83';
  publicKey: '0x274b9c789c110632d54a3a81bf177f8b94450c217d094b693c89557ff99b97d8';
  address: '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF';
}
```

### Consult wallet balance

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const balance = await hancockEthClient.wallet.getBalance('0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF');
  console.log(balance);

```

Console output:
```bash
# Balance is given in weis
1000000000000000000
```