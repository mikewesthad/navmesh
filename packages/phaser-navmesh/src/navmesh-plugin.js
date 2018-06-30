import Phaser from "phaser";
import NavMesh from "navmesh/src"; // import the source - not the dist - no need to double build

/**
 * This class can create navigation meshes for use in Phaser. The navmeshes can be constructed from
 * convex polygons embedded in a Tiled map. The class that conforms to Phaser's plugin structure,
 * but doesn't explicitly require Phaser.
 *
 * @export
 * @class NavMeshPlugin
 */
export default class NavMeshPlugin {
  constructor() {
    this.navMeshes = [];
  }

  /**
   * Load a navmesh from Tiled and switch it to be the current navmesh. Currently assumes that the
   * polygons are squares!
   *
   * @param {Phaser.Tilemaps.Tilemap} tilemap The tilemap that contains polygons under an object
   * layer
   * @param {string} layerName The name of the object layer in the tilemap
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been shrunk
   * around obstacles (a.k.a the amount obstacles have been expanded)
   *
   * @memberof NavMeshPlugin
   */
  buildMeshFromTiled(tilemap, layerName, meshShrinkAmount = 0) {
    const objectLayer = tilemap.getObjectLayer(layerName);
    if (!objectLayer) {
      console.warn(
        `NavMeshPlugin: The given tilemap has no object layer with the name "${layerName}"`
      );
    } else if (objectLayer.length === 0) {
      console.warn(
        `NavMeshPlugin: The "${layerName}" object layer in the Tilemap has 0 objects in it`
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
      // return new Phaser.Geom.Polygon([[left, top], [left, bottom], [right, bottom], [right, top]]);
    });

    // Build the navmesh
    const mesh = new NavMesh(polygons, meshShrinkAmount);
    this.navMeshes.push(mesh);
    return mesh;
  }

  /**
   * Register the plugin with the Phaser.Scene as "NavMeshPlugin" and make it accessible as
   * `this.navMesh` and `this.sys.navMesh` under the scene.
   *
   * @static
   * @param {Phaser.Plugins.PluginManager} pluginManager
   * @memberof NavMeshPlugin
   */
  static register(pluginManager) {
    pluginManager.register("NavMeshPlugin", NavMeshPlugin, "navMesh");
  }

  // TODO: hook into this for destroying
  boot() {
    // const eventEmitter = this.systems.events;
    // eventEmitter.on("destroy", this.destroy, this);
  }

  // Required by the Phaser PluginManager, but noop in this plugin
  init() {}
  start() {}

  shutdown() {}
  destroy() {
    this.navMeshes.forEach(mesh => mesh.destroy());
    this.navMeshes = [];
  }
}

// TODO: integrate old code that automatically decomposed maps via triangulation
// // const triangulate = require("./triangulate");
//   // /**
//   //  * Build a navmesh from an array of convex polygons. This currently tesselates the polygons into
//   //  * triangles. They aren't as efficient or as well designed as ones made by hand in Tiled.
//   //  *
//   //  * @param {string} levelName The key to use to store the navmesh in the plugin
//   //  * @param {[]} hulls An array of convex polygons describing the obstacles in the
//   //  * level. See lighting-plugin/hull-from-tiles.
//   //  *
//   //  * @memberof NavMeshPlugin
//   //  */
//   // buildMesh(levelName, hulls) {
//   //     const contours = this._buildContours(hulls);
//   //     // Get an array of triangulated vertices
//   //     const triangles = triangulate(contours, false); // Counter-clockwise ordering!
//   //     const polygons = [];
//   //     for (let i = 0; i < triangles.length; i += 6) {
//   //         const poly = new Phaser.Polygon(
//   //             // These should be in counter-clockwise order from triangulate
//   //             triangles[i + 0], triangles[i + 1],
//   //             triangles[i + 2], triangles[i + 3],
//   //             triangles[i + 4], triangles[i + 5]
//   //         );
//   //         polygons.push(poly);
//   //     }
//   //     const navMesh = new NavMesh(this.game, polygons);
//   //     this._navMeshes[levelName] = navMesh;
//   //     this._currentNavMesh = navMesh;
//   // }

//   // /**
//   //  * @param {[]} hulls
//   //  * @returns
//   //  *
//   //  * @memberof NavMeshPlugin
//   //  */
//   // _buildContours(hulls) {
//   //     const w = this.game.width;
//   //     const h = this.game.height;
//   //     // Start the contours
//   //     const contours = [
//   //         // Full screen - counter clockwise
//   //         Float32Array.of(0,0, 0,h, w,h, w,0)
//   //     ];
//   //     // For each convex hull add the contour
//   //     for (const hull of hulls) {
//   //         const contour = [];
//   //         for (const lineInfo of hull) {
//   //             contour.push(lineInfo.line.start.x, lineInfo.line.start.y);
//   //         }
//   //         contours.push(Float32Array.from(contour));
//   //     }
//   //     return contours;
//   // }
// }
