import NavMesh from "./navmesh";
import NavPoly from "./navpoly";
import { Point, PolyPoints } from "./common-types";
import buildPolysFromGridMap from "./map-parsers/build-polys-from-grid-map";

interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface WorldBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridBoundsInput {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
  width?: number;
  height?: number;
}

interface NormalizedGridBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface GridNavMeshUpdaterOptions {
  tileWidth?: number;
  tileHeight?: number;
  shrinkAmount?: number;
}

export interface GridNavMeshUpdateResult {
  removedPolyIds: number[];
  addedPolyIds: number[];
  neighborPolyIds: number[];
}

/**
 * Utility for applying local tile changes to a navmesh that was generated from a grid.
 *
 * This keeps updates local to the changed area instead of rebuilding the full mesh from scratch.
 * It is designed for rectangle-based meshes created by buildPolysFromGridMap.
 */
export default class GridNavMeshUpdater {
  private navMesh: NavMesh;
  private tileWidth: number;
  private tileHeight: number;
  private shrinkAmount: number;

  public constructor(navMesh: NavMesh, opts: GridNavMeshUpdaterOptions = {}) {
    this.navMesh = navMesh;
    this.tileWidth = opts.tileWidth ?? 1;
    this.tileHeight = opts.tileHeight ?? 1;
    this.shrinkAmount = opts.shrinkAmount ?? 0;
  }

  public blockTile(x: number, y: number) {
    return this.blockTiles([{ x, y }]);
  }

  public openTile(x: number, y: number) {
    return this.openTiles([{ x, y }]);
  }

  public blockTiles(tileCoords: Point[]) {
    return this.updateTiles(tileCoords, false);
  }

  public openTiles(tileCoords: Point[]) {
    return this.updateTiles(tileCoords, true);
  }

  public blockRange(x1: number, y1: number, x2: number, y2: number) {
    return this.blockTiles(this.createTileRange(x1, y1, x2, y2));
  }

  public openRange(x1: number, y1: number, x2: number, y2: number) {
    return this.openTiles(this.createTileRange(x1, y1, x2, y2));
  }

  public replaceBounds(bounds: GridBoundsInput, sourceGrid: boolean[][]): GridNavMeshUpdateResult {
    const normalized = this.normalizeGridBounds(bounds, sourceGrid);
    if (!normalized) return this.emptyResult();

    const worldBounds = {
      x: normalized.minX * this.tileWidth,
      y: normalized.minY * this.tileHeight,
      w: normalized.width * this.tileWidth,
      h: normalized.height * this.tileHeight,
    };

    const affectedPolys = this.navMesh
      .getPolygons()
      .filter((poly) => this.polygonIntersectsRect(poly.polygon.points, worldBounds));

    const localGrid: boolean[][] = [];
    for (let gridY = normalized.minY; gridY <= normalized.maxY; gridY += 1) {
      const row: boolean[] = [];
      for (let gridX = normalized.minX; gridX <= normalized.maxX; gridX += 1) {
        row.push(!!sourceGrid[gridY]?.[gridX]);
      }
      localGrid.push(row);
    }

    const newPolygons = this.extractPolygonsFromGrid(localGrid, worldBounds.x, worldBounds.y);

    if (affectedPolys.length === 0) {
      const addedPolys = this.navMesh.addPolygons(newPolygons);
      return {
        removedPolyIds: [],
        addedPolyIds: addedPolys.map((poly) => poly.id),
        neighborPolyIds: [],
      };
    }

    const { removedPolys, addedPolys, neighborPolys } = this.navMesh.replacePolygons(
      affectedPolys,
      newPolygons
    );

    return {
      removedPolyIds: removedPolys.map((poly) => poly.id),
      addedPolyIds: addedPolys.map((poly) => poly.id),
      neighborPolyIds: neighborPolys.map((poly) => poly.id),
    };
  }

