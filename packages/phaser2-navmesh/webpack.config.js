/* eslint-env node */

const path = require("path");
const webpack = require("webpack");
const root = __dirname;

module.exports = function(env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
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
    plugins: [new webpack.DefinePlugin({ PRODUCTION: !isDev })],
    devtool: isDev ? "eval-source-map" : "source-map"
  };
};
