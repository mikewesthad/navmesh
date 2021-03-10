export type TileWalkableTest<TileType> = (tile: TileType, x: number, y: number) => boolean;

export class GridMap<TileType> {
  public readonly width;
  public readonly height;
  public readonly tileWidth: number;
  public readonly tileHeight: number;
  private map: TileType[][];
  private isWalkableTest: TileWalkableTest<TileType>;

  public constructor(
    map: TileType[][],
    isWalkable: TileWalkableTest<TileType>,
    tileWidth: number,
    tileHeight: number
  ) {
    this.map = map;
    this.isWalkableTest = isWalkable;
    this.height = map.length;
    this.width = map[0].length;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  public forEach(fn: (x: number, y: number, tile: TileType) => void) {
    this.map.forEach((row, y) => {
      row.forEach((col, x) => {
        fn(x, y, this.map[y][x]);
      });
    });
  }

  public isInGrid(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public isWalkable(x: number, y: number) {
    return this.isInGrid(x, y) && this.isWalkableTest(this.map[y][x], x, y);
  }

  public isBlocked(x: number, y: number) {
    return this.isInGrid(x, y) && !this.isWalkableTest(this.map[y][x], x, y);
  }

  public isBlockedAtWorld(worldX: number, worldY: number) {
    return this.isBlocked(this.getGridX(worldX), this.getGridY(worldY));
  }

  public getGridX(worldX: number) {
    return Math.floor(worldX / this.tileWidth);
  }

  public getGridY(worldY: number) {
    return Math.floor(worldY / this.tileHeight);
  }

  public getGridXY(worldX: number, worldY: number) {
    return { x: this.getGridX(worldX), y: this.getGridY(worldY) };
  }

  public getWorldX(gridX: number) {
    return gridX * this.tileWidth;
  }

  public getWorldY(gridY: number) {
    return gridY * this.tileHeight;
  }

  public getWorldXY(gridX: number, gridY: number) {
    return { x: this.getWorldX(gridX), y: this.getWorldY(gridY) };
  }
}
