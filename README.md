# Hancock SDK client

## Before use this package
This package is distributed under our private [KST npm registry](http://dev.npm.kickstartteam.es/).
You have to configure your own .npmrc file in order to have access to it. Ask somebody of our team the `SECRET_TOKEN`:

```bash
# .npmrc
registry=http://dev.npm.kickstartteam.es
//dev.npm.kickstartteam.es/:_authToken="<SECRET_TOKEN>"
```


Once you have access to the registry, and after an `npm install`. You can import the SDK as follows:

```javascript
const hancockSDK = require('@kst-hancock/sdk-client')
```