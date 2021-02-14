/**
 * Modified from PathFinderPlugin: https://github.com/appsbu-de/phaser_plugin_pathfinding
 */

import EasyStar from "easystarjs";
import Phaser from "phaser";

/**
 * A plugin that is powered by easystarjs. Easystar is forced to be synchronous in order to make
 * it easy to use. The plugin needs to be set up via EasyStarPlugin#setGrid before paths can be
 * calculated.
 * 
 * Inspired by: https://github.com/appsbu-de/phaser_plugin_pathfinding
 * 
 * @class EasyStarPlugin
 * @extends {Phaser.Plugin}
 */
class EasyStarPlugin extends Phaser.Plugin {
    /**
     * Creates an instance of EasyStarPlugin.
     * @param {Phaser.Game} game 
     * @param {Phaser.PluginManager} manager 
     * 
     * @memberOf EasyStarPlugin
     */
    constructor(game, manager) {
        super(game, manager);
        this.game = game;
        this._pluginManager = manager;

        this._easyStar = new EasyStar.js();
        this._easyStar.enableSync(); // Make easy star synchronous - for testing!
    }

    /**
     * Set the grid for pathfinding.
     * 
     * @param {Phaser.TilemapLayer} tilemapLayer The tilemap layer to use for the pathfinding
     * @param {number[]} walkableTiles An array of tile indices that are walkable in the layer. 
     * Everything else is not walkable.
     * 
     * @returns {this} 
     * 
     * @memberOf EasyStarPlugin
     */
    setGrid(tilemapLayer, walkableTiles) {
        this._tilemap = tilemapLayer.map;
        this._tilemapLayer = tilemapLayer;
        this._tileWidth = this._tilemap.width;
        this._tileHeight = this._tilemap.height;

        // Extract the tile indices from the layer and store them in a 2D grid
        this._grid = [];
        const data = tilemapLayer.layer.data;
        for (const row of data) {
            const gridRow = [];
            for (const tile of row) {
                gridRow.push(tile.index);
            }
            this._grid.push(gridRow);
        }
        
        this._walkables = walkableTiles;
        this._easyStar.setGrid(this._grid);
        this._easyStar.setAcceptableTiles(this._walkables);
        this._easyStar.enableDiagonals();
        return this;
    }

    setTileCost(tile, cost) {
        this._easyStar.setTileCost(tile, cost);
    }

    setTileCosts(tileCosts) {
        for (const tileCost of tileCosts) this.setTileCost(tileCost.tile, tileCost.cost);
    }

    /**
     * Calculate the easystar path between two tile locations in the current grid.
     * 
     * @param {Phaser.Point} tileStart A point representing the starting location in tile coords
     * @param {Phaser.Point} tileDest A point representing the destination location in tile coords
     * @returns {object[]|null} Returns array of points in the form {x, y} or null if no path found
     * 
     * @memberOf EasyStarPlugin
     */
    getTilePath(tileStart, tileDest) {
        let path = null;
        this._easyStar.findPath(tileStart.x, tileStart.y, tileDest.x, tileDest.y, (p) => path = p);
        this._easyStar.calculate();
        return path;
    }

    /**
     * Calculate the easystar path between two world locations in the current grid. The returned 
     * path's points are in world coordinates - each point is the (world coord) center of a tile 
     * along the path.
     * 
     * @param {Phaser.Point} worldStart A point representing the starting location in world coords
     * @param {Phaser.Point} worldDest A point representing the destination location in world coords
     * @returns {object[]|null} Returns array of points in the form {x, y} or null if no path found
     * 
     * @memberOf EasyStarPlugin
     */
    getWorldPath(worldStart, worldDest) {
        const tileStart = this._tilemapLayer.getTileXY(worldStart.x, worldStart.y, {});
        const tileDest = this._tilemapLayer.getTileXY(worldDest.x, worldDest.y, {});
        // Keep the start and destination on the tilemap
        tileStart.x = Phaser.Math.clamp(tileStart.x, 0, this._tilemap.width - 1);
        tileStart.y = Phaser.Math.clamp(tileStart.y, 0, this._tilemap.height - 1);
        tileDest.x = Phaser.Math.clamp(tileDest.x, 0, this._tilemap.width - 1);
        tileDest.y = Phaser.Math.clamp(tileDest.y, 0, this._tilemap.height - 1);
        const path = this.getTilePath(tileStart, tileDest);
        if (path) {
            const tw = this._tilemap.tileWidth;
            const th = this._tilemap.tileHeight;
            for (let i = 0; i < path.length; i++) {
                path[i].x = (path[i].x * tw) + (tw / 2);
                path[i].y = (path[i].y * th) + (th / 2);
            }
        }
        return path;
    }
}

export default EasyStarPlugin;