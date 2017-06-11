class StartState extends Phaser.State {
    create() {
        const g = this.game;

        // Load the map from the Phaser cache
        const tilemap = g.add.tilemap("map-1");

        // Set up the tilesets - first parameter is name of tileset in Tiled and second paramter is
        // name of tileset image in Phaser's cache
        const wallTileset = tilemap.addTilesetImage("tiles", "tiles");

        // Load the named layers - first parameter corresponds to layer name in Tiled
        tilemap.createLayer("bg", g.width, g.height);
        const wallLayer = tilemap.createLayer("walls", g.width, g.height);
        
        // Set all tiles in the wall layer to be colliding
        tilemap.setCollisionBetween(wallTileset.firstgid, wallTileset.firstgid +
            wallTileset.total, true, wallLayer);
    }
}

export default StartState;