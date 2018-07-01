import PhaserNavMesh from "./phaser-navmesh";

/**
 * This class can create navigation meshes for use in Phaser. The navmeshes can be constructed from
 * convex polygons embedded in a Tiled map. The class that conforms to Phaser's plugin structure.
 *
 * @export
 * @class NavMeshPlugin
 */
export default class PhaserNavMeshPlugin extends Phaser.Plugin {
  constructor(game, pluginManager) {
    super(game, pluginManager);

    this.phaserNavMeshes = {};
  }

  destroy() {
    this.systems.events.Object.values(this.phaserNavMeshes).forEach(m => m.destroy());
    this.phaserNavMeshes = [];
    this.game = undefined;
  }

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
   * @param {string} key Key to store this navmesh under within the plugin
   * @param {Phaser.Tilemaps.Tilemap} tilemap The tilemap that contains polygons under an object
   * layer
   * @param {string} layerName The name of the object layer in the tilemap
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been shrunk
   * around obstacles (a.k.a the amount obstacles have been expanded)
   *
   * @memberof PhaserNavMeshPlugin
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

    const mesh = new PhaserNavMesh(this, key, polygons, meshShrinkAmount);

    this.phaserNavMeshes[key] = mesh;

    return mesh;
  }
}
