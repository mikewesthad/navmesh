/* eslint-env node */

const path = require("path");
const webpack = require("webpack");

// Go up one directory since we are in config/
const root = path.join(__dirname, "..");

module.exports = {
  context: path.join(root, "src", "library"),
  entry: {
    "phaser-navmesh": "./index.js",
    "phaser-navmesh.min": "./index.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(root, "dist"),
    library: "PhaserNavmesh",
    libraryTarget: "umd"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      minimize: true,
      sourceMap: "source-map"
    })
  ],
  devtool: "source-map"
};
