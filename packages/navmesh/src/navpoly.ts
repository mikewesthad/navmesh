import Line from "./math/line";
import Polygon from "./math/polygon";
import Vector2 from "./math/vector-2";
import { Portal } from "./channel";
import { Point } from "./common-types";
import jsastar from "javascript-astar";

/**
 * A class that represents a navigable polygon with a navmesh. It is built on top of a
 * {@link Polygon}. It implements the properties and fields that javascript-astar needs - weight,
 * toString, isWall and getCost. See GPS test from astar repo for structure:
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 */
export default class NavPoly implements jsastar.GridNode {
  public id: number;
  public polygon: Polygon;
  public edges: Line[];
  public neighbors: NavPoly[];
  public portals: Line[];
  public centroid: Vector2;
  public boundingRadius: number;

  // jsastar property:
  public weight = 1;
  public x: number = 0;
  public y: number = 0;

  /**
   * Creates an instance of NavPoly.
   */
  constructor(id: number, polygon: Polygon) {
    this.id = id;
    this.polygon = polygon;
    this.edges = polygon.edges;
    this.neighbors = [];
    this.portals = [];
    this.centroid = this.calculateCentroid();
    this.boundingRadius = this.calculateRadius();
  }

  /**
   * Returns an array of points that form the polygon.
   */
  public getPoints() {
    return this.polygon.points;
  }

  /**
   * Check if the given point-like object is within the polygon.
   */
  public contains(point: Point) {
    // Phaser's polygon check doesn't handle when a point is on one of the edges of the line. Note:
    // check numerical stability here. It would also be good to optimize this for different shapes.
    return this.polygon.contains(point.x, point.y) || this.isPointOnEdge(point);
  }

  /**
   * Only rectangles are supported, so this calculation works, but this is not actually the centroid
   * calculation for a polygon. This is just the average of the vertices - proper centroid of a
   * polygon factors in the area.
   */
  public calculateCentroid() {
    const centroid = new Vector2(0, 0);
    const length = this.polygon.points.length;
    this.polygon.points.forEach((p) => centroid.add(p));
    centroid.x /= length;
    centroid.y /= length;
    return centroid;
  }

  /**
   * Calculate the radius of a circle that circumscribes the polygon.
   */
  public calculateRadius() {
    let boundingRadius = 0;
    for (const point of this.polygon.points) {
      const d = this.centroid.distance(point);
      if (d > boundingRadius) boundingRadius = d;
    }
    return boundingRadius;
  }

  /**
   * Check if the given point-like object is on one of the edges of the polygon.
   */
  public isPointOnEdge({ x, y }: Point) {
    for (const edge of this.edges) {
      if (edge.pointOnSegment(x, y)) return true;
    }
    return false;
  }

  public destroy() {
    this.neighbors = [];
    this.portals = [];
  }

  // === jsastar methods ===

  public toString() {
    return `NavPoly(id: ${this.id} at: ${this.centroid})`;
  }

  public isWall() {
    return this.weight === 0;
  }

  public centroidDistance(navPolygon: NavPoly) {
    return this.centroid.distance(navPolygon.centroid);
  }

  public getCost(navPolygon: NavPoly) {
    return this.centroidDistance(navPolygon);
  }
}
