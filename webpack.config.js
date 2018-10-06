const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './server/server.js',
  output: {
    path: path.resolve(__dirname, '/server'),
    filename: 'bundle.js'
  },
  optimization: {
    minimizer: [new UglifyJsPlugin({
      exclude: /node_modules/
    })]
  }
};