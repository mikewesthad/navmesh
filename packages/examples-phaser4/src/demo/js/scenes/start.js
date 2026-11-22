import Phaser from "phaser";
import FollowerSprite from "../game-objects/follower";

export default class Start extends Phaser.Scene {
  create() {
    // -- Tilemap Setup --

    // Load the map from the Phaser cache
    const tilemap = this.add.tilemap("map");

    // Set up the tilesets - first parameter is name of tileset in Tiled and second paramter is
    // name of tileset image in Phaser's cache
    const wallTileset = tilemap.addTilesetImage("tiles", "tiles");

    // Load the named layers - first parameter corresponds to layer name in Tiled
    tilemap.createLayer("bg", wallTileset);

    const wallLayer = tilemap.createLayer("walls", wallTileset);
    wallLayer.setCollisionByProperty({ collides: true });

    // -- NavMesh Setup --

    // You can load a navmesh created by hand in Tiled:
    // Load the navMesh from the tilemap object layer "navmesh". The navMesh was created with
    // 12.5 pixels of space around obstacles.
    // const objectLayer = tilemap.getObjectLayer("navmesh");
    // const navMesh = this.navMeshPlugin.buildMeshFromTiled("mesh1", objectLayer, 12.5);

    // Or, you can build one from your tilemap automatically:
    const navMesh = this.navMeshPlugin.buildMeshFromTilemap("mesh1", tilemap, [wallLayer]);

    // Now you could find a path via navMesh.findPath(startPoint, endPoint)

    // -- Click to Find Path --

    // Graphics overlay for visualizing path
    const graphics = this.add.graphics(0, 0).setAlpha(0.5);
    navMesh.enableDebug(graphics);

    // Game object that can follow a path (inherits from Phaser.Sprite)
    const follower = new FollowerSprite(this, 50, 200, navMesh);

    // On click
    this.input.on("pointerdown", (pointer) => {
      const start = new Phaser.Math.Vector2(follower.x, follower.y);
      const end = new Phaser.Math.Vector2(pointer.x, pointer.y);

      // Tell the follower sprite to find its path to the target
      follower.goTo(end);

      // For demo purposes, let's recalculate the path here and draw it on the screen
      const startTime = performance.now();
      const path = navMesh.findPath(start, end);
      // -> path is now an array of points, or null if no valid path found
      const pathTime = performance.now() - startTime;

      navMesh.debugDrawClear();
      navMesh.debugDrawPath(path, 0xffd900);

      const formattedTime = pathTime.toFixed(3);
      uiTextLines[0] = path
        ? `Path found in: ${formattedTime}ms`
        : `No path found (${formattedTime}ms)`;
      uiText.setText(uiTextLines);
    });

    // Display whether the mouse is currently over a valid point in the navmesh
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer) => {
      const isInMesh = navMesh.isPointInMesh(pointer);
      uiTextLines[1] = `Is mouse inside navmesh: ${isInMesh ? "yes" : "no "}`;
      uiText.setText(uiTextLines);
    });

    // Toggle the navmesh visibility on/off
    this.input.keyboard.on("keydown-M", () => {
      navMesh.debugDrawClear();
      navMesh.debugDrawMesh({
        drawCentroid: true,
        drawBounds: false,
        drawNeighbors: false,
        drawPortals: true,
      });
    });

    // -- Instructions --

    const style = {
      font: "22px Josefin Sans",
      fill: "#ff0044",
      padding: { x: 20, y: 10 },
      backgroundColor: "#fff",
    };
    const uiTextLines = [
      "Click to find a path!",
      "Is mouse inside navmesh: false",
      "Press 'm' to see navmesh.",
      "Press '2' to go to scene 2.",
    ];
    const uiText = this.add.text(10, 5, uiTextLines, style).setAlpha(0.9);

    // -- Scene Changer --
    this.input.keyboard.on("keydown-TWO", () => {
      this.scene.start("many-paths");
    });
  }
}
