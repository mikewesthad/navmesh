// TODO: add ManyPaths scene back in
// import ManyPaths from "./states/many-paths";

import Phaser from "phaser";
import Load from "./scenes/load";
import Start from "./scenes/start";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: 750,
  height: 750,
  backgroundColor: "#fff",
  pixelArt: false
});

game.scene.add("load", Load);
game.scene.add("start", Start);
game.scene.start("load");
