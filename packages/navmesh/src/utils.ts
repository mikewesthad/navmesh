import { Point } from "./common-types";
import Line from "./math/line";
import Vector2 from "./math/vector-2";

/**
 * Calculate the distance squared between two points. This is an optimization to a square root when
 * you just need to compare relative distances without needing to know the specific distance.
 * @param a
 * @param b
 */
export function distanceSquared(a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

/**
 * Project a point onto a line segment.
 * JS Source: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
 * @param point
 * @param line
 */
export function projectPointToEdge(point: Point, line: Line) {
  const a = line.start;
  const b = line.end;
  // Consider the parametric equation for the edge's line, p = a + t (b - a). We want to find
  // where our point lies on the line by solving for t:
  //  t = [(p-a) . (b-a)] / |b-a|^2
  const l2 = distanceSquared(a, b);
  let t = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / l2;
  // We clamp t from [0,1] to handle points outside the segment vw.
  t = clamp(t, 0, 1);
  // Project onto the segment
  const p = new Vector2(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
  return p;
}

/**
 * Twice the area of the triangle formed by a, b and c.
 */
export function triarea2(a: Point, b: Point, c: Point) {
  const ax = b.x - a.x;
  const ay = b.y - a.y;
  const bx = c.x - a.x;
  const by = c.y - a.y;
  return bx * ay - ax * by;
}

/**
 * Clamp the given value between min and max.
 */
export function clamp(value: number, min: number, max: number) {
  if (value < min) value = min;
  if (value > max) value = max;
  return value;
}

/**
 * Check if two values are within a small margin of one another.
 */
export function almostEqual(value1: number, value2: number, errorMargin = 0.0001) {
  if (Math.abs(value1 - value2) <= errorMargin) return true;
  else return false;
}

/**
 * Find the smallest angle difference between two angles
 * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
 */
export function angleDifference(x: number, y: number) {
  let a = x - y;
  const i = a + Math.PI;
  const j = Math.PI * 2;
  a = i - Math.floor(i / j) * j; // (a+180) % 360; this ensures the correct sign
  a -= Math.PI;
  return a;
}

/**
 * Check if two lines are collinear (within a small error margin).
 */
export function areCollinear(line1: Line, line2: Line, errorMargin = 0.0001) {
  // Figure out if the two lines are equal by looking at the area of the triangle formed
  // by their points
  const area1 = triarea2(line1.start, line1.end, line2.start);
  const area2 = triarea2(line1.start, line1.end, line2.end);
  if (almostEqual(area1, 0, errorMargin) && almostEqual(area2, 0, errorMargin)) {
    return true;
  } else return false;
}
