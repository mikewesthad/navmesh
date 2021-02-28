import Phaser from "phaser";
import PhaserNavMesh from "./phaser-navmesh";
import { buildPolysFromGridMap } from "navmesh/src/map-parsers";

/**
 * This class can create navigation meshes for use in Phaser 3. The navmeshes can be constructed
 * from convex polygons embedded in a Tiled map. The class that conforms to Phaser 3's plugin
 * structure.
 *
 * @export
 * @class PhaserNavMeshPlugin
 */
export default class PhaserNavMeshPlugin extends Phaser.Plugins.ScenePlugin {
  private phaserNavMeshes: Record<string, PhaserNavMesh> = {};

  public constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager) {
    super(scene, pluginManager);
  }

  /** Phaser.Scene lifecycle event */
  public boot() {
    const emitter = this.systems.events;
    emitter.once("destroy", this.destroy, this);
  }

  /** Phaser.Scene lifecycle event - noop in this plugin, but still required. */
  public init() {}

  /** Phaser.Scene lifecycle event - noop in this plugin, but still required.*/
  public start() {}

  /** Phaser.Scene lifecycle event - will destroy all navmeshes created. */
  public destroy() {
    this.systems.events.off("boot", this.boot, this);
    this.removeAllMeshes();
  }

  /**
   * Remove all the meshes from the navmesh.
   */
  public removeAllMeshes() {
    const meshes = Object.values(this.phaserNavMeshes);
    this.phaserNavMeshes = {};
    meshes.forEach((m) => m.destroy());
  }

  /**
   * Remove the navmesh stored under the given key from the plugin. This does not destroy the
   * navmesh.
   * @param key
   */
  public removeMesh(key: string) {
    if (this.phaserNavMeshes[key]) delete this.phaserNavMeshes[key];
  }

  /**
   * This method attempts to automatically build a navmesh based on the give tilemap and tilemap
   * layer(s). It attempts to respect the x/y position and scale of the layer(s). Important note: it
   * doesn't support rotation/flip or multiple layers that have different positions/scales.
   *
   * @param key Key to use when storing this navmesh within the plugin.
   * @param tilemap The tilemap to use for building the navmesh.
   * @param tilemapLayers An optional array of tilemap layers to use for building the mesh.
   * @param isWalkable An optional function to use to test if a tile is walkable. Defaults to
   * assuming non-colliding tiles are walkable.
   */
  public buildMeshFromTilemap(
    key: string,
    tilemap: Phaser.Tilemaps.Tilemap,
    tilemapLayers?: Phaser.Tilemaps.TilemapLayer[],
    isWalkable?: (tile: Phaser.Tilemaps.Tile) => boolean
  ) {
    // TODO: factor in shrink

    // Use all layers in map, or just the specified ones.
    const dataLayers = tilemapLayers ? tilemapLayers.map((tl) => tl.layer) : tilemap.layers;
    if (!isWalkable) isWalkable = (tile: Phaser.Tilemaps.Tile) => !tile.collides;

    let offsetX = 0;
    let offsetY = 0;
    let scaleX = 1;
    let scaleY = 1;

    // Attempt to set position offset and scale from the 1st tilemap layer given.
    if (tilemapLayers) {
      const layer = tilemapLayers[0];
      offsetX = layer.tileToWorldX(0);
      offsetY = layer.tileToWorldY(0);
      scaleX = layer.scaleX;
      scaleY = layer.scaleY;

      // Check and warn for layer settings that will throw off the calculation.
      for (const layer of tilemapLayers) {
        if (
          offsetX !== layer.tileToWorldX(0) ||
          offsetY !== layer.tileToWorldY(0) ||
          scaleX !== layer.scaleX ||
          scaleY !== layer.scaleY
        ) {
          console.warn(
            `PhaserNavMeshPlugin: buildMeshFromTilemap reads position & scale from the 1st TilemapLayer. Layer index ${layer.layerIndex} has a different position & scale from the 1st TilemapLayer.`
          );
        }
        if (layer.rotation !== 0) {
          console.warn(
            `PhaserNavMeshPlugin: buildMeshFromTilemap doesn't support TilemapLayer with rotation. Layer index ${layer.layerIndex} is rotated.`
          );
        }
      }
    }

    // Check and warn about DataLayer that have x/y position from Tiled. In the future, these could
    // be supported if A) only one colliding layer is offset, or B) the offset is a multiple of the
    // tile size.
    dataLayers.forEach((layer) => {
      if (layer.x !== 0 || layer.y !== 0) {
        console.warn(
          `PhaserNavMeshPlugin: buildMeshFromTilemap doesn't support layers with x/y positions from Tiled.`
        );
      }
    });

    // Build 2D array of walkable tiles across all given layers.
    const walkableAreas: boolean[][] = [];
    for (let tx = 0; tx < tilemap.width; tx += 1) {
      const row: boolean[] = [];
      for (let ty = 0; ty < tilemap.height; ty += 1) {
        let walkable = true;
        for (const layer of dataLayers) {
          const tile = layer.data[ty][tx];
          if (tile && !isWalkable(tile)) {
            walkable = false;
            break;
          }
        }
        row.push(walkable);
      }
      walkableAreas.push(row);
    }

    let polygons = buildPolysFromGridMap(walkableAreas, tilemap.tileWidth, tilemap.tileHeight);

    // Offset and scale each polygon if necessary.
    if (scaleX !== 1 && scaleY !== 1 && offsetX !== 0 && offsetY !== 0) {
      polygons = polygons.map((poly) =>
        poly.map((p) => ({ x: p.x * scaleX + offsetX, y: p.y * scaleY + offsetY }))
      );
    }

    const mesh = new PhaserNavMesh(this, this.scene, key, polygons, 0);
    this.phaserNavMeshes[key] = mesh;

    return mesh;
  }

  /**
   * Load a navmesh from Tiled. Currently assumes that the polygons are squares! Does not support
   * tilemap layer scaling, rotation or position.
   * @param key Key to use when storing this navmesh within the plugin.
   * @param objectLayer The ObjectLayer from a tilemap that contains the polygons that make up the
   * navmesh.
   * @param meshShrinkAmount The amount (in pixels) that the navmesh has been shrunk around
   * obstacles (a.k.a the amount obstacles have been expanded)
   */
  public buildMeshFromTiled(
    key: string,
    objectLayer: Phaser.Tilemaps.ObjectLayer,
    meshShrinkAmount = 0
  ) {
    if (this.phaserNavMeshes[key]) {
      console.warn(`NavMeshPlugin: a navmesh already exists with the given key: ${key}`);
      return this.phaserNavMeshes[key];
    }

    if (!objectLayer || objectLayer.objects.length === 0) {
      console.warn(
        `NavMeshPlugin: The given tilemap object layer is empty or undefined: ${objectLayer}`
      );
    }

    const objects = objectLayer.objects ?? [];

    // Loop over the objects and construct a polygon - assumes a rectangle for now!
    // TODO: support layer position, scale, rotation
    const polygons = objects.map((obj) => {
      const h = obj.height ?? 0;
      const w = obj.width ?? 0;
      const left = obj.x ?? 0;
      const top = obj.y ?? 0;
      const bottom = top + h;
      const right = left + w;
      return [
        { x: left, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
        { x: right, y: top },
      ];
    });

    const mesh = new PhaserNavMesh(this, this.scene, key, polygons, meshShrinkAmount);
    console.log(polygons.length);

    this.phaserNavMeshes[key] = mesh;

    return mesh;
  }
}
