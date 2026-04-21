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
  private nextPolyId = 0;

  /**
   * @param meshPolygonPoints Array where each element is an array of point-like objects that
   * defines a polygon.
   * @param meshShrinkAmount The amount (in pixels) that the navmesh has been shrunk around
   * obstacles (a.k.a the amount obstacles have been expanded).
   */
  public constructor(meshPolygonPoints: PolyPoints[], meshShrinkAmount = 0) {
    this.meshShrinkAmount = meshShrinkAmount;

    // Convert the PolyPoints[] into NavPoly instances.
    const newPolys = meshPolygonPoints.map((polyPoints) => this.createNavPoly(polyPoints));
    this.navPolygons = newPolys;

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
   * Get a polygon in this navmesh by its id.
   */
  public getPolygonById(id: number) {
    return this.navPolygons.find((poly) => poly.id === id) ?? null;
  }

  /**
   * Add a polygon to the navmesh and rebuild the internal graph.
   */
  public addPolygon(polyPoints: PolyPoints) {
    const [addedPoly] = this.addPolygons([polyPoints]);
    return addedPoly ?? null;
  }

  /**
   * Add multiple polygons to the navmesh and rebuild the internal graph.
   */
  public addPolygons(polyPointsCollection: PolyPoints[]) {
    const newPolys = polyPointsCollection.map((polyPoints) => this.createNavPoly(polyPoints));
    if (newPolys.length === 0) return [];

    this.navPolygons.push(...newPolys);
    this.connectPolygonSet(newPolys, this.navPolygons);
    this.rebuildGraph();

    return newPolys;
  }

  /**
   * Remove a polygon from the navmesh by polygon reference or polygon id.
   */
  public removePolygon(polyOrId: NavPoly | number) {
    const [removedPoly] = this.removePolygons([polyOrId]);
    return removedPoly ?? null;
  }

  /**
   * Remove multiple polygons from the navmesh by polygon reference or polygon id.
   */
  public removePolygons(polysOrIds: Array<NavPoly | number>) {
    const polysToRemove = this.resolveNavPolys(polysOrIds);
    if (polysToRemove.length === 0) return [];

    const removeSet = new Set(polysToRemove);
    polysToRemove.forEach((poly) => this.disconnectPolygon(poly));
    this.navPolygons = this.navPolygons.filter((poly) => !removeSet.has(poly));
    this.rebuildGraph();

    return polysToRemove;
  }

  /**
   * Replace a set of polygons with new polygons and rebuild the internal graph.
   */
  public replacePolygons(polysOrIdsToRemove: Array<NavPoly | number>, polysToAdd: PolyPoints[]) {
    const removedPolys = this.resolveNavPolys(polysOrIdsToRemove);
    const removedSet = new Set(removedPolys);
    const neighborPolys: NavPoly[] = [];
    const seenNeighbors = new Set<NavPoly>();

    removedPolys.forEach((poly) => {
      poly.neighbors.forEach((neighbor) => {
        if (removedSet.has(neighbor) || seenNeighbors.has(neighbor)) return;
        seenNeighbors.add(neighbor);
        neighborPolys.push(neighbor);
      });
    });

    if (removedPolys.length > 0) {
      removedPolys.forEach((poly) => this.disconnectPolygon(poly));
      this.navPolygons = this.navPolygons.filter((poly) => !removedSet.has(poly));
    }

    const mergedNeighborPolys: NavPoly[] = [];
    const addedPolys = this.mergeReplacementPolygons(
      polysToAdd.map((polyPoints) => this.createNavPoly(polyPoints)),
      neighborPolys,
      mergedNeighborPolys
    );
    if (addedPolys.length > 0) {
      this.navPolygons.push(...addedPolys);
      this.connectPolygonSet(addedPolys, this.navPolygons);
    }

    this.rebuildGraph();

    const finalNeighborPolys = neighborPolys.filter((poly) => !mergedNeighborPolys.includes(poly));
    return { removedPolys: removedPolys.concat(mergedNeighborPolys), addedPolys, neighborPolys: finalNeighborPolys };
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
   * Find the closest point in the mesh to the given point. If the point is already in the mesh,
   * this will give you that point. If the point is outside of the mesh, this will attempt to
   * project this point into the mesh (up to the given maxAllowableDist). This returns an object
   * with:
   * - distance - from the given point to the mesh
   * - polygon - the one the point is closest to, or null
   * - point - the point inside the mesh, or null
   * @param point
   * @param maxAllowableDist
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
    this.clearConnections();
    this.connectPolygonSet(this.navPolygons, this.navPolygons);
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

  private rebuildGraph() {
    this.graph.destroy();
    this.graph = new NavGraph(this.navPolygons);
  }

  private createNavPoly(polyPoints: PolyPoints) {
    const vectors = polyPoints.map((p) => new Vector2(p.x, p.y));
    const polygon = new Polygon(vectors);
    const id = this.nextPolyId ?? 0;
    this.nextPolyId = id + 1;
    return new NavPoly(id, polygon);
  }

  private resolveNavPolys(polysOrIds: Array<NavPoly | number>) {
    const resolved: NavPoly[] = [];
    const seen = new Set<NavPoly>();

    for (const entry of polysOrIds) {
      const poly =
        typeof entry === "number"
          ? this.getPolygonById(entry)
          : this.navPolygons.includes(entry)
          ? entry
          : this.getPolygonById(entry.id);
      if (!poly || seen.has(poly)) continue;

      seen.add(poly);
      resolved.push(poly);
    }

    return resolved;
  }

  private clearConnections() {
    for (const poly of this.navPolygons) {
      poly.neighbors = [];
      poly.portals = [];
    }
  }

  private disconnectPolygon(poly: NavPoly) {
    [...poly.neighbors].forEach((neighbor) => this.removeNeighborReference(neighbor, poly));
    poly.neighbors = [];
    poly.portals = [];
  }

  private removeNeighborReference(sourcePoly: NavPoly, targetPoly: NavPoly) {
    for (let i = sourcePoly.neighbors.length - 1; i >= 0; i -= 1) {
      if (sourcePoly.neighbors[i] !== targetPoly) continue;

      sourcePoly.neighbors.splice(i, 1);
      sourcePoly.portals.splice(i, 1);
    }
  }

  private connectPolygonSet(sourcePolys: NavPoly[], candidatePolys: NavPoly[]) {
    const uniqueSources = this.uniquePolys(sourcePolys);
    const uniqueCandidates = this.uniquePolys(candidatePolys);

    uniqueSources.forEach((navPoly) => {
      uniqueCandidates.forEach((otherNavPoly) => {
        this.connectPolygonPair(navPoly, otherNavPoly);
      });
    });
  }

  private uniquePolys(polys: NavPoly[]) {
    const unique: NavPoly[] = [];
    const seen = new Set<NavPoly>();

    polys.forEach((poly) => {
      if (!poly || seen.has(poly)) return;

      seen.add(poly);
      unique.push(poly);
    });

    return unique;
  }

  private connectPolygonPair(navPoly: NavPoly, otherNavPoly: NavPoly) {
    if (!navPoly || !otherNavPoly || navPoly === otherNavPoly) return false;
    if (navPoly.neighbors.includes(otherNavPoly)) return false;

    const d = navPoly.centroid.distance(otherNavPoly.centroid);
    if (d > navPoly.boundingRadius + otherNavPoly.boundingRadius) return false;

    for (const edge of navPoly.edges) {
      for (const otherEdge of otherNavPoly.edges) {
        if (!areCollinear(edge, otherEdge)) continue;

        const overlap = this.getSegmentOverlap(edge, otherEdge);
        if (!overlap) continue;

        navPoly.neighbors.push(otherNavPoly);
        otherNavPoly.neighbors.push(navPoly);
        navPoly.portals.push(this.buildPortal(navPoly, edge, overlap));
        otherNavPoly.portals.push(this.buildPortal(otherNavPoly, otherEdge, overlap));
        return true;
      }
    }

    return false;
  }

  private mergeReplacementPolygons(addedPolys: NavPoly[], neighborPolys: NavPoly[], mergedNeighborPolys: NavPoly[]) {
    const workingAdded = [...addedPolys];

    for (let sourceIndex = 0; sourceIndex < workingAdded.length; sourceIndex += 1) {
      let sourcePoly = workingAdded[sourceIndex];
      let merged = true;

      while (merged) {
        merged = false;
        const candidates = [
          ...neighborPolys.filter((poly) => this.navPolygons.includes(poly)),
          ...workingAdded.filter((_, index) => index !== sourceIndex),
        ];

        for (const candidate of candidates) {
          const mergedPoints = this.getMergedRectanglePoints(sourcePoly, candidate);
          if (!mergedPoints) continue;

          if (this.navPolygons.includes(candidate)) {
            this.disconnectPolygon(candidate);
            this.navPolygons = this.navPolygons.filter((poly) => poly !== candidate);
            mergedNeighborPolys.push(candidate);
          } else {
            const candidateIndex = workingAdded.indexOf(candidate);
            if (candidateIndex >= 0) {
              workingAdded.splice(candidateIndex, 1);
              if (candidateIndex < sourceIndex) sourceIndex -= 1;
            }
          }

          const mergedPoly = this.createNavPoly(mergedPoints);
          workingAdded[sourceIndex] = mergedPoly;
          sourcePoly = mergedPoly;
          merged = true;
          break;
        }
      }
    }

    return workingAdded;
  }

  private getMergedRectanglePoints(polyA: NavPoly, polyB: NavPoly) {
    const rectA = this.getRectangleBounds(polyA);
    const rectB = this.getRectangleBounds(polyB);
    if (!rectA || !rectB) return null;

    if (
      this.areNumbersEqual(rectA.minY, rectB.minY) &&
      this.areNumbersEqual(rectA.maxY, rectB.maxY) &&
      (this.areNumbersEqual(rectA.maxX, rectB.minX) || this.areNumbersEqual(rectB.maxX, rectA.minX))
    ) {
      return this.createRectanglePoints(
        Math.min(rectA.minX, rectB.minX),
        rectA.minY,
        Math.max(rectA.maxX, rectB.maxX),
        rectA.maxY
      );
    }

    if (
      this.areNumbersEqual(rectA.minX, rectB.minX) &&
      this.areNumbersEqual(rectA.maxX, rectB.maxX) &&
      (this.areNumbersEqual(rectA.maxY, rectB.minY) || this.areNumbersEqual(rectB.maxY, rectA.minY))
    ) {
      return this.createRectanglePoints(
        rectA.minX,
        Math.min(rectA.minY, rectB.minY),
        rectA.maxX,
        Math.max(rectA.maxY, rectB.maxY)
      );
    }

    return null;
  }

  private getRectangleBounds(poly: NavPoly) {
    const points = poly.getPoints();
    if (points.length !== 4) return null;

    const xs = [...new Set(points.map((point) => point.x))].sort((a, b) => a - b);
    const ys = [...new Set(points.map((point) => point.y))].sort((a, b) => a - b);
    if (xs.length !== 2 || ys.length !== 2) return null;

    return { minX: xs[0], maxX: xs[1], minY: ys[0], maxY: ys[1] };
  }

  private createRectanglePoints(minX: number, minY: number, maxX: number, maxY: number) {
    return [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: maxX, y: maxY },
      { x: minX, y: maxY },
    ];
  }

  private areNumbersEqual(a: number, b: number) {
    return Math.abs(a - b) <= 0.000001;
  }

  private buildPortal(navPoly: NavPoly, edge: Line, overlap: Vector2[]) {
    const [p1, p2] = overlap;
    const edgeStartAngle = navPoly.centroid.angle(edge.start);
    const a1 = navPoly.centroid.angle(overlap[0]);
    const a2 = navPoly.centroid.angle(overlap[1]);
    const d1 = angleDifference(edgeStartAngle, a1);
    const d2 = angleDifference(edgeStartAngle, a2);

    if (d1 < d2) {
      return new Line(p1.x, p1.y, p2.x, p2.y);
    }

    return new Line(p2.x, p2.y, p1.x, p1.y);
  }
}
