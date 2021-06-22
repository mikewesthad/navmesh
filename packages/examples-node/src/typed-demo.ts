// Simple usage of navmesh in Node to find a path within geometry

import { NavMesh } from "navmesh";
import express from "express";
import yargs from "yargs";

const argv = yargs(process.argv.slice(2)).argv;
const port = argv.port ?? 8082;
const app = express();

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
  // Polygon 1
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ],
  // Polygon 2
  [
    { x: 10, y: 0 },
    { x: 20, y: 0 },
    { x: 20, y: 10 },
    { x: 10, y: 10 },
  ],
  // Polygon 3
  [
    { x: 10, y: 10 },
    { x: 20, y: 10 },
    { x: 20, y: 20 },
    { x: 10, y: 20 },
  ],
];
const navMesh = new NavMesh(meshPolygonPoints);

app.get("/", (req, res) => {
  // Find a path from the top left of room 1 to the bottom left of room 3
  const path = navMesh.findPath({ x: 0, y: 0 }, { x: 10, y: 20 });
  // ⮡  [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 10, y: 20 }]

  const formattedPath =
    path !== null
      ? path.map((p) => `<li>(${p.x}, ${p.y})</li>`).join("\n")
      : "<li>No path found!</li>";

  res.send(
    `
    <html>
      <body>
        <p>Path from (0, 0) => (10, 20)</p>
        <ul>
          ${formattedPath}
        </ul>
      <body>
    <html>
    `
  );
});

app.listen(port, () => console.log(`Node app listening on port ${port}!`));
