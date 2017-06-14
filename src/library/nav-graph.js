import jsastar from "javascript-astar";

/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavGraph
 */
class NavGraph {
    constructor(navPolygons) {
        this.nodes = navPolygons;
        this.init();
    }

    neighbors(navPolygon) {
        return navPolygon.neighbors;
    }

    navHeuristic(navPolygon1, navPolygon2) {
        return navPolygon1.centroidDistance(navPolygon2);
    }
}

NavGraph.prototype.init = jsastar.Graph.prototype.init;
NavGraph.prototype.cleanDirty = jsastar.Graph.prototype.cleanDirty;
NavGraph.prototype.markDirty = jsastar.Graph.prototype.markDirty;

export default NavGraph;