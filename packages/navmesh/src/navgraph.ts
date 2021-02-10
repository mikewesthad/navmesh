import jsastar from "javascript-astar";
import NavPoly from "./navpoly";

/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavGraph
 * @private
 */
class NavGraph implements jsastar.Graph<NavPoly> {
  public nodes: NavPoly[];

  public grid = [];

  constructor(navPolygons: NavPoly[]) {
    this.nodes = navPolygons;
    this.init();
  }

  neighbors(navPolygon: NavPoly) {
    return navPolygon.neighbors;
  }

  navHeuristic(navPolygon1: NavPoly, navPolygon2: NavPoly) {
    return navPolygon1.centroidDistance(navPolygon2);
  }

  destroy() {
    this.cleanDirty();
    this.nodes = [];
  }

  public init = jsastar.Graph.prototype.init.bind(this);
  public cleanDirty = jsastar.Graph.prototype.cleanDirty.bind(this);
  public markDirty = jsastar.Graph.prototype.markDirty.bind(this);
  public toString = jsastar.Graph.prototype.toString.bind(this);
}

export default NavGraph;
