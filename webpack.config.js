var path = require('path');
var Dotenv = require('dotenv-webpack');
var fs = require('fs');

module.exports = {
  context: __dirname,
  entry: "./frontend/index.js",
  output: {
    path: path.resolve(__dirname),
    filename: "./frontend/bundle.js"
  },
  module: {
    loaders: [
      {
        test: [/\.js?$/],
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new Dotenv({
      path: './.env',
    })
  ],
  devtool: 'source-map',
  resolve: {
    extensions: [".js", "*"]
  }
};
