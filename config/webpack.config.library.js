/* eslint-env node */

const path = require("path");

// Go up one directory since we are in config/
const root = path.join(__dirname, "..");

module.exports = {
    context: path.join(root, "src", "library"),
    entry: {
        "phaser-navmesh-plugin": "./index.js",
        "phaser-navmesh-plugin.min": "./index.js",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(root, "dist"),
        library: "phaserNavmeshPlugin",
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
    devtool: "source-map"
};
