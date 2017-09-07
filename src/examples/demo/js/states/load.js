class LoadState extends Phaser.State {
  preload() {
    this.load.tilemap("map", "tilemaps/map.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.image("tiles", "tilemaps/tiles.png");
    this.load.image("follower", "images/follower.png");
  }

  create() {
    this.game.state.start("start");
  }
}

export default LoadState;
