import { Point } from "./common-types";
import Line from "./math/line";
import Vector2 from "./math/vector-2";
/**
 * Calculate the distance squared between two points. This is an optimization to a square root when
 * you just need to compare relative distances without needing to know the specific distance.
 * @param a
 * @param b
 */
export declare function distanceSquared(a: Point, b: Point): number;
/**
 * Project a point onto a line segment.
 * JS Source: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
 * @param point
 * @param line
 */
export declare function projectPointToEdge(point: Point, line: Line): Vector2;
/**
 * Twice the area of the triangle formed by a, b and c.
 */
export declare function triarea2(a: Point, b: Point, c: Point): number;
/**
 * Clamp the given value between min and max.
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Check if two values are within a small margin of one another.
 */
export declare function almostEqual(value1: number, value2: number, errorMargin?: number): boolean;
/**
 * Find the smallest angle difference between two angles
 * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
 */
export declare function angleDifference(x: number, y: number): number;
/**
 * Check if two lines are collinear (within a small error margin).
 */
export declare function areCollinear(line1: Line, line2: Line, errorMargin?: number): boolean;
//# sourceMappingURL=utils.d.ts.map