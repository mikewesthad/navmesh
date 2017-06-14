import jsastar from "javascript-astar";
import NavPoly from "./nav-poly";
import NavGraph from "./nav-graph";
import Channel from "./channel";
import {angleDifference, areCollinear} from "./utils";

/**
 * The workhorse that builds a navigation mesh from a series of polygons. Once built, the mesh can
 * be asked for a path from one point to another point. It has debug methods for visualizing paths
 * and visualizing the individual polygons. Some internal terminology usage:
 * 
 * - neighbor: a polygon that shares part of an edge with another polygon
 * - portal: when two neighbor's have edges that overlap, the portal is the overlapping line segment
 * - channel: the path of polygons from starting point to end point
 * - pull the string: run the funnel algorithm on the channel so that the path hugs the edges of the
 *   channel. Equivalent to having a string snaking through a hallway and then pulling it taut
 * 
 * @class NavMesh
 */
class NavMesh {

    /**
     * Creates an instance of NavMesh.
     * @param {Phaser.Game} game
     * @param {Phaser.Polygon[]} polygons
     * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been
     * shrunk around obstacles (a.k.a the amount obstacles have been expanded)
     *
     * @memberof NavMesh
     */
    constructor(game, polygons, meshShrinkAmount = 0) {
        this.game = game;
        this._debugGraphics = null;
        this._meshShrinkAmount = meshShrinkAmount;

        // Construct NavPoly instances for each polygon
        this._navPolygons = [];
        for (const [i, polygon] of polygons.entries()) {
            this._navPolygons.push(new NavPoly(game, i, polygon));
        }

        this._calculateNeighbors();

        // Astar graph of connections between polygons
        this.graph = new NavGraph(this._navPolygons);
    }

    /**
     * Find a path from the start point to the end point using this nav mesh.
     *
     * @param {Phaser.Point} startPoint
     * @param {Phaser.Point} endPoint
     * @param {object} [drawOptions={}] Options for controlling debug drawing
     * @param {boolean} [drawOptions.drawNavMesh=false] Whether or not to visualize the nav mesh
     * with colored overlay.
     * @param {boolean} [drawOptions.drawPolyPath=false] Whether or not to visualize the path
     * through the polygons - e.g. the path that astar found.
     * @param {boolean} [drawOptions.drawFinalPath=false] Whether or not to visualize the path
     * through the path that was returned.
     * @returns {Phaser.Point[]|null} An array of points if a path is found, or null if no path
     *
     * @memberof NavMesh
     */
    findPath(startPoint, endPoint, {drawNavMesh = false, drawPolyPath = false, 
            drawFinalPath = false} = {}) {
        let startPoly = null;
        let endPoly = null;
        let startDistance = Number.MAX_VALUE;
        let endDistance = Number.MAX_VALUE;
        let d, r;

        // Find the closest poly for the starting and ending point
        for (const navPoly of this._navPolygons) {
            r = navPoly.boundingRadius;
            // Start
            d = navPoly.centroid.distance(startPoint);
            if (d <= startDistance && d <= r && navPoly.constains(startPoint)) {
                startPoly = navPoly;
                startDistance = d;
            }
            // End
            d = navPoly.centroid.distance(endPoint);
            if (d <= endDistance && d <= r && navPoly.constains(endPoint)) {
                endPoly = navPoly;
                endDistance = d;
            }
        }

        // If the start point wasn't inside a polygon, run a more liberal check that allows a point
        // to be within meshShrinkAmount radius of a polygon
        if (!startPoly && this._meshShrinkAmount > 0) {
            for (const navPoly of this._navPolygons) {
                // Check if point is within bounding circle to avoid extra projection calculations
                r = navPoly.boundingRadius + this._meshShrinkAmount;
                d = navPoly.centroid.distance(startPoint);
                if (d <= r) {
                    // Check if projected point is within range of a polgyon and is closer than the
                    // previous point
                    const {distance} = this._projectPointToPolygon(startPoint, navPoly);
                    if (distance <= this._meshShrinkAmount && distance < startDistance) {
                        startPoly = navPoly;
                        startDistance = distance;
                    }
                }
            }
        }

        // Same check as above, but for the end point
        if (!endPoly && this._meshShrinkAmount > 0) {
            for (const navPoly of this._navPolygons) {
                r = navPoly.boundingRadius + this._meshShrinkAmount;
                d = navPoly.centroid.distance(endPoint);
                if (d <= r) {
                    const {distance}  = this._projectPointToPolygon(endPoint, navPoly);
                    if (distance <= this._meshShrinkAmount && distance < endDistance) {
                        endPoly = navPoly;
                        endDistance = distance;
                    }
                }
            }
        }

        // No matching polygons locations for the start or end, so no path found
        if (!startPoly || !endPoly) return null;
        
        // Search!
        const astarPath = jsastar.astar.search(this.graph, startPoly, endPoly, {
            heuristic: this.graph.navHeuristic
        });
        // jsastar drops the first point from the path, but the funnel algorithm needs it
        astarPath.unshift(startPoly);
        
        // We have a path, so now time for the funnel algorithm
        const channel = new Channel();
        channel.push(startPoint);
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

            // Push the portal vertices into the channel
            channel.push(portal.start, portal.end);
        }
        channel.push(endPoint);

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

