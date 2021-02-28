import jsastar from "javascript-astar";
import NavPoly from "./navpoly";
import NavGraph from "./navgraph";
import Channel from "./channel";
import { angleDifference, areCollinear, clamp, distanceSquared, projectPointToEdge } from "./utils";
import Vector2 from "./math/vector-2";
import Line from "./math/line";
import Polygon from "./math/polygon";
import { Point, PolyPoints } from "./common-types";

/**
 * The `NavMesh` class is the workhorse that represents a navigation mesh built from a series of
 * polygons. Once built, the mesh can be asked for a path from one point to another point. Some
 * internal terminology usage:
 * - neighbor: a polygon that shares part of an edge with another polygon
 * - portal: when two neighbor's have edges that overlap, the portal is the overlapping line segment
 * - channel: the path of polygons from starting point to end point
 * - pull the string: run the funnel algorithm on the channel so that the path hugs the edges of the
 *   channel. Equivalent to having a string snaking through a hallway and then pulling it taut.
 */
export default class NavMesh {
  private meshShrinkAmount: number;
  private navPolygons: NavPoly[];
  private graph: NavGraph;

  /**
   * @param meshPolygonPoints Array where each element is an array of point-like objects that
   * defines a polygon.
   * @param meshShrinkAmount The amount (in pixels) that the navmesh has been shrunk around
   * obstacles (a.k.a the amount obstacles have been expanded).
   */
  public constructor(meshPolygonPoints: PolyPoints[], meshShrinkAmount = 0) {
    this.meshShrinkAmount = meshShrinkAmount;

    // Convert the PolyPoints[] into NavPoly instances.
    const newPolys = meshPolygonPoints.map((polyPoints) => {
      const vectors = polyPoints.map((p) => new Vector2(p.x, p.y));
      return new Polygon(vectors);
    });
    this.navPolygons = newPolys.map((polygon, i) => new NavPoly(i, polygon));

    this.calculateNeighbors();

    // Astar graph of connections between polygons
    this.graph = new NavGraph(this.navPolygons);
  }

  /**
   * Get the NavPolys that are in this navmesh.
   */
  public getPolygons() {
    return this.navPolygons;
  }

  /**
   * Cleanup method to remove references.
   */
  public destroy() {
    this.graph.destroy();
    for (const poly of this.navPolygons) poly.destroy();
    this.navPolygons = [];
  }

  /**
   * Find if the given point is within any of the polygons in the mesh.
   * @param point
   */
  public isPointInMesh(point: Point) {
    return this.navPolygons.some((navPoly) => navPoly.contains(point));
  }

