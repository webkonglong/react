const webpack = require("webpack")
const path = require("path")
const WebpackDevServer = require('webpack-dev-server')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename:'./public/[hash]app.js',
    hashDigestLength: 8
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html'
  })],
  devServer: {
    contentBase: path.join(__dirname, "../public"),
    port: 9897,
    open: true
  }
};


