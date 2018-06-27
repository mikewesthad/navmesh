/* eslint-env node */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

// Go up one directory since we are in config/
const root = path.join(__dirname, "..");

module.exports = function(env, argv) {
  const isDev = argv.mode === "development";

  return {
    mode: isDev ? "development" : "production",
    context: path.join(root, "src", "examples"),
    entry: {
      "demo/js/main": "./demo/js/main.js",
      "performance/js/main": "./performance/js/main.js"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(root, "public")
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: "babel-loader"
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin([{ from: "**/*" }], { ignore: ["**/js/**/*"] }),

      new webpack.DefinePlugin({
        "typeof CANVAS_RENDERER": JSON.stringify(true),
        "typeof WEBGL_RENDERER": JSON.stringify(true),
        PRODUCTION: !isDev
      })
    ],
    devtool: isDev ? "eval-source-map" : "source-map"
  };
};
