# Navigation Meshes <!-- omit in toc -->

A JS plugin for fast pathfinding using [navigation meshes](https://en.wikipedia.org/wiki/Navigation_mesh), with optional wrappers for the Phaser v2 and Phaser v3 game engines.

[<img src="./doc-source/single-following-agent.gif" width="400">](https://www.mikewesthad.com/phaser-navmesh/demo/)

[Interactive demo](https://www.mikewesthad.com/phaser-navmesh/demo/)

Table of Contents:

- [Intro](#intro)
- [Installation](#installation)
  - [As a Script](#as-a-script)
  - [As a Module](#as-a-module)
- [Create a Nav Mesh](#create-a-nav-mesh)
- [Usage](#usage)
- [Performance Comparison](#performance-comparison)
- [Development](#development)
- [References](#references)
- [TODO](#todo)

## Intro

Pathfinding is essentially solving a maze, finding a path between two points while avoiding obstacles. When pathfinding in games, we need to:

1.  Represent the game world in a way that defines what areas are walkable.
2.  Search that representation for the shortest path.

When it comes to 2D pathfinding in [Phaser](http://phaser.io/), the [packaged solution](https://github.com/photonstorm/phaser-plugins) represents the world using [tiles](https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps) (a grid) and then searchs for a path using the [A\* algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm). If you have a 50 x 50 tile world, searching for a path involves searching through a representation of the world with up to 2500 locations (nodes).

This plugin uses navigation meshes to simplify that search. Instead of representing the world as a grid of tiles, it represents the walkable areas of the world as a mesh. That means that the representation of the world has far fewer nodes, and hence, can be searched much faster than the grid approach. This approach is 5x - 150x faster than Phaser's A\* plugin (see performance section).

The example map below (left) is a 30 x 30 map. As a grid, there are 900 nodes, but as a navmesh (right) there are 27 nodes (colored rectangles).

<img src="./doc-source/combined.png" width="700">

(Note: if you are viewing this on GitHub or NPM, you might want to check out the HTML documentation [here](https://www.mikewesthad.com/phaser-navmesh/docs/).)

## Installation

This repo contains 3 related JS modules:

- `navmesh` - core logic, game-engine agnostic, usable outside of Phaser.
- `phaser-navmesh` - Phaser v3 wrapper around `navmesh` that creates a Phaser 3 Scene plugin. Phaser 3 is expected to be a dependency in your project.
- `phaser2-navmesh` - Phaser v2 wrapper around `navmesh` that creates a Phaser 2 game plugin. Phaser 2 or Phaser-ce is expected to be in the global scope.

You can use any of them as a script or as a module.

### As a Script

Download the distribution version that you want:

| navmesh                           | phaser-navmesh                     | phaser2-navmesh                     |
| --------------------------------- | ---------------------------------- | ----------------------------------- |
| [minified][1] & source [map][2]   | [minified][3] & source [map][4]    | [minified][5] & source [map][6]     |
| [unminified][7] & source [map][8] | [unminified][9] & source [map][10] | [unminified][11] & source [map][12] |
| Library Name: NavMesh             | Library Name: PhaserNavMeshPlugin  | Library Name: Phaser2NavMeshPlugin  |


[1]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/navmesh/dist/navmesh.min.js
[2]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/navmesh/dist/navmesh.min.js.map
[3]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/phaser-navmesh/dist/phaser-navmesh.min.js
[4]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/phaser-navmesh/dist/phaser-navmesh.min.js.map
[5]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/phaser2-navmesh/dist/phaser2-navmesh.min.js
[6]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/phaser2-navmesh/dist/phaser2-navmesh.min.js.map
[7]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/navmesh/dist/navmesh.js
[8]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/navmesh/dist/navmesh.js.map
[9]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/phaser-navmesh/dist/phaser-navmesh.js
[10]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/phaser-navmesh/dist/phaser-navmesh.js.map
[11]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/phaser2-navmesh/dist/phaser2-navmesh.js
[12]: https://raw.githubusercontent.com/mikewesthad/navmesh/master/packages/phaser2-navmesh/dist/phaser2-navmesh.js.map

E.g. if you wanted phaser-navmesh

```html
<script src="dist/phaser-navmesh.min.js"></script>
```

Inside of your own script, you can now use the global PhaserNavMeshPlugin:

```js
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 750,
  height: 750,
  plugins: {
    scene: [{key: "NavMeshPlugin", plugin: PhaserNavMeshPlugin, mapping: "navMeshPlugin", start: true }]
  }
});
```

### As a Module

Install the appropriate dependency:

- `npm install --save navmesh` for usage outside of Phaser
- `npm install --save phaser-navmesh` for Phaser 3
- `npm install --save phaser2-navmesh` for Phaser 2

To use the transpiled and minified distribution of the library:

```js
import PhaserNavmesh from "phaser-navmesh";
```

To use the raw library (so you can transpile it to match your own project settings):

```js
import PhaserNavmesh from "phaser-navmesh/src";
```

## Create a Nav Mesh

See [guide](./tiled-navmesh-guide.md).

## Usage

```js
// This snippet assumes you've got your tilemap loaded in a variable called "tilemap"

// Register the plugin with Phaser
const navMeshPlugin = this.game.plugins.add(phaserNavmesh);

// Load the navMesh from the tilemap object layer "navmesh." The navMesh was created with 12.5
// pixels of space around obstacles.
const navMesh = navMeshPlugin.buildMeshFromTiled(tilemap, "navmesh", 12.5);

const p1 = new Phaser.Point(100, 400);
const p2 = new Phaser.Point(700, 200);
const path = navMesh.findPath(p1, p2);
// -> path is now either an array of points, or null if no valid path could be found
```

Visually debugging paths:

```js
navMesh.enableDebug(); // Creates a Phaser.Graphics overlay on top of the screen
navMesh.debugClear(); // Clears the overlay
// Visualize the underlying navmesh
navMesh.debugDrawMesh({
  drawCentroid: true,
  drawBounds: false,
  drawNeighbors: true,
  drawPortals: true
});
// Find & visualize a specific path
const path = navMesh.findPath(follower.position, target, {
  drawPolyPath: true,
  drawFinalPath: true
});
```

## Performance Comparison

_(Note: these comparisons were done in any earlier verison of the repo before Phaser v3 was released. The plugins tested haven't been released in v3 versions yet, so this section could use an update. That said, the results should be the same.)_

Comparing this navmesh plugin against:

- [Phaser's grid-based A\* plugin](https://github.com/photonstorm/phaser-plugins). Navmesh is approximately 5x - 150x faster.
- A faster, grid-based A\* search, [EasyStar.js](https://github.com/prettymuchbryce/easystarjs). Navmesh is approximately 5x - 20x faster.

Performance depends on the size of the area that needs to be searched. Finding for a path between points that are 50 pixels away is (generally) going to be much faster than finding a path between points that are 5000 pixels away.

Details (see [src/library/performance](https://github.com/mikewesthad/phaser-navmesh/tree/master/src/examples/performance)):

```
Performance Comparison, 100000 iterations, 30x30 tilemap

Short paths (150 - 500 pixel length)

    Average time per iteration:
        AStart Plugin: 0.02470ms
        EasyStar Plugin: 0.02876ms
        NavMesh Plugin: 0.00575ms

    Comparison:
        NavMesh is 4.30x faster than Phaser AStar
        NavMesh is 5.00x faster than EasyStar

Long paths (600 pixels and greater length), average time per iteration:

    Average time per iteration:
        AStart Plugin: 1.38710ms
        EasyStar Plugin: 0.15977ms
        NavMesh Plugin: 0.00738ms

    Comparison:
        NavMesh is 187.95x faster than Phaser AStar
        NavMesh is 21.65x faster than EasyStar
```

## Development

Pull requests are welcome! If you want to run this repo locally, make sure you have [node](https://nodejs.org/en/) installed. Download the repo, open a terminal in the repo folder and run:

```
npm install
npm run bootstrap
```

This project uses [lerna](https://github.com/lerna/lerna) and [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) to manage multiple packages within one repository. `npm install` will pull the root dependencies and `npm run bootstrap` will use lerna & yarn to pull and link dependencies within "packages/". This project has the following packages:

- `navmesh` - core logic, game-engine agnostic
- `phaser-navmesh` - Phaser Plugin v3 wrapper around `navmesh`
- `phaser2-navmesh` - Phaser Plugin v2 wrapper around `navmesh`

The project is controlled via npm scripts. The main ones to use:

- `npm run build` - will build all the individual packages within "packages/".
- `npm run dev` - watch & serve the v3 examples. A browser window will pop up with links to the examples. If you are working on the library, this is the easiest way to do "functional testing" by using the library in a game environment.
- `npm run test` - will run the automated tests against the library.

## References

Helpful resources used while building this plugin:

- Inspired by [PatrolJS](https://github.com/nickjanssen/PatrolJS), an implementation of navmeshes for threejs
- Navmesh path-finding algorithm explanations:
  - [Game Path Planning by Julian Ceipek](http://jceipek.com/Olin-Coding-Tutorials/pathing.html)
  - [Simple Stupid Funnel Algorithm](http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html)
- [Advice on astar heuristics](http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html)

## TODO

- Documentation
  - Describe the Tiled process. Adding an object layer, setting snapping, making sure vertices overlap...
- Specific Extensions
  - Allow non-square navmesh from Tiled - any convex shape
  - Reimplement the autotessalation version of the lib
  - Try libtess in quad mode
  - The astar heuristic & cost functions need another pass. They don't always produce the shortest path. Implement incomplete funneling while building the astar path?
  - The navmesh assumes any polygon can reach any other polygon. This probably should be extended to put connected polygons into groups like patroljs.
- Testing
  - Check against tilemap that is larger than the screen
- Research
  - There are probably optimization tricks to do when dealing with certain types of shapes. E.g. we are using axis-aligned boxes for the polygons and it is dead simple to calculate if a point is inside one of those...
  - Investigate [Points-of-Visibility](http://www.david-gouveia.com/portfolio/pathfinding-on-a-2d-polygonal-map/) pathfinding to compare speed
