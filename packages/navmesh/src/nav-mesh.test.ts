import NavMesh from "./navmesh";
import Vector2 from "./math/vector-2";

const v2 = (x: number, y: number) => new Vector2(x, y);

describe("An empty NavMesh instance", () => {
  let emptyNavMesh: NavMesh;
  beforeAll(() => (emptyNavMesh = new NavMesh([])));

  it("should not throw an error on construction", () => {
    expect(() => emptyNavMesh).not.toThrow();
  });

  it("should always return null when queried for a path", () => {
    const path = emptyNavMesh.findPath(v2(10, 20), v2(30, 50));
    expect(path).toBeNull();
  });
});

describe("A simple, fully connected NavMesh instance", () => {
  let navMesh: NavMesh;
  /*
    - - - - -
    - 1 - 2 -
    - - - - -
  */
  // prettier-ignore
  const polygons = [
    [v2(0,0), v2(10,0), v2(10,10), v2(0,10)], // 1
    [v2(10,0), v2(20,0), v2(20,10), v2(10,10)] // 2
  ];
  beforeAll(() => (navMesh = new NavMesh(polygons)));

  it("should return a direct path when points are in the same polygon", () => {
    const path = navMesh.findPath(v2(0, 0), v2(5, 5));
    expect(path).toEqual([v2(0, 0), v2(5, 5)]);
  });

  it("should return null when a point is outside all polygon", () => {
    const path = navMesh.findPath(v2(-10, 0), v2(5, 5));
    expect(path).toBeNull();
  });

  it("should return a path when points are in neighboring polygons", () => {
    const path = navMesh.findPath(v2(5, 5), v2(15, 5));
    expect(path).toEqual([v2(5, 5), v2(15, 5)]);
  });

  it("should return a path when points are on the edges of the polygons", () => {
    const path = navMesh.findPath(v2(0, 0), v2(20, 10));
    expect(path).toEqual([v2(0, 0), v2(20, 10)]);
  });
});

describe("A NavMesh instance with two islands", () => {
  let navMesh: NavMesh;
  /*
    - - -   - - -
    - 1 -   - 2 -
    - - -   - - -
  */
  // prettier-ignore
  const polygons = [
    [v2(0,0), v2(10,0), v2(10,10), v2(0,10)], // 1
    [v2(40,0), v2(50,0), v2(50,10), v2(40,10)], // 2
  ];
  beforeAll(() => (navMesh = new NavMesh(polygons)));

  it("should return null when queried for a path between islands", () => {
    const path = navMesh.findPath(v2(0, 0), v2(40, 0));
    expect(path).toBeNull();
  });
});

describe("A NavMesh instance with a corner", () => {
  let navMesh: NavMesh;
  /*
    - - - - -
    - 1 - 2 -
    - - - - -
        - 3 -
        - - -
  */
  // prettier-ignore
  const polygons = [
    [v2(0,0), v2(10,0), v2(10,10), v2(0,10)], // 1
    [v2(10,0), v2(20,0), v2(20,10), v2(10,10)], // 2
    [v2(10,10), v2(20,10), v2(20,20), v2(10,20)] // 3
  ];
  beforeAll(() => (navMesh = new NavMesh(polygons)));

  it("should return a path that hugs the corner", () => {
    const path = navMesh.findPath(v2(0, 0), v2(10, 20));
    expect(path).toEqual([v2(0, 0), v2(10, 10), v2(10, 20)]);
  });
});

describe("isPointInMesh", () => {
  let navMesh: NavMesh;
  /*
    - - - - -     - - -
    - 1 - 2 -     - 4 -
    - - - - -     - - -
        - 3 -
        - - -
  */
  // prettier-ignore
  const polygons = [
    [v2(0,0), v2(10,0), v2(10,10), v2(0,10)], // 1
    [v2(10,0), v2(20,0), v2(20,10), v2(10,10)], // 2
    [v2(10,10), v2(20,10), v2(20,20), v2(10,20)], // 3
    [v2(30,0), v2(40,0), v2(40,10), v2(30,10)] // 4
  ];
  beforeAll(() => (navMesh = new NavMesh(polygons)));

  it("should return true if point is on the edge of a polygon", () => {
    expect(navMesh.isPointInMesh(v2(0, 0))).toEqual(true);
    expect(navMesh.isPointInMesh(v2(10, 0))).toEqual(true);
    expect(navMesh.isPointInMesh(v2(10, 10))).toEqual(true);
    expect(navMesh.isPointInMesh(v2(40, 10))).toEqual(true);
  });

  it("should return true if point is in a polygon in the mesh", () => {
    expect(navMesh.isPointInMesh(v2(5, 5))).toEqual(true);
    expect(navMesh.isPointInMesh(v2(10, 5))).toEqual(true);
    expect(navMesh.isPointInMesh(v2(32, 2))).toEqual(true);
  });

  it("should return false for a point outside the mesh", () => {
    expect(navMesh.isPointInMesh(v2(-10, -20))).toEqual(false);
    expect(navMesh.isPointInMesh(v2(25, 0))).toEqual(false);
    expect(navMesh.isPointInMesh(v2(300, 100))).toEqual(false);
  });
});

describe("findClosestMeshPoint", () => {
  let navMesh: NavMesh;
  /*
    - - - - -     - - -
    - 1 - 2 -     - 4 -
    - - - - -     - - -
        - 3 -
        - - -
  */
  // prettier-ignore
  const polygons = [
    [v2(0,0), v2(10,0), v2(10,10), v2(0,10)], // 1
    [v2(10,0), v2(20,0), v2(20,10), v2(10,10)], // 2
    [v2(10,10), v2(20,10), v2(20,20), v2(10,20)], // 3
    [v2(30,0), v2(40,0), v2(40,10), v2(30,10)] // 4
  ];
  beforeAll(() => (navMesh = new NavMesh(polygons)));

  it("should return null for points outside of the max distance", () => {
    expect(navMesh.findClosestMeshPoint(v2(-100, 0), 10).polygon).toBeNull();
  });

  it("should return poly 1 for point inside poly 1", () => {
    const result = navMesh.findClosestMeshPoint(v2(5, 5));
    expect(result.polygon.id).toBe(0);
    expect(result.point).toEqual({ x: 5, y: 5 });
  });

  it("should return poly 1 or 2 for point on shared edge between poly 1 and 2", () => {
    const result = navMesh.findClosestMeshPoint(v2(10, 5));
    expect(result.polygon.id).toBeGreaterThanOrEqual(0);
    expect(result.polygon.id).toBeLessThanOrEqual(1);
  });

  it("should return top left corner of poly 1 for a point just outside of top left corner", () => {
    const result = navMesh.findClosestMeshPoint(v2(-10, -10));
    expect(result.point).toEqual({ x: 0, y: 0 });
  });

  it("should return top middle of poly 1 for a point just outside of top middle", () => {
    const result = navMesh.findClosestMeshPoint(v2(-10, 5));
    expect(result.point).toEqual({ x: 0, y: 5 });
  });

  it("should return poly 2 or 4 for a point equidistant from them", () => {
    const result = navMesh.findClosestMeshPoint(v2(25, 5));
    const isPoly2or4 = result.polygon.id === 1 || result.polygon.id === 3;
    console.log(result.point, result.distance);
    expect(isPoly2or4).toBe(true);
  });
});
