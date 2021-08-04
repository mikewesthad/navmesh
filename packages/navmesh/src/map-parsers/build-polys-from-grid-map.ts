import { Point, PolyPoints } from "../common-types";
import { isTruthy } from "../utils";
import { GridMap, TileWalkableTest } from "./grid-map";
import { PointQueue } from "./point-queue";
import { RectangleHull } from "./rectangle-hull";

type CardinalDirection = "top" | "bottom" | "left" | "right";

/**
 * This parses a world that is a uniform grid into convex polygons (specifically rectangles) that
 * can be used for building a navmesh. This is designed mainly for parsing tilemaps into polygons.
 * The functions takes a 2D array that indicates which tiles are walkable and which aren't. The
 * function returns PolyPoint[] that can be used to construct a NavMesh.
 *
 * Notes:
 * - This algorithm traverses the walkable tiles in a depth-first search, combining neighbors into
 *   rectangular polygons. This may not produce the best navmesh, but it doesn't require any manual
 *   work!
 * - This assumes the world is a uniform grid. It should work for any tile size, provided that all
 *   tiles are the same width and height.
 *
 * @param map 2D array of any type.
 * @param tileWidth The width of each tile in the grid.
 * @param tileHeight The height of each tile in the grid.
 * @param isWalkable Function that is used to test if a specific location in the map is walkable.
 * Defaults to assuming "truthy" means walkable.
 * @param shrinkAmount Amount to "shrink" the mesh away from the tiles. This adds more polygons
 * to the generated mesh, but can be helpful for preventing agents from getting caught on edges.
 * This supports values between 0 and tileWidth/tileHeight (whichever dimension is smaller).
 */
export default function buildPolysFromGridMap<TileType>(
  map: TileType[][],
  tileWidth: number = 1,
  tileHeight: number = 1,
  isWalkable: TileWalkableTest<TileType> = isTruthy,
  shrinkAmount: number = 0
): PolyPoints[] {
  const gridMap = new GridMap(map, isWalkable, tileWidth, tileHeight);

  if (shrinkAmount >= tileWidth || shrinkAmount >= tileHeight) {
    throw new Error(
      `navmesh: Unsupported shrink amount ${shrinkAmount}. Must be less than tile width and height.`
    );
  }

  let hulls: RectangleHull[] = buildInitialHulls(gridMap);

  if (shrinkAmount > 0) {
    hulls = shrinkHulls(hulls, gridMap, shrinkAmount);
  }

  return hulls.map((hull) => hull.toPoints());
}

/**
 * Build up rectangular hulls from the walkable areas of a GridMap. This starts with a walkable tile
 * and attempts to "grow" each of its edges to engulf its neighbors. This process repeats until the
 * current hull can't engulf any neighbors.
 * @param gridMap
 */
