class LoadState extends Phaser.State {
    preload() {
        // Tilemap and tileset
        this.load.tilemap("map-1", "tilemaps/map-1.json", null, 
            Phaser.Tilemap.TILED_JSON);
        this.load.image("tiles", "tilemaps/tiles.png");
    }

    create() {
        this.game.state.start("start");
    }
}

export default LoadState;