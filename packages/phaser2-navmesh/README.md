# Phaser 2 NavMesh

A Phaser 2 plugin for fast pathfinding using [navigation meshes](https://en.wikipedia.org/wiki/Navigation_mesh).

For usage information, see: [mikewesthad/navmesh](https://github.com/mikewesthad/navmesh).

## Changelog

Version 2.2.1

- Update all dependencies to the latest versions.

Version 2.2.0

- Feature: `PhaserNavMesh2#isPointInMesh` allows you to check if a point is inside of the navmesh.

Version 2.1.0

- Added `public removeAllMeshes()` to `Phaser2NavMeshPlugin`.
- Converted library to TypeScript.

Version 2.0.5

- Bug: fixed webpack config so that it applied babel transform and so that it worked under node environments, thanks to [@will-hart](https://github.com/will-hart)

Version 2.0.4

- Bug: fixed a bug when destroying navmeshes, thanks to [@GGAlanSmithee](https://github.com/GGAlanSmithee) for pointing it out
