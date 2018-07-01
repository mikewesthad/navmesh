import Phaser2NavMesh from "./phaser2-navmesh";

/**
 * This class can create navigation meshes for use in Phaser 2 / Phaser CE. (For Phaser 3, see
 * {@link PhaserNavMeshPlugin}.) The navmeshes can be constructed from convex polygons embedded in a
 * Tiled map. The class that conforms to Phaser 2's plugin structure.
 *
 * @export
 * @class Phaser2NavMeshPlugin
 */
export default class Phaser2NavMeshPlugin extends Phaser.Plugin {
  constructor(game, pluginManager) {
    super(game, pluginManager);

    this.phaserNavMeshes = {};
  }

  /**
   * Destroy all navmeshes created and the plugin itself
   *
   * @memberof Phaser2NavMeshPlugin
   */
  destroy() {
    const meshes = Object.values(this.phaserNavMeshes);
    this.phaserNavMeshes = [];
    meshes.forEach(m => m.destroy());
    this.game = undefined;
  }

  /**
   * Destroy a navmesh and remove it from the plugin.
   *
   * @param {string} key
   * @memberof Phaser2NavMeshPlugin
   */
  removeMesh(key) {
    if (this.phaserNavMeshes[key]) {
      this.phaserNavMeshes[key].destroy();
      this.phaserNavMeshes[key] = undefined;
    }
  }

  /**
   * Load a navmesh from Tiled. Currently assumes that the polygons are squares! Does not support
   * tilemap layer scaling, rotation or position.
   *
   * @param {string} key Key to use when storign this navmesh within the plugin.
   * @param {Phaser.Tilemaps.ObjectLayer} objectLayer The ObjectLayer from a tilemap that contains
   * the polygons that make up the navmesh.
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been shrunk
   * around obstacles (a.k.a the amount obstacles have been expanded)
   * @returns {Phaser2NavMesh}
   * @memberof Phaser2NavMeshPlugin
   */
  buildMeshFromTiled(key, objectLayer, meshShrinkAmount = 0) {
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
    const polygons = objects.map(obj => {
      const top = obj.y;
      const bottom = obj.y + obj.height;
      const left = obj.x;
      const right = obj.x + obj.width;
      return [
        { x: left, y: top },
        { x: left, y: bottom },
        { x: right, y: bottom },
        { x: right, y: top }
      ];
    });

    const mesh = new Phaser2NavMesh(this, key, polygons, meshShrinkAmount);

    this.phaserNavMeshes[key] = mesh;

    return mesh;
  }
}
