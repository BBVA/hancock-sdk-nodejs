const path = require('path');
const config = require('config')
const fs = require('fs')

const configFileName = './config/config.json'
const configPath = path.resolve(__dirname, configFileName);
fs.writeFileSync(configPath, JSON.stringify(config))

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.bundle.js',
    filename: '[name].bundle.js',
    libraryTarget: 'umd'
  },
  devtool: "source-map",
  resolve: {
    alias: {
      'config': configPath
    }
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' }
    ]
  }
};
