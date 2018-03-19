import { HancockEthereumClient } from './src/index';

const cli = new HancockEthereumClient({
  broker: { port: 3001 },
  wallet: { port: 3002 },
  adapter: { port: 3004 }
});

// console.log(cli.generateWallet());
// const adapterPromise = cli.callSmartContract('0x965cf4d51ddbb5505588a0de66c34baa8eb9e10d', 'getName', [], '0x6c0a14f7561898b9ddc0c57652a53b2c6665443e');

registerContract().then((res: any) => {

  console.log(res);
});

function registerContract() {

  return cli.registerSmartContract(
    'testSM1',
    '0x1111111111111111111111111111111111111112',
    [{"constant":false,"inputs":[],"name":"destroyContract","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"duration","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"validityStart","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"beneficiary","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_data","type":"uint256"}],"name":"attest","outputs":[{"name":"","type":"int256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"claim","outputs":[{"name":"","type":"int256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"validityLife","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"attestedFinalValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"device","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"attestedInitialValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"voucherState","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"inputs":[{"name":"_beneficiary","type":"address"},{"name":"_device","type":"address"},{"name":"_duration","type":"uint256"},{"name":"_conditionOperator","type":"uint256"},{"name":"_conditionValue","type":"uint256"}],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"method","type":"string"},{"indexed":false,"name":"newState","type":"string"},{"indexed":false,"name":"message","type":"string"}],"name":"VoucherEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"method","type":"string"},{"indexed":false,"name":"message","type":"string"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"timestamp","type":"uint256"},{"indexed":false,"name":"method","type":"string"},{"indexed":false,"name":"newState","type":"string"},{"indexed":false,"name":"attestedValue","type":"uint256"}],"name":"VoucherIssuanceEvent","type":"event"}]
  );
  

}

// const adapterPromise = cli.adaptInvokeSmartContract('0x965cf4d51ddbb5505588a0de66c34baa8eb9e10d', 'getName', [], '0x6c0a14f7561898b9ddc0c57652a53b2c6665443e');

// adapterPromise.then((res: any) => {
//   console.log(res);

//   const adapterPromise = cli.sendTransaction(res.data).then((response) => {

//     console.log(response);

//   });
  
// })