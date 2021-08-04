import Phaser from "phaser";
import FollowerSprite from "../game-objects/follower";

const timeIt = (fn) => {
  const startTime = performance.now();
  const fnReturn = fn();
  const elaspedMs = performance.now() - startTime;
  return [fnReturn, elaspedMs];
};

export default class Start extends Phaser.Scene {
  create() {
    const tilemap = this.add.tilemap("map");
    const wallTileset = tilemap.addTilesetImage("tiles", "tiles");
    tilemap.createLayer("bg", wallTileset);
    const wallLayer1 = tilemap.createLayer("wall-configurations", wallTileset);
    const wallLayer2 = tilemap.createLayer("random-walls", wallTileset);

    const layers = [wallLayer1, wallLayer2];
    const [navMesh, meshMs] = timeIt(() =>
      this.navMeshPlugin.buildMeshFromTilemap("mesh1", tilemap, layers, (t) => t.index === -1, 0)
    );
    console.log(`It took ${meshMs.toFixed(2)}ms to build the mesh.`);

    // Graphics overlay for visualizing path
    const graphics = this.add.graphics(0, 0).setAlpha(0.5);
    navMesh.enableDebug(graphics);
    const drawDebug = () => {
      navMesh.debugDrawClear();
      navMesh.debugDrawMesh({
        drawCentroid: true,
        drawBounds: false,
        drawNeighbors: false,
        drawPortals: false,
      });
    };
    drawDebug();
    this.input.keyboard.on("keydown-M", drawDebug);

    // Game object that can follow a path (inherits from Phaser.Sprite)
    const follower = new FollowerSprite(this, 30, 410, navMesh);

    // On click
    this.input.on("pointerdown", (pointer) => {
      const start = new Phaser.Math.Vector2(follower.x, follower.y);
      const end = new Phaser.Math.Vector2(pointer.x, pointer.y);

      // Tell the follower sprite to find its path to the target
      follower.goTo(end);

      const [path, pathTime] = timeIt(() => navMesh.findPath(start, end));

      graphics.clear();
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
      uiTextLines[1] = `Mouse: (${pointer.x}, ${pointer.y})`;
      uiTextLines[2] = `Is mouse inside navmesh: ${isInMesh ? "yes" : "no "}`;
      uiText.setText(uiTextLines);
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
      "Mouse: (0, 0)",
      "Is mouse inside navmesh: false",
      "Arrow keys & q/e to move the camera.",
      "Note: debug drawing is slow!",
    ];
    const uiText = this.add.text(10, 5, uiTextLines, style).setAlpha(0.9);

    const cursors = this.input.keyboard.createCursorKeys();
    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 0.06,
      drag: 0.0005,
      maxSpeed: 1.0,
    };
    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
  }
  update(time, delta) {
    this.controls.update(delta);
  }
}