        // Call debug drawing
        if (drawFinalPath || drawNavMesh || drawPolyPath) {
            this.debugDraw(
                drawNavMesh,
                drawPolyPath ? astarPath : null,
                drawFinalPath ? phaserPath : null 
            );
        }

        return phaserPath;
    }

    _calculateNeighbors() {
        // Fill out the neighbor information for each navpoly
        for (let i = 0; i < this._navPolygons.length; i++) {
            const navPoly = this._navPolygons[i];

            for (let j = i + 1; j < this._navPolygons.length; j++) {
                const otherNavPoly = this._navPolygons[j];

                // Check if the other navpoly is within range to touch
                const d = navPoly.centroid.distance(otherNavPoly.centroid);
                if (d > (navPoly.boundingRadius + otherNavPoly.boundingRadius)) continue;

                // The are in range, so check each edge pairing
                for (const edge of navPoly.edges) {
                    for (const otherEdge of otherNavPoly.edges) {
                        
                        // If edges aren't collinear, not an option for connecting navpolys
                        if (!areCollinear(edge, otherEdge)) continue;

                        // If they are collinear, check if they overlap
                        const overlap = this._getSegmentOverlap(edge, otherEdge);
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
                            navPoly.portals.push(new Phaser.Line(p1.x, p1.y, p2.x, p2.y));
                        } else {
                            navPoly.portals.push(new Phaser.Line(p2.x, p2.y, p1.x, p1.y));
                        }

                        edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.start);
                        a1 = otherNavPoly.centroid.angle(overlap[0]);
                        a2 = otherNavPoly.centroid.angle(overlap[1]);
                        d1 = angleDifference(edgeStartAngle, a1);
                        d2 = angleDifference(edgeStartAngle, a2);
                        if (d1 < d2) {
                            otherNavPoly.portals.push(new Phaser.Line(p1.x, p1.y, p2.x, p2.y));
                        } else {
                            otherNavPoly.portals.push(new Phaser.Line(p2.x, p2.y, p1.x, p1.y));
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
    _getSegmentOverlap(line1, line2) {
        const points = [
            {line: line1, point: line1.start}, 
            {line: line1, point: line1.end}, 
            {line: line2, point: line2.start}, 
            {line: line2, point: line2.end}
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
     * 
     * @memberof NavMesh
     */
    _projectPointToPolygon(point, navPoly) {
        let closestProjection = null;
        let closestDistance = Number.MAX_VALUE;
        for (const edge of navPoly.edges) {
            const projectedPoint = this._projectPointToEdge(point, edge);
            const d = point.distance(projectedPoint);
            if (closestProjection === null || d < closestDistance) {
                closestDistance = d;
                closestProjection = projectedPoint;
            }
        }
        return {point: closestProjection, distance: closestDistance};
    }

    _distanceSquared(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return dx * dx + dy * dy;
    }

    // Project a point onto a line segment
    // JS Source: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    _projectPointToEdge(point, line) {
        const a = line.start;
        const b = line.end;
        // Consider the parametric equation for the edge's line, p = a + t (b - a). We want to find
        // where our point lies on the line by solving for t:
        //  t = [(p-a) . (b-a)] / |b-a|^2
        const l2 = this._distanceSquared(a, b);
        let t = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / l2;
        // We clamp t from [0,1] to handle points outside the segment vw.
        t = Phaser.Math.clamp(t, 0, 1);
        // Project onto the segment
        const p = new Phaser.Point(
            a.x + t * (b.x - a.x),
            a.y + t * (b.y - a.y)
        );
        return p;        
    }

    enableDebug() {
        this._debugGraphics = this.game.add.graphics(0, 0);
    }

    disableDebug() {
        if (this._debugGraphics) {
            this._debugGraphics.destroy();
            this._debugGraphics = undefined;
        }
    }

    debugDraw(drawNavMesh = false, polyPath = null, funnelPath = null) {
        if (!this._debugGraphics) this.enableDebug();
        this._debugGraphics.clear();
        this._debugGraphics.alpha = 0.5;

        // Visualize the navigation mesh
        if (drawNavMesh) {
            for (const navPoly of this._navPolygons) navPoly.draw(this._debugGraphics);
        }

        // Draw astar path through the polygons
        if (polyPath) {
            this._debugGraphics.lineStyle(10, 0x00FF00);
            this._debugGraphics.moveTo(polyPath[0].centroid.x, polyPath[0].centroid.y);
            for (const navPoly of polyPath) {
                this._debugGraphics.lineTo(navPoly.centroid.x, navPoly.centroid.y);
            }
            const lastPoly = polyPath[polyPath.length - 1];
            this._debugGraphics.lineTo(lastPoly.centroid.x, lastPoly.centroid.y);
        }

        // Draw the funneled path
        if (funnelPath) {
            this._debugGraphics.lineStyle(5, 0xffd900);
            const p = new Phaser.Polygon(...funnelPath);
            p.closed = false;
            this._debugGraphics.drawShape(p); 
            this._debugGraphics.beginFill(0xffd900);
            this._debugGraphics.drawEllipse(funnelPath[0].x, funnelPath[0].y, 10, 10);
            const lastPoint = funnelPath[funnelPath.length - 1];
            this._debugGraphics.drawEllipse(lastPoint.x, lastPoint.y, 10, 10);
            this._debugGraphics.endFill();
        }
    }
}

export default NavMesh;