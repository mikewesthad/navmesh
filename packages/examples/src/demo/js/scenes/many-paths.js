import NavMeshPlugin from "../../../../library"; // Importing directly from library/ for now
import FollowerSprite from "../game-objects/follower";

class StartState extends Phaser.State {
  create() {
    // -- Tilemap Setup --

    // Load the map from the Phaser cache
    const tilemap = this.game.add.tilemap("map");

    // Set up the tilesets - first parameter is name of tileset in Tiled and second paramter is
    // name of tileset image in Phaser's cache
    const wallTileset = tilemap.addTilesetImage("tiles", "tiles");

    // Load the named layers - first parameter corresponds to layer name in Tiled
    tilemap.createLayer("bg", this.game.width, this.game.height);
    const wallLayer = tilemap.createLayer("walls", this.game.width, this.game.height);

    // Set all tiles in the wall layer to be colliding
    tilemap.setCollisionBetween(
      wallTileset.firstgid,
      wallTileset.firstgid + wallTileset.total,
      true,
      wallLayer
    );

    this.tilemap = tilemap;
    this.wallLayer = wallLayer;

    // -- NavMesh Setup --

    this.navMeshPlugin = this.game.plugins.add(NavMeshPlugin);
    const navMesh = this.navMeshPlugin.buildMeshFromTiled(tilemap, "navmesh", 12.5);
    this.navMesh = navMesh;

    // -- Instructions --

    const style = {
      font: "22px Arial",
      fill: "#ff0044",
      align: "left",
      backgroundColor: "#fff"
    };
    this.infoText = this.game.add.text(10, 5, "Click to add followers", style);
    this.game.add.text(10, 35, "Press '1' to go to scene 1", style);

    // -- Click to Find Path --

    // Graphics overlay for visualizing path
    const graphics = this.game.add.graphics(0, 0);
    graphics.alpha = 0.5;

    // Game object that can follow a path (inherits from Phaser.Sprite)
    this.followers = [];

    // On click
    this.game.input.onDown.add(() => {
      // Get the location of the mouse
      const cursor = this.game.input.activePointer.position.clone();
      if (this._isPointEmpty(cursor.x, cursor.y)) {
        this._addFollowers(cursor, 25);
      }
    });

    // Scene changer
    this.game.input.keyboard.addKey(Phaser.KeyCode.ONE).onDown.add(() => {
      this.game.state.start("start");
    });
  }

  update() {
    for (const follower of this.followers) {
      if (!follower.currentTarget) {
        const randomTarget = this._getRandomEmptyPoint();
        follower.goTo(randomTarget);
      }
    }
  }

  shutdown() {
    // Clean up references and destroy navmeshes
    this.game.plugins.remove(this.navMeshPlugin, true);
  }

  _addFollowers(location, num) {
    for (let i = 0; i < num; i++) {
      const follower = new FollowerSprite(
        this.game,
        location.x,
        location.y,
        this.navMesh,
        this.wallLayer
      );
      this.followers.push(follower);
      const randomTarget = this._getRandomEmptyPoint();
      follower.goTo(randomTarget);
    }
    this.infoText.setText(`Number: ${this.followers.length}`);
  }

  _getRandomEmptyPoint() {
    // Find random tile that is empty
    let tileX = this.game.rnd.integerInRange(0, this.tilemap.width);
    let tileY = this.game.rnd.integerInRange(0, this.tilemap.height);
    while (!this._isTileEmpty(tileX, tileY)) {
      tileX = this.game.rnd.integerInRange(0, this.tilemap.width);
      tileY = this.game.rnd.integerInRange(0, this.tilemap.height);
    }
    // Convert from tile location to pixel location (at center of tile)
    const p = new Phaser.Point(
      tileX * this.tilemap.tileWidth + this.tilemap.tileWidth / 2,
      tileY * this.tilemap.tileHeight + this.tilemap.tileHeight / 2
    );
    return p;
  }

  _isPointEmpty(x, y) {
    const checkTile = this.tilemap.getTileWorldXY(
      x,
      y,
      this.tilemap.tileWidth,
      this.tilemap.tileHeight,
      this.wallLayer,
      true
    );
    // Check if location was out of bounds or invalid (getTileWorldXY returns
    // null for invalid locations when nonNull param is true)
    if (checkTile === null) return false;
    // Check if tile is empty (getTileWorldXY returns a tile with an index of
    // -1 when the nonNull param is true)
    if (checkTile.index === -1) return true;
    else return false;
  }

  _isTileEmpty(tileX, tileY) {
    const checkTile = this.tilemap.getTile(tileX, tileY, this.wallLayer, true);
    // Check if location was out of bounds or invalid (getTileWorldXY returns
    // null for invalid locations when nonNull param is true)
    if (checkTile === null) return false;
    // Check if tile is empty (getTileWorldXY returns a tile with an index of
    // -1 when the nonNull param is true)
    if (checkTile.index === -1) return true;
    else return false;
  }
}

export default StartState;