  private updateTiles(tileCoords: Point[], walkable: boolean): GridNavMeshUpdateResult {
    const uniqueTiles = this.uniqueTiles(tileCoords);
    if (uniqueTiles.length === 0) {
      return this.emptyResult();
    }

    const tileRects = uniqueTiles.map((tile) => this.getTileRect(tile));
    const affectedPolys = walkable
      ? this.findOpeningAffectedPolygons(tileRects)
      : this.findBlockingAffectedPolygons(tileRects);

    if (!walkable && affectedPolys.length === 0) {
      return this.emptyResult();
    }

    const bounds = this.getUpdateBounds(affectedPolys, tileRects);
    const localGrid = this.buildLocalGrid(affectedPolys, bounds);

    uniqueTiles.forEach(({ x, y }) => {
      const localX = Math.floor((x * this.tileWidth - bounds.x) / this.tileWidth);
      const localY = Math.floor((y * this.tileHeight - bounds.y) / this.tileHeight);
      if (localGrid[localY]?.[localX] === undefined) return;
      localGrid[localY][localX] = walkable;
    });

    const newPolygons = this.extractPolygonsFromGrid(localGrid, bounds.x, bounds.y);

    if (affectedPolys.length === 0) {
      const addedPolys = this.navMesh.addPolygons(newPolygons);
      return {
        removedPolyIds: [],
        addedPolyIds: addedPolys.map((poly) => poly.id),
        neighborPolyIds: [],
      };
    }

    const { removedPolys, addedPolys, neighborPolys } = this.navMesh.replacePolygons(
      affectedPolys,
      newPolygons
    );

    return {
      removedPolyIds: removedPolys.map((poly) => poly.id),
      addedPolyIds: addedPolys.map((poly) => poly.id),
      neighborPolyIds: neighborPolys.map((poly) => poly.id),
    };
  }