function buildInitialHulls<TileType>(gridMap: GridMap<TileType>) {
  const walkableQueue = new PointQueue();
  const { tileWidth, tileHeight } = gridMap;
  const hulls: RectangleHull[] = [];
  let currentHull;

  gridMap.forEach((x, y) => {
    if (gridMap.isWalkable(x, y)) walkableQueue.add({ x, y });
  });

  const getExtensionPoints = (hull: RectangleHull, dir: CardinalDirection) => {
    const { top, left, right, bottom } = hull;
    let points: Point[] = [];
    if (dir === "top") {
      for (let x = left; x <= right - 1; x++) points.push({ x, y: top });
    } else if (dir === "bottom") {
      for (let x = left; x <= right - 1; x++) points.push({ x, y: bottom });
    } else if (dir === "left") {
      for (let y = top; y <= bottom - 1; y++) points.push({ x: left, y });
    } else if (dir === "right") {
      for (let y = top; y <= bottom - 1; y++) points.push({ x: right, y });
    } else {
      throw new Error(`Invalid dir "${dir}" for extend`);
    }
    return points;
  };

  const extendHullInDirection = (hull: RectangleHull, dir: CardinalDirection) => {
    if (dir === "top") hull.y -= 1;
    else if (dir === "bottom") hull.bottom += 1;
    else if (dir === "left") hull.x -= 1;
    else if (dir === "right") hull.right += 1;
    else throw new Error(`Invalid dir "${dir}" for extend`);
  };

  const attemptExtension = (hull: RectangleHull, dir: CardinalDirection) => {
    const neighborPoints = getExtensionPoints(hull, dir);
    const canExtend = walkableQueue.containsAllPoints(neighborPoints);
    if (canExtend) {
      extendHullInDirection(hull, dir);
      walkableQueue.removePoints(neighborPoints);
    }
    return canExtend;
  };

  while (!walkableQueue.isEmpty()) {
    // Find next colliding tile to start the algorithm.
    const tile = walkableQueue.shift();
    if (tile === undefined) break;

    // Use tile dimensions (i.e. 1 tile wide, 1 tile tall) to simplify the checks.
    currentHull = new RectangleHull(tile.x, tile.y, 1, 1);

    // Check edges of bounding box to see if they can be extended.
    let needsExtensionCheck = true;
    while (needsExtensionCheck) {
      const extendedTop = attemptExtension(currentHull, "top");
      const extendedRight = attemptExtension(currentHull, "right");
      const extendedLeft = attemptExtension(currentHull, "left");
      const extendedBottom = attemptExtension(currentHull, "bottom");
      needsExtensionCheck = extendedTop || extendedBottom || extendedLeft || extendedRight;
    }

    // Scale the hull up from grid dimensions to real world dimensions.
    currentHull.setPosition(currentHull.x * tileWidth, currentHull.y * tileHeight);
    currentHull.setSize(currentHull.width * tileWidth, currentHull.height * tileHeight);
    hulls.push(currentHull);
  }

  return hulls;
}
// TODO: check larger than tile size. Assumes shrink <= 1 tile.
function shrinkHull<TileType>(
  hull: RectangleHull,
  gridMap: GridMap<TileType>,
  shrinkAmount: number,
  tileWidth: number,
  tileHeight: number
) {
  const s = shrinkAmount;
  const halfWidth = tileWidth / 2;
  const halfHeight = tileHeight / 2;
  const { left, top, right, bottom } = hull;

  const info = {
    left: false,
    right: false,
    top: false,
    bottom: false,
    topLeft: gridMap.isBlockedAtWorld(left - s, top - s),
    topRight: gridMap.isBlockedAtWorld(right + s, top - s),
    bottomLeft: gridMap.isBlockedAtWorld(left - s, bottom + s),
    bottomRight: gridMap.isBlockedAtWorld(right + s, bottom + s),
  };

  for (let y = top + halfHeight; y < bottom; y += halfHeight) {
    if (gridMap.isBlockedAtWorld(left - s, y)) {
      info.left = true;
      break;
    }
  }
  for (let y = top + halfHeight; y < bottom; y += halfHeight) {
    if (gridMap.isBlockedAtWorld(right + s, y)) {
      info.right = true;
      break;
    }
  }
  for (let x = left + halfWidth; x < right; x += halfWidth) {
    if (gridMap.isBlockedAtWorld(x, top - shrinkAmount)) {
      info.top = true;
      break;
    }
  }
  for (let x = left + halfWidth; x < right; x += halfWidth) {
    if (gridMap.isBlockedAtWorld(x, bottom + shrinkAmount)) {
      info.bottom = true;
      break;
    }
  }

  const shrink = {
    left: info.left,
    right: info.right,
    top: info.top,
    bottom: info.bottom,
  };

  if (info.topLeft && !info.left && !info.top) {
    if (hull.width > hull.height) shrink.left = true;
    else shrink.top = true;
  }
  if (info.topRight && !info.right && !info.top) {
    if (hull.width > hull.height) shrink.right = true;
    else shrink.top = true;
  }
  if (info.bottomLeft && !info.bottom && !info.left) {
    if (hull.width > hull.height) shrink.left = true;
    else shrink.bottom = true;
  }
  if (info.bottomRight && !info.bottom && !info.right) {
    if (hull.width > hull.height) shrink.right = true;
    else shrink.bottom = true;
  }

  if (shrink.left) {
    hull.x += shrinkAmount;
    hull.width -= shrinkAmount;
  }
  if (shrink.top) {
    hull.y += shrinkAmount;
    hull.height -= shrinkAmount;
  }
  if (shrink.right) {
    hull.width -= shrinkAmount;
  }
  if (shrink.bottom) {
    hull.height -= shrinkAmount;
  }

  return shrink;
}

