const path = require('path');
const config = require('config')
const fs = require('fs')
const nodeExternals = require('webpack-node-externals');

const packageconfigFileName = './config/config.json'
const packageconfigPath = path.resolve(__dirname, packageconfigFileName);
fs.writeFileSync(packageconfigPath, JSON.stringify(config))

const commonWebpackConfig = {
  entry: './src/index.ts',
  output: {
    library: '@kst-hancock/sdk-client',    
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      'config': packageconfigPath
    }
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  }
};

var serverWebpackConfig = {
  ...commonWebpackConfig,  
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: 'index.node.js',
  },
};

var clientWebpackConfig = {
  ...commonWebpackConfig,  
  target: 'web',
  output: {
    libraryTarget: 'umd',
    filename: 'index.browser.js',
  }
};

module.exports = [ serverWebpackConfig, clientWebpackConfig ];