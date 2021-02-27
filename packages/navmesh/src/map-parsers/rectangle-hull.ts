import { Point } from "../common-types";

/**
 * Class for managing hulls created by combining square tiles.
 */
export class RectangleHull {
  public left: number;
  public right: number;
  public top: number;
  public bottom: number;
  public tiles: Point[];

  public constructor(left: number, top: number, right: number, bottom: number) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.tiles = [];
  }

  public forEachTopPoint(fn: (x: number, y: number) => void) {
    for (let x = this.left; x <= this.right; x++) fn(x, this.top);
  }

  public forEachBottomPoint(fn: (x: number, y: number) => void) {
    for (let x = this.left; x <= this.right; x++) fn(x, this.bottom);
  }

  public forEachLeftPoint(fn: (x: number, y: number) => void) {
    for (let y = this.top; y <= this.bottom; y++) fn(this.left, y);
  }

  public forEachRightPoint(fn: (x: number, y: number) => void) {
    for (let y = this.top; y <= this.bottom; y++) fn(this.right, y);
  }
}
