// const triangulate = require("./triangulate");
import NavMesh from "./nav-mesh";

/**
 * This plugin can create navigation meshes for use in Phaser. The navmeshes can be constructed from
 * convex polygons embedded in a Tiled map. Instantiate this using game.plugins.add(NavMeshPlugin).
 *
 * @param {Phaser.Game} game
 * @param {Phaser.PluginManager} manager
 */
export default class NavMeshPlugin extends Phaser.Plugin {
  constructor(game, manager) {
    super(game, manager);
    this._navMeshes = [];
  }

  /**
   * Load a navmesh from Tiled and switch it to be the current navmesh. Currently assumes that the
   * polygons are squares!
   * 
   * @param {Phaser.Tilemap} tilemap The tilemap that contains polygons under an object layer
   * @param {string} objectKey The name of the object layer in the tilemap
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been
   * shrunk around obstacles (a.k.a the amount obstacles have been expanded)
   * 
   * @memberof NavMeshPlugin
   */
  buildMeshFromTiled(tilemap, objectKey, meshShrinkAmount = 0) {
    if (!tilemap.objects[objectKey]) {
      console.warn(
        `NavMeshPlugin: The given tilemap has no object layer with the name "${objectKey}"`
      );
    } else if (tilemap.objects[objectKey].length === 0) {
      console.warn(
        `NavMeshPlugin: The "${objectKey}" object layer in the Tilemap has 0 objects in it`
      );
    }
    // Load up the object layer
    const rects = tilemap.objects[objectKey] || [];
    // Loop over the objects and construct a polygon
    const polygons = [];
    for (const r of rects) {
      const top = r.y;
      const bottom = r.y + r.height;
      const left = r.x;
      const right = r.x + r.width;
      const poly = new Phaser.Polygon(left, top, left, bottom, right, bottom, right, top);
      polygons.push(poly);
    }
    // Build the navmesh
    const mesh = new NavMesh(this.game, polygons, meshShrinkAmount);
    this._navMeshes.push(mesh);
    return mesh;
  }

  destroy() {
    for (const mesh of this._navMeshes) mesh.destroy();
    this._navMeshes = [];
    super.destroy();
  }

  // /**
  //  * Build a navmesh from an array of convex polygons. This currently tesselates the polygons into
  //  * triangles. They aren't as efficient or as well designed as ones made by hand in Tiled.
  //  *
  //  * @param {string} levelName The key to use to store the navmesh in the plugin
  //  * @param {[]} hulls An array of convex polygons describing the obstacles in the
  //  * level. See lighting-plugin/hull-from-tiles.
  //  *
  //  * @memberof NavMeshPlugin
  //  */
  // buildMesh(levelName, hulls) {
  //     const contours = this._buildContours(hulls);
  //     // Get an array of triangulated vertices
  //     const triangles = triangulate(contours, false); // Counter-clockwise ordering!
  //     const polygons = [];
  //     for (let i = 0; i < triangles.length; i += 6) {
  //         const poly = new Phaser.Polygon(
  //             // These should be in counter-clockwise order from triangulate
  //             triangles[i + 0], triangles[i + 1],
  //             triangles[i + 2], triangles[i + 3],
  //             triangles[i + 4], triangles[i + 5]
  //         );
  //         polygons.push(poly);
  //     }
  //     const navMesh = new NavMesh(this.game, polygons);
  //     this._navMeshes[levelName] = navMesh;
  //     this._currentNavMesh = navMesh;
  // }

  // /**
  //  * @param {[]} hulls
  //  * @returns
  //  *
  //  * @memberof NavMeshPlugin
  //  */
  // _buildContours(hulls) {
  //     const w = this.game.width;
  //     const h = this.game.height;
  //     // Start the contours
  //     const contours = [
  //         // Full screen - counter clockwise
  //         Float32Array.of(0,0, 0,h, w,h, w,0)
  //     ];
  //     // For each convex hull add the contour
  //     for (const hull of hulls) {
  //         const contour = [];
  //         for (const lineInfo of hull) {
  //             contour.push(lineInfo.line.start.x, lineInfo.line.start.y);
  //         }
  //         contours.push(Float32Array.from(contour));
  //     }
  //     return contours;
  // }
}
