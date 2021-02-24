# Phaser NavMesh

A Phaser 3 plugin for fast pathfinding using [navigation meshes](https://en.wikipedia.org/wiki/Navigation_mesh).

For usage information, see: [mikewesthad/navmesh](https://github.com/mikewesthad/navmesh).

## Changelog

Version 2.1.0 - 2021-02-24

- Added `public removeAllMeshes()` to `PhaserNavMeshPlugin`.
- Bug: fixed double subscription to boot, thanks [@malahaas](https://github.com/malahaas)!
- Converted library to TypeScript.

Version 2.0.5 - 2019-08-04

- Bug: fixed webpack config so that it applied babel transform and so that it worked under node environments, thanks to [@will-hart](https://github.com/will-hart)

Version 2.0.4 - 2018-01-03

- Bug: fixed a bug when destroying navmeshes, thanks to [@GGAlanSmithee](https://github.com/GGAlanSmithee) for pointing it out
