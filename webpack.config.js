const path = require('path');

module.exports = env => {
  const isProduction = env === 'production';
  return {
    mode: 'development',
    entry: './client/src/app.js',
    output: {
      path: path.join(__dirname, 'client/public/scripts'),
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          loader: 'babel-loader',
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/
        }
      ]
    },
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'client/public'),
      historyApiFallback: true
    }
  };
};
