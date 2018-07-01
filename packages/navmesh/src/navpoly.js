import Vector2 from "./math/vector-2";

/**
 * A class that represents a navigable polygon with a navmesh. It is built on top of a
 * {@link Polygon}. It implements the properties and fields that javascript-astar needs - weight,
 * toString, isWall and getCost. See GPS test from astar repo for structure:
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavPoly
 */
export default class NavPoly {
  /**
   * Creates an instance of NavPoly.
   * @param {number} id
   * @param {Polygon} polygon
   *
   * @memberof NavPoly
   */
  constructor(id, polygon) {
    this.id = id;
    this.polygon = polygon;
    this.edges = polygon.edges;
    this.neighbors = [];
    this.portals = [];
    this.centroid = this.calculateCentroid();
    this.boundingRadius = this.calculateRadius();

    this.weight = 1; // jsastar property
  }

  /**
   * Returns an array of points that form the polygon.
   *
   * @returns {Vector2[]}
   * @memberof NavPoly
   */
  getPoints() {
    return this.polygon.points;
  }

  /**
   * Check if the given point-like object is within the polygon
   *
   * @param {object} point Object of the form {x, y}
   * @returns {boolean}
   * @memberof NavPoly
   */
  contains(point) {
    // Phaser's polygon check doesn't handle when a point is on one of the edges of the line. Note:
    // check numerical stability here. It would also be good to optimize this for different shapes.
    return this.polygon.contains(point.x, point.y) || this.isPointOnEdge(point);
  }

  /**
   * Only rectangles are supported, so this calculation works, but this is not actually the centroid
   * calculation for a polygon. This is just the average of the vertices - proper centroid of a
   * polygon factors in the area.
   *
   * @returns {Vector2}
   * @memberof NavPoly
   */
  calculateCentroid() {
    const centroid = new Vector2(0, 0);
    const length = this.polygon.points.length;
    this.polygon.points.forEach(p => centroid.add(p));
    centroid.x /= length;
    centroid.y /= length;
    return centroid;
  }

  /**
   * Calculate the radius of a circle that circumscribes the polygon.
   *
   * @returns {number}
   * @memberof NavPoly
   */
  calculateRadius() {
    let boundingRadius = 0;
    for (const point of this.polygon.points) {
      const d = this.centroid.distance(point);
      if (d > boundingRadius) boundingRadius = d;
    }
    return boundingRadius;
  }

  /**
   * Check if the given point-like object is on one of the edges of the polygon.
   *
   * @param {object} Point-like object in the form { x, y }
   * @returns {boolean}
   * @memberof NavPoly
   */
  isPointOnEdge({ x, y }) {
    for (const edge of this.edges) {
      if (edge.pointOnSegment(x, y)) return true;
    }
    return false;
  }

  destroy() {
    this.neighbors = [];
    this.portals = [];
  }

  // jsastar methods
  toString() {
    return `NavPoly(id: ${this.id} at: ${this.centroid})`;
  }
  isWall() {
    return this.weight === 0;
  }
  centroidDistance(navPolygon) {
    return this.centroid.distance(navPolygon.centroid);
  }
  getCost(navPolygon) {
    return this.centroidDistance(navPolygon);
  }
}
