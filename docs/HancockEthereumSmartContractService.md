## HancockEthereumSmartContractService

### Introduction

We can use this interface to manage operations related with Ethereum smart contracts over blockchain

### Smart contract deployment

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.smartContract.deploy(
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
    {privateKey: '0xd06026d5b8664036bdec0a924b8c7360566e678a2291e9440156365b040a7b83'},
    'https://s3-eu-west-1.amazonaws.com/ethereum/eip20/EIP20',
    'EIP20',
    ['1000', 'HancockTest1', '18', 'HT1']
  );
  console.log(result);

```

Console output:
```bash
{
  blockHash: '0x4c5dae42c9ea1b90912b6f7128a9d1213d14f70ca12b06f417b4d519b8cfe543';
  blockNumber: 4460598;
  transactionId: '0x241dbc176195e58c7505812e7c9a04bd83c5dd59b0684e39911f88bedce5c6bf';
  from: '0x8a37b79e54d69e833d79cac3647c877ef72830e1';
  to: null;
  value: IHancockSocketCurrency;
  data: '';
  fee: IHancockSocketCurrency;
  newContractAddress: '0x54a298ee9fccbf0ad8e55bc641d3086b81a48c41';
  timestamp: 1559038793;
}
```

### Smart contract invoke

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const result = await hancockEthClient.smartContract.invoke(
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
  success: true,
  transactionHash: '0x241dbc176195e58c7505812e7c9a04bd83c5dd59b0684e39911f88bedce5c6bf'
}
```

### Subscribe to smart contract deployment

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const subscription = hancockEthClient.smartContract.subscribeToDeployments([
    '0x34C54CB0d5cD1c0f5240324618adAD15ad6646AF',
  ]);
  subscription.on(CONSUMER_EVENT_KINDS.SmartContractDeployment, (data) => { console.log(data) });
  subscription.on(CONSUMER_EVENT_KINDS.Error, (error) => { console.error(error) });

```

### Subscribe to smart contract transactions

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const subscription = hancockEthClient.smartContract.subscribeToTransactions([
    'contract-alias',
  ]);
  subscription.on(CONSUMER_EVENT_KINDS.SmartContractTransaction, (data) => { console.log(data) });
  subscription.on(CONSUMER_EVENT_KINDS.Error, (error) => { console.error(error) });

```

### Subscribe to smart contract events

```javascript
  const hancockEthClient = new HancockEthereumClient(config);

  const subscription = hancockEthClient.smartContract.subscribeToEvents([
    'contract-alias',
  ]);
  subscription.on(CONSUMER_EVENT_KINDS.SmartContractEvent, (data) => { console.log(data) });
  subscription.on(CONSUMER_EVENT_KINDS.Error, (error) => { console.error(error) });

```
