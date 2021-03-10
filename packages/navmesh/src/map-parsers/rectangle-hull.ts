import { Point } from "../common-types";

/**
 * Class for managing hulls created by combining square tiles.
 */
export class RectangleHull {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public set(left: number, top: number, width: number, height: number) {
    this.setPosition(left, top);
    this.setSize(width, height);
  }

  public get left() {
    return this.x;
  }

  public set left(val) {
    this.x = val;
  }

  public get top() {
    return this.y;
  }

  public set top(val) {
    this.y = val;
  }

  // TODO: make consistent. Either left/right should both resize or they should both just reposition
  public get right() {
    return this.x + this.width;
  }

  public set right(val) {
    this.width = val - this.x;
  }

  public get bottom() {
    return this.y + this.height;
  }

  public set bottom(val) {
    this.height = val - this.top;
  }

  public get center(): Point {
    return { x: (this.x + this.right) / 2, y: (this.y + this.bottom) / 2 };
  }

  public doesOverlap(otherHull: RectangleHull) {
    return !(
      this.right < otherHull.x ||
      this.x > otherHull.right ||
      this.y > otherHull.bottom ||
      this.bottom < otherHull.y
    );
  }

  /**
   * Attempt to merge another hull into this one. If they share an edge, `this` will be extended to
   * contain `otherHull`.
   * @param otherHull
   */
  public attemptMergeIn(otherHull: RectangleHull): boolean {
    const horizontalMatch = this.x === otherHull.x && this.width === otherHull.width;
    const verticalMatch = this.y === otherHull.y && this.height === otherHull.height;
    if (horizontalMatch && this.top === otherHull.bottom) {
      this.height += otherHull.height;
      this.y = otherHull.y;
      return true;
    }
    if (horizontalMatch && this.bottom === otherHull.top) {
      this.bottom = otherHull.bottom;
      return true;
    }
    if (verticalMatch && this.left === otherHull.right) {
      this.width += otherHull.width;
      this.x = otherHull.x;
      return true;
    }
    if (verticalMatch && this.right === otherHull.left) {
      this.right = otherHull.right;
      return true;
    }
    return false;
  }

  public toPoints() {
    const { left, right, top, bottom } = this;
    return [
      { x: left, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ];
  }
}
