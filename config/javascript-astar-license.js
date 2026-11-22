const fs = require("fs");
const path = require("path");

const license = fs
  .readFileSync(
    path.join(__dirname, "../packages/navmesh/src/vendor/javascript-astar/LICENSE"),
    "utf8"
  )
  .trim();

module.exports = function javascriptAstarLicense(webpack) {
  return new webpack.BannerPlugin({
    banner: `javascript-astar\n${license}`,
    test: /\.js$/,
    // Keep the license inline in standalone bundles after minification.
    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
  });
};
