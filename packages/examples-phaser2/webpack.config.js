/* eslint-env node */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const root = __dirname;

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    mode: isDev ? "development" : "production",
    context: path.join(root, "src"),
    entry: {
      "demo/js/main": "./demo/js/main.js",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(root, "public"),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          // Configure babel to look for the root babel.config.json with rootMode.
          use: { loader: "babel-loader", options: { rootMode: "upward" } },
        },
        {
          test: require.resolve("phaser-ce/build/custom/pixi"),
          loader: "expose-loader",
          options: {
            exposes: ["PIXI"],
          },
        },
        {
          test: require.resolve("phaser-ce/build/custom/p2"),
          loader: "expose-loader",
          options: {
            exposes: ["p2"],
          },
        },
        {
          test: require.resolve("phaser-ce/build/custom/phaser-split"),
          loader: "expose-loader",
          options: {
            exposes: ["Phaser"],
          },
        },
      ],
    },
    resolve: {
      alias: {
        pixi: require.resolve("phaser-ce/build/custom/pixi"),
        p2: require.resolve("phaser-ce/build/custom/p2"),
        phaser: require.resolve("phaser-ce/build/custom/phaser-split"),
      },
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [{ from: "**/*", globOptions: { ignore: ["**/js/**/*"] } }],
      }),
      new webpack.DefinePlugin({ PRODUCTION: !isDev }),
    ],
    devtool: isDev ? "eval-source-map" : "source-map",
  };
};
