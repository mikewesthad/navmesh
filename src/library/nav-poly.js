import Line from "./math/line";
import Vector2 from "./math/vector-2";

// Debug color palette
const palette = [0x00a0b0, 0x6a4a3c, 0xcc333f, 0xeb6841, 0xedc951];

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

    const i = this.id % palette.length;
    this._color = palette[i];
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

  /**
   * Draw the polygon to given graphics object
   *
   * @param {Phaser.Graphics} graphics
   * @param {boolean} [drawCentroid=true] Show the approx centroid
   * @param {boolean} [drawBounds=false] Show the bounding radius
   * @param {boolean} [drawNeighbors=true] Show the connections to neighbors
   * @param {boolean} [drawPortals=true] Show the portal edges
   *
   * @memberof NavPoly
   */
  draw(
    graphics,
    drawCentroid = true,
    drawBounds = false,
    drawNeighbors = true,
    drawPortals = true
  ) {
    graphics.fillStyle(this._color);
    graphics.fillPoints(this.polygon.points, true);

    if (drawCentroid) {
      graphics.fillStyle(0x000000);
      graphics.fillCircle(this.centroid.x, this.centroid.y, 4);
    }

    if (drawBounds) {
      graphics.lineStyle(1, 0xffffff);
      graphics.strokeCircle(this.centroid.x, this.centroid.y, this.boundingRadius);
    }

    if (drawNeighbors) {
      graphics.lineStyle(2, 0x000000);
      this.neighbors.forEach(n => {
        graphics.lineBetween(this.centroid.x, this.centroid.y, n.centroid.x, n.centroid.y);
      });
    }

    if (drawPortals) {
      graphics.lineStyle(10, 0x000000);
      this.portals.forEach(p => graphics.strokeLineShape(p));
    }
  }
}

export default NavPoly;
