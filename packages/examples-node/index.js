// Simple usage of navmesh in Node to find a path within geometry

const NavMesh = require("navmesh");
const express = require("express");
const argv = require("yargs").argv;
const app = express();
const port = argv.port || 8082;

/*
  Imaging your game world has three walkable rooms, like this:

    +-----+-----+
    |     |     |
    |  1  |  2  |
    |     |     |
    +-----------+
          |     |
          |  3  |
          |     |
          +-----+
*/

// The mesh is represented as an array where each element contains the points for an individual
// polygon within the mesh.
const meshPolygonPoints = [
  [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }], // Polygon 1
  [{ x: 10, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 10 }, { x: 10, y: 10 }], // Polygon 2
  [{ x: 10, y: 0 }, { x: 20, y: 10 }, { x: 20, y: 20 }, { x: 10, y: 20 }] // Polygon 3
];
const navMesh = new NavMesh(meshPolygonPoints);

app.get("/", (req, res) => {
  // Find a path from the top left of room 1 to the bottom left of room 3
  const path = navMesh.findPath({ x: 0, y: 0 }, { x: 10, y: 20 });
  // ⮡  [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 10, y: 20 }]

  res.send(
    `
    <html>
      <body>
        <p>Path from (0, 0) => (10, 20)</p>
        <ul>
          ${path.map(p => `<li>(${p.x}, ${p.y})</li>`).join("\n")}
        </ul>
      <body>
    <html>
  `
  );
});

app.listen(port, () => console.log(`Node app listening on port ${port}!`));
