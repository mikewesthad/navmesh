import NavMeshPlugin from "../../../../library"; // Importing directly from library/ for now
import "../plugins/phaser-astar";
import EasyStarPlugin from "../plugins/easy-star-plugin";

class StartState extends Phaser.State {
    create() {
        const g = this.game;

        // -- Tilemap Setup --

        // Load the map from the Phaser cache
        const tilemap = g.add.tilemap("map");

        // Set up the tilesets - first parameter is name of tileset in Tiled and second paramter is
        // name of tileset image in Phaser's cache
        const wallTileset = tilemap.addTilesetImage("tiles", "tiles");

        // Load the named layers - first parameter corresponds to layer name in Tiled
        tilemap.createLayer("bg", g.width, g.height);
        const wallLayer = tilemap.createLayer("walls", g.width, g.height);
        
        // Set all tiles in the wall layer to be colliding
        tilemap.setCollisionBetween(wallTileset.firstgid, wallTileset.firstgid +
            wallTileset.total, true, wallLayer);

        this.tilemap = tilemap;
        this.wallLayer = wallLayer;
        

        // -- Plugins --

        // Configure Phaser A* Plugin
        this.phaserAStar = this.game.plugins.add(Phaser.Plugin.AStar);
        this.phaserAStar.setAStarMap(tilemap, "walls", "tiles");

        // Configure Easy Star Plugin
        this.easyStar = this.game.plugins.add(EasyStarPlugin);
        this.easyStar.setGrid(wallLayer, [-1]);

        // Configure NavMesh Plugin
        const navMeshPlugin = this.game.plugins.add(NavMeshPlugin);
        this.navMesh = navMeshPlugin.buildMeshFromTiled("level-1", tilemap, "navmesh", 12.5);


        // -- Compare Performance ---

        const iterations = 1000;
        const shortPaths = [];
        const longPaths = [];
        for (let i = 0; i < iterations; i += 1) {
            shortPaths.push(this._getRandomPointsWithDistance(50, 150));
            longPaths.push(this._getRandomPointsWithDistance(600));
        }
        
        let start;
        const perf = {shortPaths: {}, longPaths: {}};
    
        start = performance.now();
        for (const path of shortPaths) this._phaserAStar(path[0], path[1]);
        perf.shortPaths.phaserAStar = (performance.now() - start) / iterations;
        
        start = performance.now();
        for (const path of shortPaths) this.easyStar.getWorldPath(path[0], path[1]);
        perf.shortPaths.easyStar = (performance.now() - start) / iterations;
        
        start = performance.now();
        for (const path of shortPaths) this.navMesh.findPath(path[0], path[1]);
        perf.shortPaths.navMesh = (performance.now() - start) / iterations;

        start = performance.now();
        for (const path of longPaths) this._phaserAStar(path[0], path[1]);
        perf.longPaths.phaserAStar = (performance.now() - start) / iterations;
        
        start = performance.now();
        for (const path of longPaths) this.easyStar.getWorldPath(path[0], path[1]);
        perf.longPaths.easyStar = (performance.now() - start) / iterations;
        
        start = performance.now();
        for (const path of longPaths) this.navMesh.findPath(path[0], path[1]);
        perf.longPaths.navMesh = (performance.now() - start) / iterations;

        
        let message = `Performance Comparison, ${iterations} iterations, 30x30 tilemap`;
        message += "\n\nShort paths (150 - 500 pixel length)\n";
        message += `\n\tAStart Plugin: ${perf.shortPaths.phaserAStar.toFixed(5)}ms`;
        message += `\n\tEasyStar Plugin: ${perf.shortPaths.easyStar.toFixed(5)}ms`;
        message += `\n\tNavMesh Plugin: ${perf.shortPaths.navMesh.toFixed(5)}ms`;
        const shortNavVsEasy = (perf.shortPaths.easyStar / perf.shortPaths.navMesh);
        const shortNavVsPhaser = (perf.shortPaths.phaserAStar / perf.shortPaths.navMesh);
        message += `\n\tNavMesh is ${shortNavVsPhaser.toFixed(2)}x faster than Phaser AStar`;
        message += `\n\tNavMesh is ${shortNavVsEasy.toFixed(2)}x faster than EasyStar`;
        message += "\n\nLong paths (600 pixels and greater length)\n";
        message += `\n\tAStart Plugin: ${perf.longPaths.phaserAStar.toFixed(5)}ms`;
        message += `\n\tEasyStar Plugin: ${perf.longPaths.easyStar.toFixed(5)}ms`;
        message += `\n\tNavMesh Plugin: ${perf.longPaths.navMesh.toFixed(5)}ms`;
        const longNavVsEasy = (perf.longPaths.easyStar / perf.longPaths.navMesh);
        const longNavVsPhaser = (perf.longPaths.phaserAStar / perf.longPaths.navMesh);
        message += `\n\tNavMesh is ${longNavVsPhaser.toFixed(2)}x faster than Phaser AStar`;
        message += `\n\tNavMesh is ${longNavVsEasy.toFixed(2)}x faster than EasyStar`;
        
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

    _getRandomEmptyPoint() {
        let x = this.game.rnd.integerInRange(0, this.game.width);
        let y = this.game.rnd.integerInRange(0, this.game.height);
        while (!this._isTileEmpty(x, y)) {
            x = this.game.rnd.integerInRange(0, this.game.width);
            y = this.game.rnd.integerInRange(0, this.game.height);
        }
        return new Phaser.Point(x, y);
    }

    _getRandomPointsWithDistance(minDistance = 0, maxDistance = Number.MAX_VALUE) {
        let p1 = this._getRandomEmptyPoint();
        let p2 = this._getRandomEmptyPoint();
        let d = p1.distance(p2);
        while (d < minDistance || d > maxDistance) {
            p1 = this._getRandomEmptyPoint();
            p2 = this._getRandomEmptyPoint();
            d = p1.distance(p2);
        }
        return [p1, p2];
    }

    _isTileEmpty(x, y) {
        var checkTile = this.tilemap.getTileWorldXY(x, y, 25, 25, this.wallLayer, true);
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