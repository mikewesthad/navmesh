import Phaser from "phaser";
// import "../plugins/phaser-astar";
// import EasyStarPlugin from "../plugins/easy-star-plugin";

export default class StartState extends Phaser.Scene {
  create() {
    // -- Setup --

    const tilemap = this.add.tilemap("map");
    this.tilemap = tilemap;
    const wallTileset = tilemap.addTilesetImage("tiles", "tiles");
    tilemap.createLayer("bg", wallTileset);
    const wallLayer = tilemap.createLayer("walls", wallTileset);
    wallLayer.setCollisionByProperty({ collides: true });
    this.wallLayer = wallLayer;

    // -- Plugins --

    const objectLayer = tilemap.getObjectLayer("navmesh");
    const navMesh = this.navMeshPlugin.buildMeshFromTiled("mesh1", objectLayer, 12.5);

    // // Configure Phaser A* Plugin
    // this.phaserAStar = this.game.plugins.add(Phaser.Plugin.AStar);
    // this.phaserAStar.setAStarMap(tilemap, "walls", "tiles");

    // // Configure Easy Star Plugin
    // this.easyStar = this.game.plugins.add(EasyStarPlugin);
    // this.easyStar.setGrid(wallLayer, [-1]);

    // -- Compare Performance ---

    const iterations = 1000;
    const shortPaths = [];
    const longPaths = [];
    for (let i = 0; i < iterations; i += 1) {
      shortPaths.push(this.getRandomPointsWithDistance(50, 150));
      longPaths.push(this.getRandomPointsWithDistance(600));
    }

    let start;
    const perf = { shortPaths: {}, longPaths: {} };

    // start = performance.now();
    // for (const path of shortPaths) this._phaserAStar(path[0], path[1]);
    // perf.shortPaths.phaserAStar = (performance.now() - start) / iterations;

    // start = performance.now();
    // for (const path of shortPaths) this.easyStar.getWorldPath(path[0], path[1]);
    // perf.shortPaths.easyStar = (performance.now() - start) / iterations;

    start = performance.now();
    for (const path of shortPaths) navMesh.findPath(path[0], path[1]);
    perf.shortPaths.navMesh = (performance.now() - start) / iterations;

    // start = performance.now();
    // for (const path of longPaths) this._phaserAStar(path[0], path[1]);
    // perf.longPaths.phaserAStar = (performance.now() - start) / iterations;

    // start = performance.now();
    // for (const path of longPaths) this.easyStar.getWorldPath(path[0], path[1]);
    // perf.longPaths.easyStar = (performance.now() - start) / iterations;

    start = performance.now();
    for (const path of longPaths) navMesh.findPath(path[0], path[1]);
    perf.longPaths.navMesh = (performance.now() - start) / iterations;

    let message = `Performance Comparison, ${iterations} iterations, 30x30 tilemap`;
    message += "\n\nShort paths (150 - 500 pixel length)\n";
    // message += `\n\tAStart Plugin: ${perf.shortPaths.phaserAStar.toFixed(5)}ms`;
    // message += `\n\tEasyStar Plugin: ${perf.shortPaths.easyStar.toFixed(5)}ms`;
    message += `\n\tNavMesh Plugin: ${perf.shortPaths.navMesh.toFixed(5)}ms`;
    // const shortNavVsEasy = perf.shortPaths.easyStar / perf.shortPaths.navMesh;
    // const shortNavVsPhaser = perf.shortPaths.phaserAStar / perf.shortPaths.navMesh;
    // message += `\n\tNavMesh is ${shortNavVsPhaser.toFixed(2)}x faster than Phaser AStar`;
    // message += `\n\tNavMesh is ${shortNavVsEasy.toFixed(2)}x faster than EasyStar`;
    message += "\n\nLong paths (600 pixels and greater length)\n";
    // message += `\n\tAStart Plugin: ${perf.longPaths.phaserAStar.toFixed(5)}ms`;
    // message += `\n\tEasyStar Plugin: ${perf.longPaths.easyStar.toFixed(5)}ms`;
    message += `\n\tNavMesh Plugin: ${perf.longPaths.navMesh.toFixed(5)}ms`;
    // const longNavVsEasy = perf.longPaths.easyStar / perf.longPaths.navMesh;
    // const longNavVsPhaser = perf.longPaths.phaserAStar / perf.longPaths.navMesh;
    // message += `\n\tNavMesh is ${longNavVsPhaser.toFixed(2)}x faster than Phaser AStar`;
    // message += `\n\tNavMesh is ${longNavVsEasy.toFixed(2)}x faster than EasyStar`;

    console.log(message);
  }

  _phaserAStar(start, end) {
    const startTile = this.wallLayer.getTileXY(start.x, start.y, {});
    const endTile = this.wallLayer.getTileXY(end.x, end.y, {});
    return this.phaserAStar.findPath(startTile, endTile);
  }

  _drawPath(graphic, path) {
    graphic.lineStyle(5, 0xffd900);
    const p = new Phaser.Polygon(...path);
    p.closed = false;
    graphic.drawShape(p);
    graphic.beginFill(0xffd900);
    graphic.drawEllipse(path[0].x, path[0].y, 10, 10);
    const lastPoint = path[path.length - 1];
    graphic.drawEllipse(lastPoint.x, lastPoint.y, 10, 10);
    graphic.endFill();
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
    return new Phaser.Math.Vector2(
      tileX * this.tilemap.tileWidth + this.tilemap.tileWidth / 2,
      tileY * this.tilemap.tileHeight + this.tilemap.tileHeight / 2
    );
  }

  getRandomPointsWithDistance(minDistance = 0, maxDistance = Number.MAX_VALUE) {
    let p1 = this.getRandomEmptyPoint();
    let p2 = this.getRandomEmptyPoint();
    let d = p1.distance(p2);
    while (d < minDistance || d > maxDistance) {
      p1 = this.getRandomEmptyPoint();
      p2 = this.getRandomEmptyPoint();
      d = p1.distance(p2);
    }
    return [p1, p2];
  }
}
