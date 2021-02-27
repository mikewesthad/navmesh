import { Point } from "../common-types";

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
}

type CardinalDirection = "top" | "bottom" | "left" | "right";

/**
 * This parses a map that is a grid of squares into convex polygons that can be used for building
 * a navmesh. This is designed mainly for parsing tilemaps into polygons.
 * NOTE: this is a rough initial implementation. It needs some refactoring to clean it up!
 * @param map
 */
export default function parseSquareMap(map: number[][]) {
  const colliding: Point[] = [];
  let currentBox;
  const hulls: RectangleHull[] = [];

  map.forEach((row, y) => {
    row.forEach((col, x) => {
      if (col !== 0) colliding.push({ x, y });
    });
  });

  const isColliding = (x: number, y: number) => (map[y] && map[y][x] == 1 ? true : false);
  const isInQueue = (x: number, y: number) => colliding.find((p) => p.x === x && p.y === y);

  const extend = (box: RectangleHull, direction: CardinalDirection) => {
    let points = [];
    if (direction === "top") {
      for (let x = box.left; x <= box.right; x++) points.push({ x, y: box.top - 1 });
    } else if (direction === "bottom") {
      for (let x = box.left; x <= box.right; x++) points.push({ x, y: box.bottom + 1 });
    } else if (direction === "left") {
      for (let y = box.top; y <= box.bottom; y++) points.push({ x: box.left - 1, y });
    } else if (direction === "right") {
      for (let y = box.top; y <= box.bottom; y++) points.push({ x: box.right + 1, y });
    } else {
      throw new Error(`Invalid direction "${direction}" for extend`);
    }

    let canExtend = true;
    const extendTiles: Point[] = [];
    for (const { x, y } of points) {
      if (isColliding(x, y) && isInQueue(x, y)) {
        extendTiles.push({ x, y });
      } else {
        canExtend = false;
        break;
      }
    }

    if (canExtend) {
      if (direction === "top") box.top -= 1;
      else if (direction === "bottom") box.bottom += 1;
      else if (direction === "left") box.left -= 1;
      else if (direction === "right") box.right += 1;

      box.tiles.push(...extendTiles);
      extendTiles.forEach((point) => {
        const index = colliding.findIndex((p) => p.x == point.x && p.y == point.y);
        if (index !== -1) colliding.splice(index, 1);
      });
    }

    return canExtend;
  };

  while (colliding.length !== 0) {
    // Find next colliding tile to start the algorithm.
    const tile = colliding.shift()!;
    currentBox = new RectangleHull(0, 0, 0, 0);
    currentBox.left = tile.x;
    currentBox.right = tile.x;
    currentBox.top = tile.y;
    currentBox.bottom = tile.y;
    currentBox.tiles.push(tile);

    // Check edges of bounding box to see if they can be extended.
    let needsExtensionCheck = true;
    while (needsExtensionCheck) {
      const extendedTop = extend(currentBox, "top");
      const extendedBottom = extend(currentBox, "bottom");
      const extendedLeft = extend(currentBox, "left");
      const extendedRight = extend(currentBox, "right");
      needsExtensionCheck = extendedTop || extendedBottom || extendedLeft || extendedRight;
    }

    hulls.push(currentBox);
  }

  return hulls;
}
