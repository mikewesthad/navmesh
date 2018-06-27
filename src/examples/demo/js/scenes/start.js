// import FollowerSprite from "../game-objects/follower";
import Phaser from "phaser";
import NavMeshPlugin from "../../../../library"; // Importing directly from library/ for now
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
    tilemap.createStaticLayer("bg", wallTileset);

    const wallLayer = tilemap.createStaticLayer("walls", wallTileset);
    wallLayer.setCollisionByProperty({ collides: true });

    // -- NavMesh Setup --
    // // Register the plugin with Phaser
    // this.navMeshPlugin = this.game.plugins.add(NavMeshPlugin);

    // // Load the navMesh from the tilemap object layer "navmesh". The navMesh was created with
    // // 12.5 pixels of space around obstacles.
    // const navMesh = this.navMeshPlugin.buildMeshFromTiled(tilemap, "navmesh", 12.5);

    // Now you could find a path via navMesh.findPath(startPoint, endPoint)

    const navMeshPlugin = new NavMeshPlugin();
    const navMesh = navMeshPlugin.buildMeshFromTiled(tilemap, "navmesh", 12.5);

    // -- Click to Find Path --

    // Graphics overlay for visualizing path
    const graphics = this.add.graphics(0, 0).setAlpha(0.5);

    // Game object that can follow a path (inherits from Phaser.Sprite)
    const follower = new FollowerSprite(this, 50, 200, navMesh);

    // On click
    this.input.on("pointerdown", pointer => {
      const start = new Phaser.Math.Vector2(follower.x, follower.y);
      const end = new Phaser.Math.Vector2(pointer.x, pointer.y);

      // Tell the follower sprite to find its path to the target
      follower.goTo(end);

      // // For demo purposes, let's recalculate the path here and draw it on the screen
      const startTime = performance.now();
      const path = navMesh.findPath(start, end);
      // -> path is now an array of points, or null if no valid path found
      const pathTime = performance.now() - startTime;

      // Draw the start and end of the path
      graphics.clear();
      graphics.fillStyle(0xffd900);
      graphics.fillCircle(start.x, start.y, 10);
      graphics.fillCircle(end.x, end.y, 10);

      // Display the path, if it exists
      if (path) {
        uiTextLines[0] = `Path found in: ${pathTime.toFixed(2)}ms`;
        graphics.lineStyle(5, 0xffd900);
        graphics.strokePoints(path);
      } else {
        uiTextLines[0] = `No path found (${pathTime.toFixed(2)}ms)`;
      }
      uiText.setText(uiTextLines);
    });

    // Toggle the navmesh visibility on/off
    const debugGraphics = this.add.graphics();
    this.input.keyboard.on("keydown_M", () => {
      if (navMesh.isDebugEnabled()) {
        navMesh.disableDebug();
      } else {
        navMesh.debugDrawMesh(debugGraphics, {
          drawCentroid: true,
          drawBounds: false,
          drawNeighbors: false,
          drawPortals: true
        });
      }
    });

    // -- Instructions --

    const style = {
      font: "22px Josefin Sans",
      fill: "#ff0044",
      padding: { x: 20, y: 10 },
      backgroundColor: "#fff"
    };
    const uiTextLines = [
      "Click to find a path!",
      "Press 'm' to see navmesh.",
      "Press '2' to go to scene 2."
    ];
    const uiText = this.add.text(10, 5, this.uiTextLines, style);

    // // Scene changer
    // this.game.input.keyboard.addKey(Phaser.KeyCode.TWO).onDown.add(() => {
    //   this.game.state.start("many-paths");
    // });
  }

  // shutdown() {
  //   // Clean up references and destroy navmeshes
  //   this.game.plugins.remove(this.navMeshPlugin, true);
  // }
}
