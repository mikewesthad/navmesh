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
        tilemap.setCollisionBetween(wallTileset.firstgid, wallTileset.firstgid +
            wallTileset.total, true, wallLayer);
        

        // -- NavMesh Setup --

        // Register the plugin with Phaser
        this.navMeshPlugin = this.game.plugins.add(NavMeshPlugin);

        // Load the navMesh from the tilemap object layer "navmesh". The navMesh was created with
        // 12.5 pixels of space around obstacles.
        const navMesh = this.navMeshPlugin.buildMeshFromTiled(tilemap, "navmesh", 12.5);

        // Now you could find a path via navMesh.findPath(startPoint, endPoint)
        

        // -- Instructions --
        
        const style = { 
            font: "22px Arial", fill: "#ff0044", align: "left", backgroundColor: "#fff" 
        };
        const pathInfoText = this.game.add.text(10, 5, "Click to find a path!", style);
        this.game.add.text(10, 35, "Press 'm' to see navmesh.", style);
        this.game.add.text(10, 65, "Press '2' to go to scene 2.", style);


        // -- Click to Find Path --

        // Graphics overlay for visualizing path
        const graphics = this.game.add.graphics(0, 0);
        graphics.alpha = 0.5;

        // Game object that can follow a path (inherits from Phaser.Sprite) 
        const follower = new FollowerSprite(this.game, 50, 200, navMesh);

        // On click
        this.game.input.onDown.add(() => {
            // Get the location of the mouse
            const target = this.game.input.activePointer.position.clone();

            // Tell the follower sprite to find its path to the target
            follower.goTo(target);

            // For demo purposes, let's recalculate the path here and draw it on the screen
            const startTime = performance.now();
            const path = navMesh.findPath(follower.position, target);
            // -> path is now an array of points, or null if no valid path found 
            const pathTime = performance.now() - startTime;

            // Draw the start and end of the path
            graphics.clear();
            graphics.beginFill(0xffd900);
            graphics.drawEllipse(follower.position.x,follower.position.y, 10, 10);
            graphics.drawEllipse(target.x, target.y, 10, 10);
            graphics.endFill();

            // Display the path, if it exists
            if (path) {
                pathInfoText.setText(`Path found in: ${pathTime.toFixed(2)}ms`);
                graphics.lineStyle(5, 0xffd900);
                graphics.drawShape(new Phaser.Polygon(...path)); 
            } else {
                pathInfoText.setText(`No path found (${pathTime.toFixed(2)}ms)`);
            }
        });

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
        
        // Scene changer
        this.game.input.keyboard.addKey(Phaser.KeyCode.TWO).onDown.add(() => {
            this.game.state.start("many-paths");
        });
    }

    shutdown() {
        // Clean up references and destroy navmeshes
        this.game.plugins.remove(this.navMeshPlugin, true);
    }
}

export default StartState;