import Line from "./math/line";
import Polygon from "./math/polygon";
import Vector2 from "./math/vector-2";
import { Point } from "./common-types";
import jsastar from "javascript-astar";
/**
 * A class that represents a navigable polygon with a navmesh. It is built on top of a
 * {@link Polygon}. It implements the properties and fields that javascript-astar needs - weight,
 * toString, isWall and getCost. See GPS test from astar repo for structure:
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 */
export default class NavPoly implements jsastar.GridNode {
    id: number;
    polygon: Polygon;
    edges: Line[];
    neighbors: NavPoly[];
    portals: Line[];
    centroid: Vector2;
    boundingRadius: number;
    weight: number;
    x: number;
    y: number;
    /**
     * Creates an instance of NavPoly.
     */
    constructor(id: number, polygon: Polygon);
    /**
     * Returns an array of points that form the polygon.
     */
    getPoints(): Point[];
    /**
     * Check if the given point-like object is within the polygon.
     */
    contains(point: Point): boolean;
    /**
     * Only rectangles are supported, so this calculation works, but this is not actually the centroid
     * calculation for a polygon. This is just the average of the vertices - proper centroid of a
     * polygon factors in the area.
     */
    calculateCentroid(): Vector2;
    /**
     * Calculate the radius of a circle that circumscribes the polygon.
     */
    calculateRadius(): number;
    /**
     * Check if the given point-like object is on one of the edges of the polygon.
     */
    isPointOnEdge({ x, y }: Point): boolean;
    destroy(): void;
    toString(): string;
    isWall(): boolean;
    centroidDistance(navPolygon: NavPoly): number;
    getCost(navPolygon: NavPoly): number;
}
//# sourceMappingURL=navpoly.d.ts.map