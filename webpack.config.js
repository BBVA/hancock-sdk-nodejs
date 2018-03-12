const path = require('path');
const config = require('config')
const fs = require('fs')
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
var merge = require('webpack-merge');

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

var serverWebpackConfig = merge(commonWebpackConfig, {
  target: 'node',
  externals: [nodeExternals()],
  output: {
    libraryTarget: 'commonjs2',
    filename: 'index.node.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.browser': false,
    })
  ]
});

var clientWebpackConfig = merge(commonWebpackConfig, {
  target: 'web',
  output: {
    libraryTarget: 'umd',
    filename: 'index.browser.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.browser': true,
    })
  ],
  resolve: {
    alias: {
      'ethereumjs-tx': path.resolve(__dirname, './lib/ethereumjs-tx.js'),
      'ethereumjs-wallet': path.resolve(__dirname, './lib/ethereumjs-wallet.js'),
    }
  }
});

module.exports = [serverWebpackConfig, clientWebpackConfig];