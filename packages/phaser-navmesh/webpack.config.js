/* eslint-env node */

const path = require("path");
const root = __dirname;
const navmeshSrc = path.resolve(root, "../navmesh/src/index.ts");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const javascriptAstarLicense = require("../../config/javascript-astar-license");

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: "./index.ts",
    output: {
      library: {
        name: "PhaserNavMeshPlugin",
        type: "umd",
      },
      filename: "phaser-navmesh-plugin.js",
      path: path.resolve(root, "dist"),
    },
    plugins: [new CleanWebpackPlugin(), javascriptAstarLicense(webpack)],
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
      // Bundle navmesh from its TS source rather than its prebuilt UMD bundle, to avoid
      // double-bundling its dependencies. Type declarations still reference the "navmesh" package.
      alias: { navmesh$: navmeshSrc },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                // Declarations are emitted separately via `tsc` (see package.json build script).
                // If ts-loader emitted them, navmesh's source would be pulled into the output.
                declaration: false,
                declarationMap: false,
                // Type check against navmesh's source (bundled via the alias above), so watch mode
                // doesn't depend on navmesh having been built first.
                paths: { navmesh: [navmeshSrc] },
                rootDir: path.resolve(root, ".."),
              },
            },
          },
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
