/* eslint-env node */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

// Go up one directory since we are in config/
const root = path.join(__dirname, "..");

module.exports = {
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
        use: ["babel-loader"]
      },
      {
        test: require.resolve("phaser-ce/build/custom/pixi"),
        use: [
          {
            loader: "expose-loader",
            options: "PIXI"
          }
        ]
      },
      {
        test: require.resolve("phaser-ce/build/custom/p2"),
        use: [
          {
            loader: "expose-loader",
            options: "p2"
          }
        ]
      },
      {
        test: require.resolve("phaser-ce/build/custom/phaser-split"),
        use: [
          {
            loader: "expose-loader",
            options: "Phaser"
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      pixi: require.resolve("phaser-ce/build/custom/pixi"),
      p2: require.resolve("phaser-ce/build/custom/p2"),
      phaser: require.resolve("phaser-ce/build/custom/phaser-split")
    }
  },
  plugins: [new CopyWebpackPlugin([{ from: "**/*" }], { ignore: ["**/js/**/*"] })],
  devtool: "source-map"
};
