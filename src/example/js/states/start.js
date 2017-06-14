import NavMeshPlugin from "../../../library"; // Importing directly from library/ for now

class StartState extends Phaser.State {
    create() {
        const g = this.game;

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
        

        // -- NavMesh Code --

        // Register the plugin with Phaser
        const navMeshPlugin = this.game.plugins.add(NavMeshPlugin);

        // Load the navMesh from the tilemap object layer "navmesh" and store it in the plugin under
        // the key "level-1". The navMesh was created with 12.5 pixels of space around obstacles.
        navMeshPlugin.buildMeshFromTiled("level-1", tilemap, "navmesh", 12.5);

        const p1 = new Phaser.Point(100, 400);
        const p2 = new Phaser.Point(700, 200);
        const path = navMeshPlugin.findPath(p1, p2, {
            drawNavMesh: false, drawPolyPath: false, drawFinalPath: false
        });
        this._printPath(path);

        // Visualize path between two spots by clicking
        const graphics = this.game.add.graphics(0, 0);
        let startPoint = null;
        let endPoint = null;
        this.game.input.onDown.add(() => {
            if (!startPoint) {
                startPoint = this.game.input.activePointer.position.clone();
                graphics.clear();
                graphics.beginFill(0xffd900);
                graphics.drawEllipse(startPoint.x, startPoint.y, 10, 10);
                graphics.endFill();
            } else if (!endPoint) {
                endPoint = this.game.input.activePointer.position.clone();
                const path = navMeshPlugin.findPath(startPoint, endPoint, true, true);
                if (path) {
                    this._printPath(path);
                    this._drawPath(graphics, path);
                } else {
                    console.log("No path found.");
                }
                startPoint = null;
                endPoint = null;
            }
        });
    }

    _printPath(path) {
        const start = path[0];
        const end = path[path.length - 1];
        let s = `Path: (${start.x}, ${start.y}) -> (${end.x}, ${end.y})`;
        for (const p of path) s += `\n\t(${p.x}, ${p.y})`;
        console.log(s);
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
}

export default StartState;