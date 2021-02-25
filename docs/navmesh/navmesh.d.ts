import NavPoly from "./navpoly";
import Vector2 from "./math/vector-2";
import { Point, PolyPoints } from "./common-types";
/**
 * The `NavMesh` class is the workhorse that represents a navigation mesh built from a series of
 * polygons. Once built, the mesh can be asked for a path from one point to another point. Some
 * internal terminology usage:
 * - neighbor: a polygon that shares part of an edge with another polygon
 * - portal: when two neighbor's have edges that overlap, the portal is the overlapping line segment
 * - channel: the path of polygons from starting point to end point
 * - pull the string: run the funnel algorithm on the channel so that the path hugs the edges of the
 *   channel. Equivalent to having a string snaking through a hallway and then pulling it taut.
 */
export default class NavMesh {
    private meshShrinkAmount;
    private navPolygons;
    private graph;
    /**
     * @param meshPolygonPoints Array where each element is an array of point-like objects that
     * defines a polygon.
     * @param meshShrinkAmount The amount (in pixels) that the navmesh has been shrunk around
     * obstacles (a.k.a the amount obstacles have been expanded).
     */
    constructor(meshPolygonPoints: PolyPoints[], meshShrinkAmount?: number);
    /**
     * Get the NavPolys that are in this navmesh.
     */
    getPolygons(): NavPoly[];
    /**
     * Cleanup method to remove references.
     */
    destroy(): void;
    /**
     * Find a given start point within the mesh to an end point that may not be accessible in the
     * mesh. This will try to get as close as possible.
     * @param startPoint
     * @param possibleEndPoint
     * @param maxDistance
     */
    findClosestPath(startPoint: Point, possibleEndPoint: Point, maxDistance?: number): void;
    /**
     * Find the closest polygon to the given point. If a fudgeAmount is provided, this will be used to
     * find the closest polygon within the fudgeAmount of the point.
     * @param point
     * @param fudgeAmount
     */
    getPolyFromPoint(point: Vector2, fudgeAmount?: number): NavPoly | null;
    private getPointsInPolys;
    /**
     * Find a path from the start point to the end point using this nav mesh.
     * @param {object} startPoint A point-like object in the form {x, y}
     * @param {object} endPoint A point-like object in the form {x, y}
     * @returns {Vector2[]|null} An array of points if a path is found, or null if no path
     */
    findPath(startPoint: Point, endPoint: Point): Vector2[] | null;
    private calculateNeighbors;
    private getSegmentOverlap;
    /**
     * Project a point onto a polygon in the shortest distance possible.
     *
     * @param {Phaser.Point} point The point to project
     * @param {NavPoly} navPoly The navigation polygon to test against
     * @returns {{point: Phaser.Point, distance: number}}
     */
    private projectPointToPolygon;
}
//# sourceMappingURL=navmesh.d.ts.map