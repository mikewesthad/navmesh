/* eslint-env node */

const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const root = __dirname;

module.exports = function(env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: {
      navmesh: "./index.js",
      "navmesh.min": "./index.js"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(root, "dist"),
      library: "NavMesh",
      libraryTarget: "umd",
      libraryExport: "default"
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({ include: /\.min\.js$/ })
      ]
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
    devtool: isDev ? "eval-source-map" : "source-map"
  };
};
