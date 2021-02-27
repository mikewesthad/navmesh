// Directly importing the TS version - no need to double bundle.
/// <reference path="../../navmesh/src/javascript-astar.d.ts" />
import NavMesh, { Point, PolyPoints } from "navmesh/src";

import Phaser from "phaser";
import PhaserNavMeshPlugin from "./phaser-navmesh-plugin";

/**
 * A wrapper around {@link NavMesh} for Phaser 3. Create instances of this class from
 * {@link PhaserNavMeshPlugin}. This is the workhorse that represents a navigation mesh built from a
 * series of polygons. Once built, the mesh can be asked for a path from one point to another point.
 *
 * Compared to {@link NavMesh}, this adds visual debugging capabilities and converts paths to
 * Phaser-compatible point instances.
 *
 * @export
 * @class PhaserNavMesh
 */
export default class PhaserNavMesh {
  private key: string;
  private plugin: PhaserNavMeshPlugin;
  private scene: Phaser.Scene;
  private debugGraphics: Phaser.GameObjects.Graphics | null;
  private navMesh: NavMesh;

  /**
   * Creates an instance of PhaserNavMesh.
   * @param plugin The plugin that owns this mesh.
   * @param scene
   * @param key The key the mesh is stored under within the plugin.
   * @param meshPolygonPoints Array where each element is an array of point-like objects that
   * defines a polygon.
   * @param meshShrinkAmount The amount (in pixels) that the navmesh has been shrunk around
   * obstacles (a.k.a the amount obstacles have been expanded)
   */
  public constructor(
    plugin: PhaserNavMeshPlugin,
    scene: Phaser.Scene,
    key: string,
    meshPolygonPoints: PolyPoints[],
    meshShrinkAmount = 0
  ) {
    this.key = key;
    this.plugin = plugin;
    this.scene = scene;
    this.debugGraphics = null;
    this.navMesh = new NavMesh(meshPolygonPoints, meshShrinkAmount);
  }

  /**
   * Find if the given point is within any of the polygons in the mesh.
   * @param point
   */
  public isPointInMesh(point: Point) {
    return this.navMesh.isPointInMesh(point);
  }

  /**
   * See {@link NavMesh#findPath}. This implements the same functionality, except that the returned
   * path is converted to Phaser-compatible points.
   * @param startPoint A point-like object
   * @param endPoint A point-like object
   * @param PointClass The class used to represent points in the final path
   * @returns An array of points if a path is found, or null if no path
   */
  public findPath(startPoint: Point, endPoint: Point, PointClass = Phaser.Geom.Point) {
    const path = this.navMesh.findPath(startPoint, endPoint);
    return path ? path.map(({ x, y }) => new PointClass(x, y)) : path;
  }

  /**
   * Enable the debug drawing graphics. If no graphics object is provided, a new instance will be
   * created.
   * @param graphics An optional graphics object for the mesh to use for debug drawing. Note, the
   * mesh will destroy this graphics object when the mesh is destroyed.
   * @returns The graphics object this mesh uses.
   */
  public enableDebug(graphics: Phaser.GameObjects.Graphics) {
    if (!graphics && !this.debugGraphics) {
      this.debugGraphics = this.scene.add.graphics();
    } else if (graphics) {
      if (this.debugGraphics) this.debugGraphics.destroy();
      this.debugGraphics = graphics;
    }

    this.debugGraphics!.visible = true;

    return this.debugGraphics;
  }

  /** Hide the debug graphics, but don't destroy it. */
  public disableDebug() {
    if (this.debugGraphics) this.debugGraphics.visible = false;
  }

  /** Returns true if the debug graphics object is enabled and visible. */
  public isDebugEnabled() {
    return this.debugGraphics && this.debugGraphics.visible;
  }

  /** Clear the debug graphics. */
  public debugDrawClear() {
    if (this.debugGraphics) this.debugGraphics.clear();
  }

  /**
   * Visualize the polygons in the navmesh by drawing them to the debug graphics.
   * @param options
   * @param [options.drawCentroid=true] For each polygon, show the approx centroid
   * @param [options.drawBounds=false] For each polygon, show the bounding radius
   * @param [options.drawNeighbors=true] For each polygon, show the connections to neighbors
   * @param [options.drawPortals=true] For each polygon, show the portal edges
   * @param [options.palette=[0x00a0b0, 0x6a4a3c, 0xcc333f, 0xeb6841, 0xedc951]] An array of
   * Phaser-compatible format colors to use when drawing the individual polygons. The first poly
   * uses the first color, the second poly uses the second color, etc.
   */
  public debugDrawMesh({
    drawCentroid = true,
    drawBounds = false,
    drawNeighbors = true,
    drawPortals = true,
    palette = [0x00a0b0, 0x6a4a3c, 0xcc333f, 0xeb6841, 0xedc951],
  } = {}) {
    if (!this.debugGraphics) return;

    const graphics = this.debugGraphics;
    const navPolys = this.navMesh.getPolygons();

    navPolys.forEach((poly) => {
      const color = palette[poly.id % palette.length];
      graphics.fillStyle(color);
      graphics.fillPoints(poly.getPoints(), true);

      if (drawCentroid) {
        graphics.fillStyle(0x000000);
        graphics.fillCircle(poly.centroid.x, poly.centroid.y, 4);
      }

      if (drawBounds) {
        graphics.lineStyle(1, 0xffffff);
        graphics.strokeCircle(poly.centroid.x, poly.centroid.y, poly.boundingRadius);
      }

      if (drawNeighbors) {
        graphics.lineStyle(2, 0x000000);
        poly.neighbors.forEach((n) => {
          graphics.lineBetween(poly.centroid.x, poly.centroid.y, n.centroid.x, n.centroid.y);
        });
      }

      if (drawPortals) {
        graphics.lineStyle(10, 0x000000);
        poly.portals.forEach((portal) =>
          graphics.lineBetween(portal.start.x, portal.start.y, portal.end.x, portal.end.y)
        );
      }
    });
  }

  /**
   * Visualize a path (array of points) on the debug graphics.
   * @param path Array of point-like objects in the form {x, y}
   * @param color
   * @param thickness
   * @param alpha
   */
  public debugDrawPath(path: Point[], color = 0x00ff00, thickness = 10, alpha = 1) {
    if (!this.debugGraphics) return;

    if (path && path.length) {
      // Draw line for path
      this.debugGraphics.lineStyle(thickness, color, alpha);
      this.debugGraphics.strokePoints(path);

      // Draw circle at start and end of path
      this.debugGraphics.fillStyle(color, alpha);
      const d = 1.2 * thickness;
      this.debugGraphics.fillCircle(path[0].x, path[0].y, d);

      if (path.length > 1) {
        const lastPoint = path[path.length - 1];
        this.debugGraphics.fillCircle(lastPoint.x, lastPoint.y, d);
      }
    }
  }

  /** Destroy the mesh, kill the debug graphic and unregister itself with the plugin. */
  public destroy() {
    if (this.navMesh) this.navMesh.destroy();
    if (this.debugGraphics) this.debugGraphics.destroy();
    this.plugin.removeMesh(this.key);
  }
}
