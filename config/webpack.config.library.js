/* eslint-env node */

const path = require("path");
const webpack = require("webpack");

// Go up one directory since we are in config/
const root = path.join(__dirname, "..");

module.exports = function(env, argv) {
  const isDev = argv.mode === "development";

  return {
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
      new webpack.DefinePlugin({
        "typeof CANVAS_RENDERER": JSON.stringify(true),
        "typeof WEBGL_RENDERER": JSON.stringify(true),
        PRODUCTION: !isDev
      })
    ],
    devtool: isDev ? "eval-source-map" : "source-map"
  };
};
