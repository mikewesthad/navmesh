import { Point } from "../common-types";
import { isTruthy } from "../utils";
import { PointQueue } from "./point-queue";
import { RectangleHull } from "./rectangle-hull";

type CardinalDirection = "top" | "bottom" | "left" | "right";

/**
 * This parses a map that is a grid of squares into convex polygons that can be used for building a
 * navmesh. This is designed mainly for parsing tilemaps into polygons. NOTE: this is a rough
 * initial implementation. It needs some refactoring to clean it up!
 * @param map 2D array of any type.
 * @param isWalkable Function that is used to test if a specific location in the map is walkable.
 * Defaults to assuming "truthy" means walkable.
 */
export default function parseSquareMap<TileType>(
  map: TileType[][],
  isWalkable: (tile: TileType, x: number, y: number) => boolean = isTruthy
) {
  const walkableQueue = new PointQueue();
  const hulls: RectangleHull[] = [];
  let currentHull;

  // Build up the queue of walkable tiles.
  map.forEach((row, y) => {
    row.forEach((col, x) => {
      if (isWalkable(col, x, y)) walkableQueue.add({ x, y });
    });
  });

  const getExtensionPoints = (hull: RectangleHull, dir: CardinalDirection) => {
    const points: Point[] = [];
    if (dir === "top") hull.forEachTopPoint((x, y) => points.push({ x, y: y - 1 }));
    else if (dir === "bottom") hull.forEachBottomPoint((x, y) => points.push({ x, y: y + 1 }));
    else if (dir === "left") hull.forEachLeftPoint((x, y) => points.push({ x: x - 1, y }));
    else if (dir === "right") hull.forEachRightPoint((x, y) => points.push({ x: x + 1, y }));
    else throw new Error(`Invalid dir "${dir}" for extend`);
    return points;
  };

  const extendHullInDirection = (hull: RectangleHull, dir: CardinalDirection) => {
    if (dir === "top") hull.top -= 1;
    else if (dir === "bottom") hull.bottom += 1;
    else if (dir === "left") hull.left -= 1;
    else if (dir === "right") hull.right += 1;
    else throw new Error(`Invalid dir "${dir}" for extend`);
  };

  const attemptExtension = (hull: RectangleHull, dir: CardinalDirection) => {
    const neighborPoints = getExtensionPoints(hull, dir);
    const canExtend = walkableQueue.containsAllPoints(neighborPoints);
    if (canExtend) {
      extendHullInDirection(hull, dir);
      hull.tiles.push(...neighborPoints);
      walkableQueue.removePoints(neighborPoints);
    }
    return canExtend;
  };

  while (!walkableQueue.isEmpty()) {
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
      const extendedTop = attemptExtension(currentHull, "top");
      const extendedBottom = attemptExtension(currentHull, "bottom");
      const extendedLeft = attemptExtension(currentHull, "left");
      const extendedRight = attemptExtension(currentHull, "right");
      needsExtensionCheck = extendedTop || extendedBottom || extendedLeft || extendedRight;
    }

    hulls.push(currentHull);
  }

  return hulls;
}
