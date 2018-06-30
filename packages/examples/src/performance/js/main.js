// // Phaser 2 wasn't intended to be used with npm modules. See webpack config for how these libs are
// // exposed. These need to be imported here so that all other files have access to them from the
// // global scope.
// import pixi from "pixi";
// import p2 from "p2";
// import Phaser from "phaser";

// import load from "./states/load";
// import start from "./states/start";

// const game = new Phaser.Game({
//   width: 750,
//   height: 750,
//   renderer: Phaser.WEBGL,
//   parent: "game-container"
// });

// game.state.add("load", load);
// game.state.add("start", start);

// game.state.start("load");

import Phaser from "phaser";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: 750,
  height: 750,
  backgroundColor: "#ff0000",
  pixelArt: false
});
