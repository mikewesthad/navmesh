/**
 * Twice the area of the triangle formed by a, b and c
 * @private
 */
export function triarea2(a, b, c) {
    const ax = b.x - a.x;
    const ay = b.y - a.y;
    const bx = c.x - a.x;
    const by = c.y - a.y;
    return bx * ay - ax * by;
}

/**
 * @private
 */
export function almostEqual(value1, value2, errorMargin = 0.0001) {
    if (Math.abs(value1 - value2) <= errorMargin) return true;
    else return false;
}

/**
 * https://gist.github.com/Aaronduino/4068b058f8dbc34b4d3a9eedc8b2cbe0
 * @private
 */
export function angleDifference(x, y) {
    let a = x - y;
    const i = a + Math.PI;
    const j = Math.PI * 2;
    a = i - Math.floor(i / j) * j; // (a+180) % 360; this ensures the correct sign
    a -= Math.PI;
    return a;
}

/**
 * @private
 */
export function areCollinear(line1, line2, errorMargin=0.0001) {
    // Figure out if the two lines are equal by looking at the area of the triangle formed
    // by their points
    const area1 = triarea2(line1.start, line1.end, line2.start);
    const area2 = triarea2(line1.start, line1.end, line2.end);
    if (almostEqual(area1, 0, errorMargin) && almostEqual(area2, 0, errorMargin)) {
        return true;
    } else return false;
}