/* eslint-env node */

const path = require("path");
const root = __dirname;

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: "./index.ts",
    output: {
      filename: "phaser2-navmesh-plugin.js",
      path: path.resolve(root, "dist"),
      library: "Phaser2NavMeshPlugin",
      libraryTarget: "umd",
      libraryExport: "default",
    },
    externals: {
      phaser: {
        commonjs: "phaser",
        commonjs2: "phaser",
        amd: "phaser",
        root: "Phaser",
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
          // Configure babel to look for the root babel.config.json with rootMode.
          use: { loader: "babel-loader", options: { rootMode: "upward" } },
        },
      ],
    },
    devtool: isDev ? "eval-source-map" : "source-map",
  };
};
