import Vector2 from "./vector-2";
/**
 * Stripped down version of Phaser's Line with just the functionality needed for navmeshes.
 *
 * @export
 * @class Line
 */
export default class Line {
    start: Vector2;
    end: Vector2;
    left: number;
    right: number;
    top: number;
    bottom: number;
    constructor(x1: number, y1: number, x2: number, y2: number);
    pointOnSegment(x: number, y: number): boolean;
    pointOnLine(x: number, y: number): boolean;
}
//# sourceMappingURL=line.d.ts.map