import Phaser from "phaser";

export default class Load extends Phaser.Scene {
  preload() {
    const loadingBar = this.add.graphics();
    const { width, height } = this.sys.game.config;
    this.load.on("progress", value => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(0, height / 2 - 25, width * value, 50);
    });
    this.load.on("complete", () => loadingBar.destroy());

    this.load.tilemapTiledJSON("map", "tilemaps/map.json");
    this.load.image("tiles", "tilemaps/tiles.png");
    this.load.image("follower", "images/follower.png");
  }

  create() {
    this.scene.start("start");
  }
}
