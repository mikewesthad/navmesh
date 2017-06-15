import NavMeshPlugin from "../../../../library"; // Importing directly from library/ for now

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
        

        // -- Text --
        
        const style = { 
            font: "20px Arial", fill: "#ff0044", align: "left", backgroundColor: "#fff" 
        };
        const text = "Click twice to search for a path\n"
            + "Press \"m\" to toggle the navmesh visibility";
        this.game.add.text(10, 5, text, style);

        const pathInfo = "No points currently selected...";
        const pathInfoText = this.game.add.text(10, 200, pathInfo, style);


        // -- NavMesh --

        // Register the plugin with Phaser
        const navMeshPlugin = this.game.plugins.add(NavMeshPlugin);

        // Load the navMesh from the tilemap object layer "navmesh" and store it in the plugin under
        // the key "level-1". The navMesh was created with 12.5 pixels of space around obstacles.
        const navMesh = navMeshPlugin.buildMeshFromTiled("level-1", tilemap, "navmesh", 12.5);

        // Toggle the navmesh visibility on/off
        this.game.input.keyboard.addKey(Phaser.KeyCode.M).onDown.add(() => {
            if (navMesh.isDebugEnabled()) {
                navMesh.disableDebug();
            } else {
                navMesh.debugDrawMesh({
                    drawCentroid: true, drawBounds: false, drawNeighbors: false, drawPortals: true
                });
            }
        });

        // const p1 = new Phaser.Point(100, 400);
        // const p2 = new Phaser.Point(700, 200);
        // const path = navMeshPlugin.findPath(p1, p2, {
        //     drawNavMesh: false, drawPolyPath: false, drawFinalPath: false
        // });
        // this._printPath(path);

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
                const startTime = performance.now();
                const path = navMeshPlugin.findPath(startPoint, endPoint, true, true);
                const pathTime = performance.now() - startTime;
                if (path) {
                    pathInfoText.setText(`Path found.\nSearch took: ${pathTime.toFixed(2)}ms`);
                    this._printPath(path);
                    this._drawPath(graphics, path);
                } else {
                    pathInfoText.setText(`No path found.\nSearch took: ${pathTime.toFixed(2)}ms`);
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