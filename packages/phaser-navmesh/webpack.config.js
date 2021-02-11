/* eslint-env node */

const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const root = __dirname;

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    mode: isDev ? "development" : "production",
    context: path.join(root, "src"),
    entry: {
      "phaser-navmesh-plugin": "./index.ts",
      "phaser-navmesh-plugin.min": "./index.ts",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(root, "dist"),
      library: "PhaserNavMeshPlugin",
      libraryTarget: "umd",
      libraryExport: "default",
    },
    optimization: {
      minimizer: [new TerserPlugin({ include: /\.min\.js$/ })],
    },
    externals: {
      phaser: {
        root: "Phaser",
        commonjs: "phaser",
        commonjs2: "phaser",
        amd: "phaser",
      },
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
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
