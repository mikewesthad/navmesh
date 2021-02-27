import { Point } from "../common-types";

/**
 * Internal helper class to manage a queue of points when parsing a square map.
 */
export class PointQueue {
  private data: Point[] = [];

  add(point: Point) {
    this.data.push(point);
  }

  shift() {
    return this.data.shift();
  }

  isEmpty() {
    return this.data.length === 0;
  }

  containsPoint(point: Point) {
    return this.data.find((p) => p.x === point.x && p.y === point.y) !== undefined ? true : false;
  }

  containsAllPoints(points: Point[]) {
    return points.every((p) => this.containsPoint(p));
  }

  getIndexOfPoint(point: Point) {
    return this.data.findIndex((p) => p.x == point.x && p.y == point.y);
  }

  removePoint(point: Point) {
    const index = this.getIndexOfPoint(point);
    if (index !== -1) this.data.splice(index, 1);
  }

  removePoints(points: Point[]) {
    points.forEach((p) => this.removePoint(p));
  }
}
