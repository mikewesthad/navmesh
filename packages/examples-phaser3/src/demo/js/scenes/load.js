import Phaser from "phaser";
import FontFaceObserver from "fontfaceobserver";

export default class Load extends Phaser.Scene {
  preload() {
    const loadingBar = this.add.graphics();
    const { width, height } = this.sys.game.config;
    this.load.on("progress", (value) => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(0, height / 2 - 25, width * value, 50);
    });
    this.load.on("complete", () => loadingBar.destroy());

    this.load.tilemapTiledJSON("map", "tilemaps/map.json");
    this.load.image("tiles", "tilemaps/tiles.png");
    this.load.image("follower", "images/follower.png");

    this.fontLoaded = false;
    this.fontErrored = false;
    new FontFaceObserver("Josefin Sans")
      .load()
      .then(() => (this.fontLoaded = true))
      .catch(() => (this.fontErrored = true));
  }

  update() {
    if (this.fontLoaded || this.fontErrored) this.scene.start("start");
  }
}
