import { Point } from "../common-types";
import Line from "./line";

/**
 * Stripped down version of Phaser's Polygon with just the functionality needed for navmeshes.
 *
 * @export
 * @class Polygon
 */
export default class Polygon {
  public edges: Line[];
  public points: Point[];
  private isClosed: boolean;

  constructor(points: Point[], closed = true) {
    this.isClosed = closed;
    this.points = points;
    this.edges = [];

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      this.edges.push(new Line(p1.x, p1.y, p2.x, p2.y));
    }

    if (this.isClosed) {
      const first = points[0];
      const last = points[points.length - 1];
      this.edges.push(new Line(first.x, first.y, last.x, last.y));
    }
  }

  public contains(x: number, y: number) {
    let inside = false;

    for (let i = -1, j = this.points.length - 1; ++i < this.points.length; j = i) {
      const ix = this.points[i].x;
      const iy = this.points[i].y;

      const jx = this.points[j].x;
      const jy = this.points[j].y;

      if (
        ((iy <= y && y < jy) || (jy <= y && y < iy)) &&
        x < ((jx - ix) * (y - iy)) / (jy - iy) + ix
      ) {
        inside = !inside;
      }
    }

    return inside;
  }
}
