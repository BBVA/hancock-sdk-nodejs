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
npm install --save es6-promise @kst-hancock/sdk-client
```

### Using all together

In node:

```javascript
require('es6-promise').polyfill();
const hancockClient = require('@kst-hancock/sdk-client').HancockClient

new HancockClient(cfg);
```

In browser ES7 + some bundler:

```javascript
import * as es6Promise from 'es6-promise';
require('es6-promise').polyfill();

import { HancockClient } from '@kst-hancock/sdk-client';
new HancockClient(cfg);
```