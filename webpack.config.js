
var path = require('path');

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
  devtool: 'source-map',
  resolve: {
    extensions: [".js", "*"]
  }
};
