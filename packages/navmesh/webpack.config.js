/* eslint-env node */

const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const root = __dirname;

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: {
      navmesh: "./index.ts",
      "navmesh.min": "./index.ts",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(root, "dist"),
      library: "NavMesh",
      libraryTarget: "umd",
      libraryExport: "default",
      globalObject: '(typeof self !== "undefined" ? self : this)',
    },
    optimization: {
      minimizer: [new UglifyJsPlugin({ include: /\.min\.js$/, sourceMap: true })],
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
