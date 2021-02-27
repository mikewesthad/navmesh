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

const isTruthy = (input: any) => Boolean(input);

/**
 * This parses a map that is a grid of squares into convex polygons that can be used for building
 * a navmesh. This is designed mainly for parsing tilemaps into polygons.
 * NOTE: this is a rough initial implementation. It needs some refactoring to clean it up!
 * @param map
 */
export default function parseSquareMap<TileType>(
  map: TileType[][],
  isWalkable: (tile: TileType, x: number, y: number) => boolean = isTruthy
) {
  const walkableQueue: Point[] = [];
  const hulls: RectangleHull[] = [];
  let currentHull;

  map.forEach((row, y) => {
    row.forEach((col, x) => {
      if (isWalkable(col, x, y)) walkableQueue.push({ x, y });
    });
  });

  const isInQueue = (x: number, y: number) => walkableQueue.find((p) => p.x === x && p.y === y);

  const extend = (hull: RectangleHull, direction: CardinalDirection) => {
    let points = [];
    if (direction === "top") {
      for (let x = hull.left; x <= hull.right; x++) points.push({ x, y: hull.top - 1 });
    } else if (direction === "bottom") {
      for (let x = hull.left; x <= hull.right; x++) points.push({ x, y: hull.bottom + 1 });
    } else if (direction === "left") {
      for (let y = hull.top; y <= hull.bottom; y++) points.push({ x: hull.left - 1, y });
    } else if (direction === "right") {
      for (let y = hull.top; y <= hull.bottom; y++) points.push({ x: hull.right + 1, y });
    } else {
      throw new Error(`Invalid direction "${direction}" for extend`);
    }

    let canExtend = true;
    const extendTiles: Point[] = [];
    for (const { x, y } of points) {
      if (isInQueue(x, y)) {
        extendTiles.push({ x, y });
      } else {
        canExtend = false;
        break;
      }
    }

    if (canExtend) {
      if (direction === "top") hull.top -= 1;
      else if (direction === "bottom") hull.bottom += 1;
      else if (direction === "left") hull.left -= 1;
      else if (direction === "right") hull.right += 1;

      hull.tiles.push(...extendTiles);
      extendTiles.forEach((point) => {
        const index = walkableQueue.findIndex((p) => p.x == point.x && p.y == point.y);
        if (index !== -1) walkableQueue.splice(index, 1);
      });
    }

    return canExtend;
  };

  while (walkableQueue.length !== 0) {
    // Find next colliding tile to start the algorithm.
    const tile = walkableQueue.shift();
    if (tile === undefined) break;

    currentHull = new RectangleHull(0, 0, 0, 0);
    currentHull.left = tile.x;
    currentHull.right = tile.x;
    currentHull.top = tile.y;
    currentHull.bottom = tile.y;
    currentHull.tiles.push(tile);

    // Check edges of bounding box to see if they can be extended.
    let needsExtensionCheck = true;
    while (needsExtensionCheck) {
      const extendedTop = extend(currentHull, "top");
      const extendedBottom = extend(currentHull, "bottom");
      const extendedLeft = extend(currentHull, "left");
      const extendedRight = extend(currentHull, "right");
      needsExtensionCheck = extendedTop || extendedBottom || extendedLeft || extendedRight;
    }

    hulls.push(currentHull);
  }

  return hulls;
}
