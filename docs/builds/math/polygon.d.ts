import { Point } from "../common-types";
import Line from "./line";
/**
 * Stripped down version of Phaser's Polygon with just the functionality needed for navmeshes.
 *
 * @export
 * @class Polygon
 */
export default class Polygon {
    edges: Line[];
    points: Point[];
    private isClosed;
    constructor(points: Point[], closed?: boolean);
    contains(x: number, y: number): boolean;
}
//# sourceMappingURL=polygon.d.ts.map