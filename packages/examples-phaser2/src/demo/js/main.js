// Phaser 2 wasn't intended to be used with npm modules. See webpack config for how these libs are
// exposed. These need to be imported here so that all other files have access to them from the
// global scope.
import "pixi";
import "p2";
import Phaser from "phaser";

import Load from "./states/load";
import Start from "./states/start";

const game = new Phaser.Game({
  width: 750,
  height: 750,
  renderer: Phaser.WEBGL,
  parent: "game-container",
});

game.state.add("load", Load);
game.state.add("start", Start);

game.state.start("load");
