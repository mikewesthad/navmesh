import Phaser from "phaser";
import PhaserNavMesh from "./phaser-navmesh";

/**
 * This class can create navigation meshes for use in Phaser 3. The navmeshes can be constructed
 * from convex polygons embedded in a Tiled map. The class that conforms to Phaser 3's plugin
 * structure.
 *
 * @export
 * @class PhaserNavMeshPlugin
 */
export default class PhaserNavMeshPlugin extends Phaser.Plugins.ScenePlugin {
  constructor(scene, pluginManager) {
    super(scene, pluginManager);

    this.phaserNavMeshes = {};
    this.scene = scene;
    this.systems = scene.sys;

    if (!scene.sys.settings.isBooted) this.systems.events.once("boot", this.boot, this);
  }

  /**
   * Phaser.Scene lifecycle event
   *
   * @memberof PhaserNavMeshPlugin
   */
  boot() {
    const emitter = this.systems.events;
    emitter.once("destroy", this.destroy, this);
  }

  /**
   * Phaser.Scene lifecycle event - noop in this plugin, but still required.
   *
   * @memberof PhaserNavMeshPlugin
   */
  init() {}

  /**
   * Phaser.Scene lifecycle event - noop in this plugin, but still required.
   *
   * @memberof PhaserNavMeshPlugin
   */
  start() {}

  /**
   * Phaser.Scene lifecycle event - will destroy all navmeshes created.
   *
   * @memberof PhaserNavMeshPlugin
   */
  destroy() {
    this.systems.events.off("boot", this.boot, this);
    Object.values(this.phaserNavMeshes).forEach(m => m.destroy());
    this.phaserNavMeshes = [];
    this.scene = undefined;
    this.systems = undefined;
  }

  /**
   * Destroy a navmesh and remove it from the plugin
   *
   * @param {string} key
   * @memberof PhaserNavMeshPlugin
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
   * @returns {PhaserNavMesh}
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
    const objects = objectLayer ? objectLayer.objects : [];

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