  /**
   * Find the closest polygon to the given point. If a fudgeAmount is provided, this will be used to
   * find the closest polygon within the fudgeAmount of the point.
   * @param point
   * @param fudgeAmount
   */
  public findClosestMeshPoint(point: Vector2, maxAllowableDist: number = Number.POSITIVE_INFINITY) {
    let minDistance = maxAllowableDist;
    let closestPoly: NavPoly | null = null;
    let pointOnClosestPoly: Point | null = null;
    for (const navPoly of this.navPolygons) {
      // If we are inside a poly, we've got the closest.
      if (navPoly.contains(point)) {
        minDistance = 0;
        closestPoly = navPoly;
        pointOnClosestPoly = point;
        break;
      }
      // Is the poly close enough to warrant a more accurate check? Point is definitely outside of
      // the polygon. Distance - Radius is the smallest possible distance to an edge of the poly.
      // This will underestimate distance, but that's perfectly fine.
      const r = navPoly.boundingRadius;
      const d = navPoly.centroid.distance(point);
      if (d - r < minDistance) {
        const result = this.projectPointToPolygon(point, navPoly);
        if (result.distance < minDistance) {
          minDistance = result.distance;
          closestPoly = navPoly;
          pointOnClosestPoly = result.point;
        }
      }
    }
    return { distance: minDistance, polygon: closestPoly, point: pointOnClosestPoly };
  }

    }
  }

  /**
   * Find a path from the start point to the end point using this nav mesh.
   * @param {object} startPoint A point-like object in the form {x, y}
   * @param {object} endPoint A point-like object in the form {x, y}
   * @returns {Vector2[]|null} An array of points if a path is found, or null if no path
   */
  public findPath(startPoint: Point, endPoint: Point) {
    let startPoly = null;
    let endPoly = null;
    let startDistance = Number.MAX_VALUE;
    let endDistance = Number.MAX_VALUE;
    let d, r;
    const startVector = new Vector2(startPoint.x, startPoint.y);
    const endVector = new Vector2(endPoint.x, endPoint.y);

    // Find the closest poly for the starting and ending point
    for (const navPoly of this.navPolygons) {
      r = navPoly.boundingRadius;
      // Start
      d = navPoly.centroid.distance(startVector);
      if (d <= startDistance && d <= r && navPoly.contains(startVector)) {
        startPoly = navPoly;
        startDistance = d;
      }
      // End
      d = navPoly.centroid.distance(endVector);
      if (d <= endDistance && d <= r && navPoly.contains(endVector)) {
        endPoly = navPoly;
        endDistance = d;
      }
    }

    // If the end point wasn't inside a polygon, run a more liberal check that allows a point
    // to be within meshShrinkAmount radius of a polygon
    if (!endPoly && this.meshShrinkAmount > 0) {
      for (const navPoly of this.navPolygons) {
        r = navPoly.boundingRadius + this.meshShrinkAmount;
        d = navPoly.centroid.distance(endVector);
        if (d <= r) {
          const { distance } = this.projectPointToPolygon(endVector, navPoly);
          if (distance <= this.meshShrinkAmount && distance < endDistance) {
            endPoly = navPoly;
            endDistance = distance;
          }
        }
      }
    }

    // No matching polygons locations for the end, so no path found
    // because start point is valid normally, check end point first
    if (!endPoly) return null;

    // Same check as above, but for the start point
    if (!startPoly && this.meshShrinkAmount > 0) {
      for (const navPoly of this.navPolygons) {
        // Check if point is within bounding circle to avoid extra projection calculations
        r = navPoly.boundingRadius + this.meshShrinkAmount;
        d = navPoly.centroid.distance(startVector);
        if (d <= r) {
          // Check if projected point is within range of a polgyon and is closer than the
          // previous point
          const { distance } = this.projectPointToPolygon(startVector, navPoly);
          if (distance <= this.meshShrinkAmount && distance < startDistance) {
            startPoly = navPoly;
            startDistance = distance;
          }
        }
      }
    }

    // No matching polygons locations for the start, so no path found
    if (!startPoly) return null;

    // If the start and end polygons are the same, return a direct path
    if (startPoly === endPoly) return [startVector, endVector];

    // Search!
    const astarPath = jsastar.astar.search(this.graph, startPoly, endPoly, {
      heuristic: this.graph.navHeuristic,
    });

    // While the start and end polygons may be valid, no path between them
    if (astarPath.length === 0) return null;

    // jsastar drops the first point from the path, but the funnel algorithm needs it
    astarPath.unshift(startPoly);

    // We have a path, so now time for the funnel algorithm
    const channel = new Channel();
    channel.push(startVector);
    for (let i = 0; i < astarPath.length - 1; i++) {
      const navPolygon = astarPath[i];
      const nextNavPolygon = astarPath[i + 1];

      // Find the portal
      let portal = null;
      for (let i = 0; i < navPolygon.neighbors.length; i++) {
        if (navPolygon.neighbors[i].id === nextNavPolygon.id) {
          portal = navPolygon.portals[i];
        }
      }
      if (!portal) throw new Error("Path was supposed to be found, but portal is missing!");

      // Push the portal vertices into the channel
      channel.push(portal.start, portal.end);
    }
    channel.push(endVector);

    // Pull a string along the channel to run the funnel
    channel.stringPull();

    // Clone path, excluding duplicates
    let lastPoint = null;
    const phaserPath = [];
    for (const p of channel.path) {
      const newPoint = p.clone();
      if (!lastPoint || !newPoint.equals(lastPoint)) phaserPath.push(newPoint);
      lastPoint = newPoint;
    }

    return phaserPath;
  }

  private calculateNeighbors() {
    // Fill out the neighbor information for each navpoly
    for (let i = 0; i < this.navPolygons.length; i++) {
      const navPoly = this.navPolygons[i];

      for (let j = i + 1; j < this.navPolygons.length; j++) {
        const otherNavPoly = this.navPolygons[j];

        // Check if the other navpoly is within range to touch
        const d = navPoly.centroid.distance(otherNavPoly.centroid);
        if (d > navPoly.boundingRadius + otherNavPoly.boundingRadius) continue;

        // The are in range, so check each edge pairing
        for (const edge of navPoly.edges) {
          for (const otherEdge of otherNavPoly.edges) {
            // If edges aren't collinear, not an option for connecting navpolys
            if (!areCollinear(edge, otherEdge)) continue;

            // If they are collinear, check if they overlap
            const overlap = this.getSegmentOverlap(edge, otherEdge);
            if (!overlap) continue;

            // Connections are symmetric!
            navPoly.neighbors.push(otherNavPoly);
            otherNavPoly.neighbors.push(navPoly);

            // Calculate the portal between the two polygons - this needs to be in
            // counter-clockwise order, relative to each polygon
            const [p1, p2] = overlap;
            let edgeStartAngle = navPoly.centroid.angle(edge.start);
            let a1 = navPoly.centroid.angle(overlap[0]);
            let a2 = navPoly.centroid.angle(overlap[1]);
            let d1 = angleDifference(edgeStartAngle, a1);
            let d2 = angleDifference(edgeStartAngle, a2);
            if (d1 < d2) {
              navPoly.portals.push(new Line(p1.x, p1.y, p2.x, p2.y));
            } else {
              navPoly.portals.push(new Line(p2.x, p2.y, p1.x, p1.y));
            }

            edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.start);
            a1 = otherNavPoly.centroid.angle(overlap[0]);
            a2 = otherNavPoly.centroid.angle(overlap[1]);
            d1 = angleDifference(edgeStartAngle, a1);
            d2 = angleDifference(edgeStartAngle, a2);
            if (d1 < d2) {
              otherNavPoly.portals.push(new Line(p1.x, p1.y, p2.x, p2.y));
            } else {
              otherNavPoly.portals.push(new Line(p2.x, p2.y, p1.x, p1.y));
            }

            // Two convex polygons shouldn't be connected more than once! (Unless
            // there are unnecessary vertices...)
          }
        }
      }
    }
  }

  // Check two collinear line segments to see if they overlap by sorting the points.
  // Algorithm source: http://stackoverflow.com/a/17152247
  private getSegmentOverlap(line1: Line, line2: Line) {
    const points = [
      { line: line1, point: line1.start },
      { line: line1, point: line1.end },
      { line: line2, point: line2.start },
      { line: line2, point: line2.end },
    ];
    points.sort(function (a, b) {
      if (a.point.x < b.point.x) return -1;
      else if (a.point.x > b.point.x) return 1;
      else {
        if (a.point.y < b.point.y) return -1;
        else if (a.point.y > b.point.y) return 1;
        else return 0;
      }
    });
    // If the first two points in the array come from the same line, no overlap
    const noOverlap = points[0].line === points[1].line;
    // If the two middle points in the array are the same coordinates, then there is a
    // single point of overlap.
    const singlePointOverlap = points[1].point.equals(points[2].point);
    if (noOverlap || singlePointOverlap) return null;
    else return [points[1].point, points[2].point];
  }

  /**
   * Project a point onto a polygon in the shortest distance possible.
   *
   * @param {Phaser.Point} point The point to project
   * @param {NavPoly} navPoly The navigation polygon to test against
   * @returns {{point: Phaser.Point, distance: number}}
   */
  private projectPointToPolygon(point: Vector2, navPoly: NavPoly) {
    let closestProjection = null;
    let closestDistance = Number.MAX_VALUE;
    for (const edge of navPoly.edges) {
      const projectedPoint = projectPointToEdge(point, edge);
      const d = point.distance(projectedPoint);
      if (closestProjection === null || d < closestDistance) {
        closestDistance = d;
        closestProjection = projectedPoint;
      }
    }
    return { point: closestProjection, distance: closestDistance };
  }
}
