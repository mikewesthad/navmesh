// Directly importing the TS version - no need to double bundle.
/// <reference path="../../navmesh/src/javascript-astar.d.ts" />
import NavMesh, { Point, PolyPoints } from "navmesh/src";

import Phaser2NavMeshPlugin from "./phaser2-navmesh-plugin";

/**
 * A wrapper around {@link NavMesh} for Phaser 2 / Phaser CE. Create instances of this class from
 * {@link Phaser2NavMeshPlugin}. This is the workhorse that represents a navigation mesh built from
 * a series of polygons. Once built, the mesh can be asked for a path from one point to another
 * point.
 *
 * Compared to {@link NavMesh}, this adds visual debugging capabilities and converts paths to
 * Phaser-compatible point instances.
 */
export default class Phaser2NavMesh {
  private key: string;
  private plugin: Phaser2NavMeshPlugin;
  private game: Phaser.Game;
  private debugGraphics: Phaser.Graphics | null;
  private navMesh: NavMesh;

  /**
   * Creates an instance of Phaser2NavMesh.
   * @param {Phaser2NavMeshPlugin} plugin The plugin that owns this mesh.
   * @param {string} key The key the mesh is stored under within the plugin.
   * @param {object[][]} meshPolygonPoints Array where each element is an array of point-like
   * objects that defines a polygon.
   * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been shrunk
   * around obstacles (a.k.a the amount obstacles have been expanded)
   * @memberof Phaser2NavMesh
   */
  constructor(
    plugin: Phaser2NavMeshPlugin,
    key: string,
    meshPolygonPoints: PolyPoints[],
    meshShrinkAmount = 0
  ) {
    this.key = key;
    this.plugin = plugin;
    this.game = plugin.game;
    this.debugGraphics = null;
    this.navMesh = new NavMesh(meshPolygonPoints, meshShrinkAmount);
  }

  /**
   * See {@link NavMesh#findPath}. This implements the same functionality, except that the returned
   * path is converted to Phaser-compatible points.
   *
   * @param startPoint A point-like object in the form {x, y}
   * @param endPoint A point-like object in the form {x, y}
   * @param PointClass The point class to use to represent points in the path.
   * @returns An array of points if a path is found, or null if no path
   */
  findPath(startPoint: Point, endPoint: Point, PointClass = Phaser.Point) {
    const path = this.navMesh.findPath(startPoint, endPoint);
    return path ? path.map(({ x, y }) => new PointClass(x, y)) : path;
  }

  /**
   * Enable the debug drawing graphics. If no graphics object is provided, a new instance will be
   * created.
   *
   * @param graphics An optional graphics object for the mesh to use for debug
   * drawing. Note, the mesh will destroy this graphics object when the mesh is destroyed.
   * @returns The graphics object this mesh uses.
   */
  enableDebug(graphics: Phaser.Graphics) {
    if (!graphics && !this.debugGraphics) {
      this.debugGraphics = this.game.add.graphics();
    } else if (graphics) {
      if (this.debugGraphics) this.debugGraphics.destroy();
      this.debugGraphics = graphics;
    }

    if (this.debugGraphics) this.debugGraphics.visible = true;

    return this.debugGraphics;
  }

  /** Hide the debug graphics, but don't destroy it. */
  disableDebug() {
    if (this.debugGraphics) this.debugGraphics.visible = false;
  }

  /** Returns true if the debug graphics object is enabled and visible. */
  isDebugEnabled() {
    return this.debugGraphics && this.debugGraphics.visible;
  }

  /** Clear the debug graphics. */
  debugDrawClear() {
    if (this.debugGraphics) this.debugGraphics.clear();
  }

  /**
   * Visualize the polygons in the navmesh by drawing them to the debug graphics.
   *
   * @param options
   * @param [options.drawCentroid=true] For each polygon, show the approx centroid
   * @param [options.drawBounds=false] For each polygon, show the bounding radius
   * @param [options.drawNeighbors=true] For each polygon, show the connections to neighbors
   * @param [options.drawPortals=true] For each polygon, show the portal edges
   * @param [options.palette=[0x00a0b0, 0x6a4a3c, 0xcc333f, 0xeb6841, 0xedc951]] An array of
   * Phaser-compatible format colors to use when drawing the individual polygons. The first poly
   * uses the first color, the second poly uses the second color, etc.
   */
  debugDrawMesh({
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
      graphics.lineWidth = 0;
      graphics.beginFill(color);
      graphics.drawPolygon(new Phaser.Polygon(...(poly.getPoints() as Phaser.Point[])));
      graphics.endFill();

      if (drawCentroid) {
        graphics.beginFill(0x000000);
        graphics.drawEllipse(poly.centroid.x, poly.centroid.y, 4, 4);
        graphics.endFill();
      }

      if (drawBounds) {
        graphics.lineStyle(1, 0xffffff);
        const r = poly.boundingRadius;
        graphics.drawEllipse(poly.centroid.x, poly.centroid.y, r, r);
      }

      if (drawNeighbors) {
        graphics.lineStyle(2, 0x000000);
        poly.neighbors.forEach((n) => {
          graphics.moveTo(poly.centroid.x, poly.centroid.y);
          graphics.lineTo(n.centroid.x, n.centroid.y);
        });
      }

      if (drawPortals) {
        graphics.lineStyle(10, 0x000000);
        poly.portals.forEach((portal) => {
          graphics.moveTo(portal.start.x, portal.start.y);
          graphics.lineTo(portal.end.x, portal.end.y);
        });
      }
    });
  }

  /**
   * Visualize a path (array of points) on the debug graphics.
   *
   * @param path Array of point-like objects in the form {x, y}
   * @param color
   * @param thickness
   * @param alpha
   */
  debugDrawPath(path: Point[], color = 0x00ff00, thickness = 10, alpha = 1) {
    if (!this.debugGraphics) return;

    if (path && path.length) {
      // Draw line for path
      this.debugGraphics.lineStyle(thickness, color, alpha);
      this.debugGraphics.drawShape(new Phaser.Polygon(...(path as Phaser.Point[])));

      // Draw circle at start and end of path
      this.debugGraphics.beginFill(color, alpha);
      const d = 0.5 * thickness;
      this.debugGraphics.drawEllipse(path[0].x, path[0].y, d, d);
      if (path.length > 1) {
        const lastPoint = path[path.length - 1];
        this.debugGraphics.drawEllipse(lastPoint.x, lastPoint.y, d, d);
      }
      this.debugGraphics.endFill();
    }
  }

  /** Destroy the mesh, kill the debug graphic and unregister itself with the plugin. */
  destroy() {
    if (this.navMesh) this.navMesh.destroy();
    if (this.debugGraphics) this.debugGraphics.destroy();
    this.plugin.removeMesh(this.key);
  }
}
