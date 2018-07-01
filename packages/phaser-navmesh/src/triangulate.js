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
