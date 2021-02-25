import jsastar from "javascript-astar";
import NavPoly from "./navpoly";
/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavGraph
 * @private
 */
declare class NavGraph implements jsastar.Graph<NavPoly> {
    nodes: NavPoly[];
    grid: never[];
    constructor(navPolygons: NavPoly[]);
    neighbors(navPolygon: NavPoly): NavPoly[];
    navHeuristic(navPolygon1: NavPoly, navPolygon2: NavPoly): number;
    destroy(): void;
    init: () => void;
    cleanDirty: () => void;
    markDirty: () => void;
    toString: () => string;
}
export default NavGraph;
//# sourceMappingURL=navgraph.d.ts.map