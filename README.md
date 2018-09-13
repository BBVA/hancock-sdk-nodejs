# Hancock SDK client

## Before use this package
This package is distributed under our private [KST npm registry](http://dev.npm.kickstartteam.es/).
You have to configure your own .npmrc file in order to have access to it. Ask somebody of our team the `SECRET_TOKEN`:

```bash
# .npmrc
@kst-hancock:registry=http://dev.npm.kickstartteam.es/
//dev.npm.kickstartteam.es/:_authToken="<SECRET_TOKEN>"
```

## Using this package

### Dependencies

This lib depends on ES6 Promises that are native in node. But you have to polyfill it in some browsers using `es6-promise` package.

### Installation

Once you have access to the kst registry:

```bash
  # with npm
  npm install --save es6-promise @kst-hancock/sdk-client

  # or using yarn
  yarn add es6-promise @kst-hancock/sdk-client
```

### Using all together

The main client is the [[HancockEthereumClient]] class. You have to instantiate it passing an [[HancockConfig]] configuration object
to indicate the client which hancock service it has to use.

Configuration object example:

```javascript
const config = {
  adapter: {
    host: 'http://localhost',
    port: '3000',
    base: '/'
  },
  wallet: {
    host: 'http://localhost',
    port: '3000',
    base: '/'
  },
  broker: {
    host: 'ws://localhost',
    port: '3000',
    base: '/'
  }
}
```

In node:

```javascript
require('es6-promise').polyfill();
const HancockEthereumClient = require('@kst-hancock/sdk-client').HancockEthereumClient

new HancockEthereumClient(config);
```

In browser ES7 + some bundler:

```javascript
import * as es6Promise from 'es6-promise';
es6Promise.polyfill();

import { HancockEthereumClient } from '@kst-hancock/sdk-client';
new HancockEthereumClient(config);
```

### Introduction and examples

[[HancockEthereumClient]] provides interfaces to interact with the blockchain 
allowing common operation like transfers, balance consulting or smart contract interactions. Take a look at the diferent sections of the [docs](https://docs.kickstartteam.es/blockchainhub/kst-hancock-sdk-client/docs/index.html) to see examples of use:

- [[HancockEthereumWalletClient]]
- [[HancockEthereumTransferClient]]
- [[HancockEthereumTransactionClient]]
- [[HancockEthereumSmartContractClient]]
- [[HancockEthereumTokenClient]]
- [[HancockEthereumProtocolClient]]