import FollowerSprite from "../game-objects/follower";

export default class ManyPaths extends Phaser.Scene {
  create() {
    // -- Tilemap Setup --

    // Load the map from the Phaser cache
    const tilemap = this.add.tilemap("map");
    this.tilemap = tilemap;

    // Set up the tilesets - first parameter is name of tileset in Tiled and second paramter is
    // name of tileset image in Phaser's cache
    const wallTileset = tilemap.addTilesetImage("tiles", "tiles");

    // Load the named layers - first parameter corresponds to layer name in Tiled
    tilemap.createLayer("bg", wallTileset);

    const wallLayer = tilemap.createLayer("walls", wallTileset);
    wallLayer.setCollisionByProperty({ collides: true });
    this.wallLayer = wallLayer;

    // -- NavMesh Setup --

    // Load the navMesh from the tilemap object layer "navmesh". The navMesh was created with
    // 12.5 pixels of space around obstacles.
    const objectLayer = tilemap.getObjectLayer("navmesh");
    this.navMesh = this.navMeshPlugin.buildMeshFromTiled("mesh1", objectLayer, 12.5);

    // Now you could find a path via navMesh.findPath(startPoint, endPoint)

    // -- Instructions --
    const style = {
      font: "22px Josefin Sans",
      fill: "#ff0044",
      padding: { x: 20, y: 10 },
      backgroundColor: "#fff",
    };
    this.uiTextLines = [
      "Click to add followers",
      "Press '1' to go to scene 1.",
      "Followers: ",
      "FPS: ",
    ];
    this.uiText = this.add.text(10, 5, this.uiTextLines, style).setAlpha(0.9).setDepth(1000000);

    // -- Click to Add Follower --

    // Game object that can follow a path (inherits from Phaser.Sprite)
    this.followers = [];
    this.addFollowers(200, 200, 25);

    // On click
    this.input.on("pointerdown", (pointer) => {
      const worldPoint = pointer.positionToCamera(this.cameras.main);
      if (!wallLayer.hasTileAtWorldXY(worldPoint.x, worldPoint.y)) {
        this.addFollowers(pointer.x, pointer.y, 25);
      }
    });

    // -- Scene Changer --

    this.input.keyboard.on("keydown-ONE", () => {
      this.scene.start("start");
    });
  }

  update(time, delta) {
    this.uiTextLines[2] = `Followers: ${this.followers.length}`;
    this.uiTextLines[3] = `FPS: ${(1000 / delta).toFixed(2)}`;
    this.uiText.setText(this.uiTextLines);

    this.followers.forEach((follower) => {
      if (!follower.currentTarget) {
        const randomTarget = this.getRandomEmptyPoint();
        follower.goTo(randomTarget);
      }
    });
  }

  addFollowers(x, y, num) {
    for (let i = 0; i < num; i++) {
      const follower = new FollowerSprite(this, x, y, this.navMesh);
      this.followers.push(follower);
      const randomTarget = this.getRandomEmptyPoint();
      follower.goTo(randomTarget);
    }
  }

  getRandomEmptyPoint() {
    // Find random tile that is empty
    let tileX, tileY, tile;
    do {
      tileX = Phaser.Math.Between(0, this.tilemap.width);
      tileY = Phaser.Math.Between(0, this.tilemap.height);
      tile = this.wallLayer.hasTileAt(tileX, tileY);
    } while (tile && tile.collides);
    // Convert from tile location to pixel location (at center of tile)
    return {
      x: tileX * this.tilemap.tileWidth + this.tilemap.tileWidth / 2,
      y: tileY * this.tilemap.tileHeight + this.tilemap.tileHeight / 2,
    };
  }
}
