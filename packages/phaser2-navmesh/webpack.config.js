/* eslint-env node */

const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const root = __dirname;

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    mode: isDev ? "development" : "production",
    context: path.join(root, "src"),
    entry: {
      "phaser2-navmesh": "./index.js",
      "phaser2-navmesh.min": "./index.js",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(root, "dist"),
      library: "Phaser2NavMeshPlugin",
      libraryTarget: "umd",
      libraryExport: "default",
    },
    optimization: {
      minimizer: [new UglifyJsPlugin({ include: /\.min\.js$/, sourceMap: true })],
    },
    externals: {
      phaser: "Phaser",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: { loader: "babel-loader", options: { root: "../../" } },
        },
      ],
    },
    devtool: isDev ? "eval-source-map" : "source-map",
  };
};
