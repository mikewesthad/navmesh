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
      "performance/js/main": "./performance/js/main.js",
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
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [{ from: "**/*", globOptions: { ignore: ["**/js/**/*"] } }],
      }),

      new webpack.DefinePlugin({
        "typeof CANVAS_RENDERER": JSON.stringify(true),
        "typeof WEBGL_RENDERER": JSON.stringify(true),
        PRODUCTION: !isDev,
      }),
    ],
    devtool: isDev ? "eval-source-map" : "source-map",
  };
};
