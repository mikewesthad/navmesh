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

    this.phaserNavMeshes[key] = mesh;

    return mesh;
  }
}
