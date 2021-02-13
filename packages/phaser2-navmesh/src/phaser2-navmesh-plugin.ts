import Phaser2NavMesh from "./phaser2-navmesh";
import Phaser from "phaser";

/**
 * This class can create navigation meshes for use in Phaser 2 / Phaser CE. (For Phaser 3, see
 * {@link PhaserNavMeshPlugin}.) The navmeshes can be constructed from convex polygons embedded in a
 * Tiled map. The class that conforms to Phaser 2's plugin structure.
 */
export default class Phaser2NavMeshPlugin extends Phaser.Plugin {
  private phaserNavMeshes: Record<string, Phaser2NavMesh> = {};

  constructor(game: Phaser.Game, pluginManager: Phaser.PluginManager) {
    super(game, pluginManager);
  }

  /** Destroy all navmeshes created and the plugin itself. */
  destroy() {
    const meshes = Object.values(this.phaserNavMeshes);
    this.phaserNavMeshes = {};
    meshes.forEach((m) => m.destroy());
  }

  /**
   * Remove the navmesh stored under the given key from the plugin. This does not destroy the
   * navmesh.
   *
   * @param key
   */
  removeMesh(key: string) {
    if (this.phaserNavMeshes[key]) delete this.phaserNavMeshes[key];
  }

  /**
   * Load a navmesh from Tiled. Currently assumes that the polygons are squares! Does not support
   * tilemap layer scaling, rotation or position.
   *
   * @param key Key to use when storing this navmesh within the plugin.
   * @param objectLayer The ObjectLayer from a tilemap that contains
   * the polygons that make up the navmesh.
   * @param The amount (in pixels) that the navmesh has been shrunk
   * around obstacles (a.k.a the amount obstacles have been expanded)
   */
  buildMeshFromTiled(key: string, objectLayer: any[], meshShrinkAmount = 0) {
    if (this.phaserNavMeshes[key]) {
      console.warn(`NavMeshPlugin: a navmesh already exists with the given key: ${key}`);
      return this.phaserNavMeshes[key];
    }

    if (!objectLayer || objectLayer.length === 0) {
      console.warn(
        `NavMeshPlugin: The given tilemap object layer is empty or undefined: ${objectLayer}`
      );
    }

    // Load up the object layer
    const objects = objectLayer || [];

    // Loop over the objects and construct a polygon - assumes a rectangle for now!
    // TODO: support layer position, scale, rotation
    const polygons = objects.map((obj) => {
      const top = obj.y;
      const bottom = obj.y + obj.height;
      const left = obj.x;
      const right = obj.x + obj.width;
      return [
        { x: left, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
        { x: right, y: top },
      ];
    });

    const mesh = new Phaser2NavMesh(this, key, polygons, meshShrinkAmount);

    this.phaserNavMeshes[key] = mesh;

    return mesh;
  }
}
