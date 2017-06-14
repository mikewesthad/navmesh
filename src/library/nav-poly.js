// Debug color palette
const palette = [0x00A0B0, 0x6A4A3C, 0xCC333F, 0xEB6841, 0xEDC951];

/**
 * A class that represents a navigable polygon in a navmesh. It is build from a Phaser.Polygon. It
 * has a drawing function to help visualize it's features:
 *  - polygon
 *  - neighbors - any navpolys that can be reached from this navpoly
 *  - portals - overlapping edges between neighbors
 *  - centroid - not a true centroid, just an approximation.
 *  - boundingRadius - the radius of a circle at the centroid that fits all the points of the poly 
 * 
 * It implements the properties and fields that javascript-astar needs - weight, toString, isWall
 * and getCost. See GPS test from astar repo for structure: 
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavPoly
 */
class NavPoly {
    /**
     * Creates an instance of NavPoly.
     * @param {Phaser.Game} game 
     * @param {number} id 
     * @param {Phaser.Polygon} polygon 
     * 
     * @memberof NavPoly
     */
    constructor(game, id, polygon) {
        this.game = game;
        this.id = id;
        this.polygon = polygon;
        this.edges = this._calculateEdges();
        this.neighbors = [];
        this.portals = [];
        this.centroid = this._calculateCentroid();
        this.boundingRadius = this._calculateRadius();

        this.weight = 1; // jsastar property
        
        const i = this.id % palette.length;
        this._color = palette[i];
    }

    constains(point) {
        return this.polygon.contains(point.x, point.y);
    }

    // jsastar methods
    toString() {
        return `NavPoly(id: ${this.id} at: ${this.centroid})`;
    }
    isWall() {
        return this.weight === 0;
    }
    centroidDistance(navPolygon) {
        return this.centroid.distance(navPolygon.centroid);
    }
    getCost(navPolygon) {
        return this.centroidDistance(navPolygon);
    }

    _calculateEdges() {
        const points = this.polygon.points;
        const edges = [];
        for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            edges.push(new Phaser.Line(p1.x, p1.y, p2.x, p2.y));
        }
        const first = points[0];
        const last = points[points.length - 1]
        edges.push(new Phaser.Line(first.x, first.y, last.x, last.y));
        return edges;
    }
    
    _calculateCentroid() {
        // NOTE: this is not actually the centroid, it's the average of the vertices - not the same
        // thing!
        const centroid = new Phaser.Point(0, 0);
        const length = this.polygon.points.length;
        for (const point of this.polygon.points) {
            centroid.add(point.x, point.y);
        }
        centroid.divide(length, length);
        return centroid;
    }

    _calculateRadius() {
        let boundingRadius = 0;
        for (const point of this.polygon.points) {
            const d = this.centroid.distance(point);
            if (d > boundingRadius) boundingRadius = d;
        }
        return boundingRadius;
    }

    /**
     * Draw the polygon to given graphics object
     * 
     * @param {Phaser.Graphics} graphics 
     * @param {boolean} [drawCentroid=true] Show the approx centroid
     * @param {boolean} [drawBounds=false] Show the bounding radius
     * @param {boolean} [drawNeighbors=true] Show the connections to neighbors
     * @param {boolean} [drawPortals=true] Show the portal edges
     * 
     * @memberof NavPoly
     */
    draw(graphics, drawCentroid = true, drawBounds = false, drawNeighbors = true, 
            drawPortals = true) {
        graphics.lineWidth = 0;
        graphics.beginFill(this._color);
        graphics.drawPolygon(this.polygon);
        graphics.endFill();

        if (drawCentroid) {
            graphics.beginFill(0x000000);
            graphics.drawEllipse(this.centroid.x, this.centroid.y, 4, 4);
            graphics.endFill();
        }

        if (drawBounds) {
            graphics.lineStyle(1, 0xFFFFFF);
            const r = this.boundingRadius;
            graphics.drawEllipse(this.centroid.x, this.centroid.y, r, r);
        }

        if (drawNeighbors) {
            graphics.lineStyle(2, 0x000000);
            for (const n of this.neighbors) {
                graphics.moveTo(this.centroid.x, this.centroid.y);
                graphics.lineTo(n.centroid.x, n.centroid.y);
            }
        }

        if (drawPortals) {
            graphics.lineStyle(10, 0x000000);
            for (const p of this.portals) {
                graphics.moveTo(p.start.x, p.start.y);
                graphics.lineTo(p.end.x, p.end.y);
            }
        }
    }
}

export default NavPoly;