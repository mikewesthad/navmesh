import NavMesh from "navmesh/src"; // import the source - not the dist - no need to double build
import Phaser from "phaser";

/**
 *
 */
export default class PhaserNavMesh {
  constructor(plugin, key, meshPoints, meshShrinkAmount = 0) {
    this.key = key;
    this.plugin = plugin;
    this.scene = plugin.scene;
    this.debugGraphics = null;
    this.navMesh = new NavMesh(meshPoints, meshShrinkAmount);
  }

  findPath(startPoint, endPoint, PointClass = Phaser.Geom.Point) {
    const path = this.navMesh.findPath(startPoint, endPoint);
    return path ? path.map(({ x, y }) => new PointClass(x, y)) : path;
  }

  enableDebug(graphics) {
    if (!graphics && !this.debugGraphics) {
      this.debugGraphics = this.scene.add.graphics();
    } else if (graphics) {
      if (this.debugGraphics) this.debugGraphics.destroy();
      this.debugGraphics = graphics;
    }

    this.debugGraphics.visible = true;

    return this.debugGraphics;
  }

  disableDebug() {
    if (this.debugGraphics) this.debugGraphics.visible = false;
  }

  isDebugEnabled() {
    return this.debugGraphics && this.debugGraphics.visible;
  }

  debugDrawClear() {
    if (this.debugGraphics) this.debugGraphics.clear();
  }

  /**
   * Visualize the polygons in the nav mesh as an overlay on top of the game
   *
   * @param {object} options
   * @param {boolean} [options.drawCentroid=true] For each polygon, show the approx centroid
   * @param {boolean} [options.drawBounds=false] For each polygon, show the bounding radius
   * @param {boolean} [options.drawNeighbors=true] For each polygon, show the connections to
   * neighbors
   * @param {boolean} [options.drawPortals=true] For each polygon, show the portal edges
   */
  debugDrawMesh({
    drawCentroid = true,
    drawBounds = false,
    drawNeighbors = true,
    drawPortals = true,
    palette = [0x00a0b0, 0x6a4a3c, 0xcc333f, 0xeb6841, 0xedc951]
  } = {}) {
    if (!this.debugGraphics) return;

    const navPolys = this.navMesh.getPolygons();

    navPolys.forEach(poly => {
      const color = palette[poly.id % palette.length];
      this.debugGraphics.fillStyle(color);
      this.debugGraphics.fillPoints(poly.getPoints(), true);

      if (drawCentroid) {
        this.debugGraphics.fillStyle(0x000000);
        this.debugGraphics.fillCircle(poly.centroid.x, poly.centroid.y, 4);
      }

      if (drawBounds) {
        this.debugGraphics.lineStyle(1, 0xffffff);
        this.debugGraphics.strokeCircle(poly.centroid.x, poly.centroid.y, poly.boundingRadius);
      }

      if (drawNeighbors) {
        this.debugGraphics.lineStyle(2, 0x000000);
        poly.neighbors.forEach(n => {
          this.debugGraphics.lineBetween(
            poly.centroid.x,
            poly.centroid.y,
            n.centroid.x,
            n.centroid.y
          );
        });
      }

      if (drawPortals) {
        this.debugGraphics.lineStyle(10, 0x000000);
        poly.portals.forEach(portal =>
          this.debugGraphics.lineBetween(portal.start.x, portal.start.y, portal.end.x, portal.end.y)
        );
      }
    });
  }

  /**
   * Visualize a path (array of points) on the debug graphics overlay
   *
   * @param {Phaser.Point[]} path
   * @param {number} [color=0x00FF00]
   * @param {number} [thickness=10]
   */
  debugDrawPath(path, color = 0x00ff00, thickness = 10, alpha = 1) {
    if (!this.debugGraphics) return;

    if (path && path.length) {
      // Draw line for path
      this.debugGraphics.lineStyle(thickness, color, alpha);
      this.debugGraphics.strokePoints(path);

      // Draw circle at start and end of path
      this.debugGraphics.fillStyle(color, alpha);
      const d = 1.2 * thickness;
      this.debugGraphics.fillCircle(path[0].x, path[0].y, d, d);

      if (path.length > 1) {
        const lastPoint = path[path.length - 1];
        this.debugGraphics.fillCircle(lastPoint.x, lastPoint.y, d, d);
      }
    }
  }

  destroy() {
    if (this.navMesh) this.navMesh.destroy();
    if (this.debugGraphics) this.debugGraphics.destroy();
    this.plugin.removeMesh(this.key);
    this.navMesh = undefined;
    this.debugGraphics = undefined;
    this.plugin = undefined;
    this.scene = undefined;
  }
}
