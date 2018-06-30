// Fix for webpack not exporting ES6 module default properly when using global mode of UMD. It ends
// up with someone having to do "PhaserNavmesh.default" instead of "PhaserNavmesh"
module.exports = require("./nav-mesh").default;
