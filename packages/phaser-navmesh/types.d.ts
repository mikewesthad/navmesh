declare module 'phaser-navmesh' {
  import Phaser from 'phaser';
  interface IPoint {
    x: number;
    y: number;
  }

  interface IPath extends Array<IPoint> {}
    
  export class PhaserNavmesh {
    findPath(here: IPoint, there: IPoint): IPath;

    debugDrawClear(): void;

    debugDrawPath(path: IPath, color: number): void;

    enableDebug(graphics: Phaser.GameObjects.Graphics): void;
    disableDebug(): void;
  }

  export default class PhaserNavmeshPlugin {
    buildMeshFromTiled(
      key: string,
      objectLayer: Phaser.Tilemaps.ObjectLayer,
      padding: number
    ): PhaserNavmesh;
  }
}