  private createTileRange(x1: number, y1: number, x2: number, y2: number) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const tiles: Point[] = [];

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        tiles.push({ x, y });
      }
    }

    return tiles;
  }

  private uniqueTiles(tileCoords: Point[]) {
    const unique: Point[] = [];
    const seen = new Set<string>();

    tileCoords.forEach((tile) => {
      const key = `${tile.x},${tile.y}`;
      if (seen.has(key)) return;

      seen.add(key);
      unique.push(tile);
    });

    return unique;
  }

  private getTileRect(tile: Point): TileRect {
    return {
      x: tile.x * this.tileWidth,
      y: tile.y * this.tileHeight,
      w: this.tileWidth,
      h: this.tileHeight,
    };
  }

  private findBlockingAffectedPolygons(tileRects: TileRect[]) {
    return this.navMesh
      .getPolygons()
      .filter((poly) =>
        tileRects.some((tileRect) => this.polygonIntersectsRect(poly.polygon.points, tileRect))
      );
  }

  private findOpeningAffectedPolygons(tileRects: TileRect[]) {
    return this.navMesh.getPolygons().filter((poly) =>
      tileRects.some((tileRect) => this.polygonTouchesRect(poly.polygon.points, tileRect))
    );
  }

  private polygonTouchesRect(points: Point[], rect: TileRect) {
    return this.polygonIntersectsRect(points, rect) || this.polygonIsAdjacentToRect(points, rect);
  }

  private polygonIntersectsRect(points: Point[], rect: TileRect) {
    const bounds = this.getPolygonBounds(points);

    return !(
      bounds.x + bounds.w <= rect.x ||
      bounds.x >= rect.x + rect.w ||
      bounds.y + bounds.h <= rect.y ||
      bounds.y >= rect.y + rect.h
    );
  }

  private polygonIsAdjacentToRect(points: Point[], rect: TileRect) {
    const bounds = this.getPolygonBounds(points);

    const horizontallyAdjacent =
      (bounds.x + bounds.w === rect.x || bounds.x === rect.x + rect.w) &&
      !(bounds.y + bounds.h <= rect.y || bounds.y >= rect.y + rect.h);

    const verticallyAdjacent =
      (bounds.y + bounds.h === rect.y || bounds.y === rect.y + rect.h) &&
      !(bounds.x + bounds.w <= rect.x || bounds.x >= rect.x + rect.w);

    return horizontallyAdjacent || verticallyAdjacent;
  }

  private getPolygonBounds(points: Point[]) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys),
    };
  }

  private getUpdateBounds(affectedPolys: NavPoly[], tileRects: TileRect[]): WorldBounds {
    const polyPoints = affectedPolys.flatMap((poly) => poly.polygon.points);
    const xs = [
      ...polyPoints.map((point) => point.x),
      ...tileRects.map((rect) => rect.x),
      ...tileRects.map((rect) => rect.x + rect.w),
    ];
    const ys = [
      ...polyPoints.map((point) => point.y),
      ...tileRects.map((rect) => rect.y),
      ...tileRects.map((rect) => rect.y + rect.h),
    ];

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  private buildLocalGrid(affectedPolys: NavPoly[], bounds: WorldBounds) {
    const gridWidth = Math.max(1, Math.ceil(bounds.w / this.tileWidth));
    const gridHeight = Math.max(1, Math.ceil(bounds.h / this.tileHeight));
    const localGrid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));

    affectedPolys.forEach((poly) => {
      const points = poly.polygon.points;
      const minTileX = Math.floor((Math.min(...points.map((point) => point.x)) - bounds.x) / this.tileWidth);
      const maxTileX = Math.floor((Math.max(...points.map((point) => point.x)) - bounds.x) / this.tileWidth);
      const minTileY = Math.floor((Math.min(...points.map((point) => point.y)) - bounds.y) / this.tileHeight);
      const maxTileY = Math.floor((Math.max(...points.map((point) => point.y)) - bounds.y) / this.tileHeight);

      for (let ty = minTileY; ty <= maxTileY; ty += 1) {
        for (let tx = minTileX; tx <= maxTileX; tx += 1) {
          const worldX = bounds.x + tx * this.tileWidth + this.tileWidth / 2;
          const worldY = bounds.y + ty * this.tileHeight + this.tileHeight / 2;
          if (!poly.contains({ x: worldX, y: worldY })) continue;
          if (localGrid[ty]?.[tx] === undefined) continue;
          localGrid[ty][tx] = true;
        }
      }
    });

    return localGrid;
  }

  private extractPolygonsFromGrid(grid: boolean[][], originX: number, originY: number) {
    const localPolygons = buildPolysFromGridMap(
      grid,
      this.tileWidth,
      this.tileHeight,
      undefined,
      this.shrinkAmount
    );

    return localPolygons.map((poly) =>
      poly.map((point) => ({
        x: point.x + originX,
        y: point.y + originY,
      }))
    );
  }

  private emptyResult(): GridNavMeshUpdateResult {
    return { removedPolyIds: [], addedPolyIds: [], neighborPolyIds: [] };
  }

  private normalizeGridBounds(bounds: GridBoundsInput, sourceGrid: boolean[][]) {
    const height = sourceGrid.length;
    const width = sourceGrid[0]?.length ?? 0;
    if (!width || !height) return null;

    const rawMinX = bounds.minX ?? bounds.x;
    const rawMinY = bounds.minY ?? bounds.y;
    const rawMaxX =
      bounds.maxX ?? (bounds.x !== undefined && bounds.w !== undefined ? bounds.x + bounds.w - 1 : undefined);
    const rawMaxY =
      bounds.maxY ?? (bounds.y !== undefined && bounds.h !== undefined ? bounds.y + bounds.h - 1 : undefined);

    if (
      rawMinX === undefined ||
      rawMinY === undefined ||
      rawMaxX === undefined ||
      rawMaxY === undefined
    ) {
      return null;
    }

    const minX = Math.max(0, Math.floor(rawMinX));
    const minY = Math.max(0, Math.floor(rawMinY));
    const maxX = Math.min(width - 1, Math.floor(rawMaxX));
    const maxY = Math.min(height - 1, Math.floor(rawMaxY));

    if (maxX < minX || maxY < minY) return null;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    } as NormalizedGridBounds;
  }
}
