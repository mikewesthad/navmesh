import { almostEqual, angleDifference, areCollinear } from "../utils";
import Line from "../math/line";

const line = (...args) => new Line(...args);

describe("almostEqual", () => {
  test("should be false for numbers with a significant difference", () => {
    expect(almostEqual(1, 2)).toEqual(false);
    expect(almostEqual(-1, -0.95)).toEqual(false);
  });
  test("should be true for numbers that are within floating point error margin", () => {
    expect(almostEqual(1, 1.00001)).toEqual(true);
    expect(almostEqual(1 / 3, 0.33333)).toEqual(true);
  });
});

describe("areCollinear", () => {
  test("should return false for non-collinear lines", () => {
    expect(areCollinear(line(-5, 0, 5, 0), line(-5, 10, 5, 10))).toEqual(false); // Parallel
    expect(areCollinear(line(0, 0, 10, 10), line(0, 0, 0, 10))).toEqual(false); // Intersecting
  });
  test("should return true for collinear lines", () => {
    expect(areCollinear(line(10, 10, 0, 0), line(10, 10, 0, 0))).toEqual(true); // Same
    expect(areCollinear(line(0, 0, 10, 10), line(10, 10, 0, 0))).toEqual(true); // Reversed
  });
});

describe("angleDifference", () => {
  test("should return the difference between angles in radians", () => {
    expect(angleDifference(Math.PI, Math.PI / 2)).toEqual(Math.PI / 2);
    expect(angleDifference(1, -2)).toEqual(3);
  });
  test("should wrap angles to calculate minimum angular distance", () => {
    expect(angleDifference(4 * Math.PI, Math.PI / 2)).toEqual(-Math.PI / 2);
    expect(angleDifference(-3 * Math.PI, 0)).toEqual(-Math.PI);
  });
});

// TODO: triarea2
