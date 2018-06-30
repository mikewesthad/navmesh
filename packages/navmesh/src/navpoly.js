import Vector2 from "./math/vector-2";

/**
 * A class that represents a navigable polygon in a navmesh. It is build from a Phaser.Polygon. It
 * has a drawing function to help visualize it's features:
 *  - polygon
 *  - neighbors - any navpolys that can be reached from this navpoly
 *  - portals - overlapping edges between neighbors
 *  - centroid - not a true centroid, just an approximation.
 *  - boundingRadius - the radius of a circle at the centroid that fits all the points of the poly
 *
 * It implements the properties and fields that javascript-astar needs - weight, toString, isWall
 * and getCost. See GPS test from astar repo for structure:
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavPoly
 * @private
 */
class NavPoly {
  /**
   * Creates an instance of NavPoly.
   * @param {Phaser.Game} game
   * @param {number} id
   * @param {Phaser.Polygon} polygon
   *
   * @memberof NavPoly
   */
  constructor(id, polygon) {
    this.id = id;
    this.polygon = polygon;
    this.edges = polygon.edges;
    this.neighbors = [];
    this.portals = [];
    this.centroid = this._calculateCentroid();
    this.boundingRadius = this._calculateRadius();

    this.weight = 1; // jsastar property
  }

  getPoints() {
    return this.polygon.points;
  }

  contains(point) {
    // Phaser's polygon check doesn't handle when a point is on one of the edges of the line. Note:
    // check numerical stability here. It would also be good to optimize this for different shapes.
    return this.polygon.contains(point.x, point.y) || this._isPointOnEdge(point);
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

  _calculateCentroid() {
    // NOTE: this is not actually the centroid, it's the average of the vertices - not the same
    // thing!
    const centroid = new Vector2(0, 0);
    const length = this.polygon.points.length;
    this.polygon.points.forEach(p => centroid.add(p));
    centroid.x /= length;
    centroid.y /= length;
    return centroid;
  }

  _calculateRadius() {
    let boundingRadius = 0;
    for (const point of this.polygon.points) {
      const d = this.centroid.distance(point);
      if (d > boundingRadius) boundingRadius = d;
    }
    return boundingRadius;
  }

  _isPointOnEdge({ x, y }) {
    for (const edge of this.edges) {
      if (edge.pointOnSegment(x, y)) return true;
    }
    return false;
  }
}

export default NavPoly;