function shrinkHulls<TileType>(
  hulls: RectangleHull[],
  gridMap: GridMap<TileType>,
  shrinkAmount: number
) {
  const { tileHeight, tileWidth } = gridMap;
  const newHulls: RectangleHull[] = [];
  const finalHulls: RectangleHull[] = [];

  hulls.forEach((hull, hullIndex) => {
    const th = tileHeight;
    const tw = tileWidth;
    const tLeft = gridMap.getGridX(hull.x);
    const tTop = gridMap.getGridY(hull.y);
    const tBottom = gridMap.getGridY(hull.bottom);
    const tRight = gridMap.getGridX(hull.right);
    const shrink = shrinkHull(hull, gridMap, shrinkAmount, tileWidth, tileHeight);

    if (hull.left >= hull.right || hull.top >= hull.bottom) return;

    finalHulls.push(hull);

    const newVerticalHulls: RectangleHull[] = [];
    const newHorizontalHulls: RectangleHull[] = [];
    const addHull = (x: number, y: number, w: number, h: number) => {
      const hull = new RectangleHull(x, y, w, h);
      if (w > h) newHorizontalHulls.push(hull);
      else newVerticalHulls.push(hull);
    };

    if (shrink.left) {
      const x = hull.left - shrinkAmount;
      let startY = tTop;
      let endY = startY - 1;
      for (let y = tTop; y < tBottom; y++) {
        if (gridMap.isBlocked(tLeft - 1, y)) {
          if (startY <= endY) {
            addHull(x, startY * th, shrinkAmount, (endY - startY + 1) * th);
          }
          startY = y + 1;
        } else {
          endY = y;
        }
      }
      if (startY <= endY) {
        addHull(x, startY * th, shrinkAmount, (endY - startY + 1) * th);
      }
    }

    if (shrink.right) {
      const x = hull.right;
      let startY = tTop;
      let endY = startY - 1;
      for (let y = tTop; y < tBottom; y++) {
        if (gridMap.isBlocked(tRight, y)) {
          if (startY <= endY) {
            addHull(x, startY * th, shrinkAmount, (endY - startY + 1) * th);
          }
          startY = y + 1;
        } else {
          endY = y;
        }
      }
      if (startY <= endY) {
        addHull(x, startY * th, shrinkAmount, (endY - startY + 1) * th);
      }
    }

    if (shrink.top) {
      const y = hull.top - shrinkAmount;
      let startX = tLeft;
      let endX = startX - 1;
      for (let x = tLeft; x < tRight; x++) {
        if (gridMap.isBlocked(x, tTop - 1)) {
          if (startX <= endX) {
            addHull(startX * tw, y, (endX - startX + 1) * th, shrinkAmount);
          }
          startX = x + 1;
        } else {
          endX = x;
        }
      }
      if (startX <= endX) {
        addHull(startX * tw, y, (endX - startX + 1) * th, shrinkAmount);
      }
    }

    if (shrink.bottom) {
      const y = hull.bottom;
      let startX = tLeft;
      let endX = startX - 1;
      for (let x = tLeft; x < tRight; x++) {
        if (gridMap.isBlocked(x, tBottom)) {
          if (startX <= endX) {
            addHull(startX * tw, y, (endX - startX + 1) * th, shrinkAmount);
          }
          startX = x + 1;
        } else {
          endX = x;
        }
      }
      if (startX <= endX) {
        addHull(startX * tw, y, (endX - startX + 1) * th, shrinkAmount);
      }
    }

    // Shrunk at corners when the new hulls overlap.
    newHorizontalHulls.forEach((hh) => {
      newVerticalHulls.forEach((vh) => {
        if (hh.doesOverlap(vh)) {
          const isBottomSide = hh.y > vh.y;
          if (isBottomSide) vh.height -= shrinkAmount;
          else vh.top += shrinkAmount;
        }
      });
    });

    [...newHorizontalHulls, ...newVerticalHulls].forEach((hull) => {
      shrinkHull(hull, gridMap, shrinkAmount, tileWidth, tileHeight);
      if (hull.left >= hull.right || hull.top >= hull.bottom) return;
      newHulls.push(hull);
    });
  });

  // Attempt to merge new hulls into existing hulls if possible.
  for (let i = 0; i < newHulls.length; i++) {
    let wasMerged = false;
    // Attempt to merge into the main (shrunken) hulls first.
    for (const mainHull of hulls) {
      wasMerged = mainHull.attemptMergeIn(newHulls[i]);
      if (wasMerged) break;
    }
    if (wasMerged) continue;
    // Then check to see if we can merge into a later hull in newHulls.
    for (let j = i + 1; j < newHulls.length; j++) {
      wasMerged = newHulls[j].attemptMergeIn(newHulls[i]);
      if (wasMerged) break;
    }
    if (!wasMerged) finalHulls.push(newHulls[i]);
  }

  return finalHulls;
}
