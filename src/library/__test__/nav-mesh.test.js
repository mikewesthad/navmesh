import NavMesh from "../nav-mesh";
global.PIXI = require("phaser-ce/build/custom/pixi");
global.p2 = require("phaser-ce/build/custom/p2");
global.Phaser = require("phaser-ce/build/custom/phaser-split");

const point = (x, y) => new Phaser.Point(x, y);
const poly = (...args) => new Phaser.Polygon(...args);

describe("An empty NavMesh instance", () => {
  let emptyNavMesh;
  beforeAll(() => (emptyNavMesh = new NavMesh({}, [])));

  it("should not throw an error on construction", () => {
    expect(() => emptyNavMesh).not.toThrow();
  });

  it("should always return null when queried for a path", () => {
    const path = emptyNavMesh.findPath(point(10, 20), point(30, 50));
    expect(path).toBeNull();
  });
});

describe("A simple, fully connected NavMesh instance", () => {
  let navMesh;
  /*
    - - - - -
    - 1 - 2 -
    - - - - -
  */
  // prettier-ignore
  const polygons = [
    poly(0,0, 10,0, 10,10, 0,10), // 1
    poly(10,0, 20,0, 20,10, 10,10) // 2
  ];
  beforeAll(() => (navMesh = new NavMesh({}, polygons)));

  it("should return a direct path when points are in the same polygon", () => {
    const path = navMesh.findPath(point(0, 0), point(5, 5));
    expect(path).toEqual([point(0, 0), point(5, 5)]);
  });

  it("should return null when a point is outside all polygon", () => {
    const path = navMesh.findPath(point(-10, 0), point(5, 5));
    expect(path).toBeNull();
  });

  it("should return a path when points are in neighboring polygons", () => {
    const path = navMesh.findPath(point(5, 5), point(15, 5));
    expect(path).toEqual([point(5, 5), point(15, 5)]);
  });

  it("should return a path when points are on the edges of the polygons", () => {
    const path = navMesh.findPath(point(0, 0), point(20, 10));
    expect(path).toEqual([point(0, 0), point(20, 10)]);
  });
});

describe("A NavMesh instance with two islands", () => {
  let navMesh;
  /*
    - - -   - - -
    - 1 -   - 2 -
    - - -   - - -
  */
  // prettier-ignore
  const polygons = [
    poly(0,0, 10,0, 10,10, 0,10), // 1
    poly(40,0, 50,0, 50,10, 40,10), // 2
  ];
  beforeAll(() => (navMesh = new NavMesh({}, polygons)));

  it("should return null when queried for a path between islands", () => {
    const path = navMesh.findPath(point(0, 0), point(40, 0));
    expect(path).toBeNull();
  });
});

describe("A NavMesh instance with a corner", () => {
  let navMesh;
  /*
    - - - - -
    - 1 - 2 -
    - - - - -
        - 3 -
        - - -
  */
  // prettier-ignore
  const polygons = [
    poly(0,0, 10,0, 10,10, 0,10), // 1
    poly(10,0, 20,0, 20,10, 10,10), // 2
    poly(10,10, 20,10, 20,20, 10,20) // 3
  ];
  beforeAll(() => (navMesh = new NavMesh({}, polygons)));

  it("should return a path that hugs the corner", () => {
    const path = navMesh.findPath(point(0, 0), point(10, 20));
    expect(path).toEqual([point(0, 0), point(10, 10), point(10, 20)]);
  });
});
