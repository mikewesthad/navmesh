# Phaser NavMesh

A Phaser 3 plugin for fast pathfinding using [navigation meshes](https://en.wikipedia.org/wiki/Navigation_mesh).

For usage information, see: [mikewesthad/navmesh](https://github.com/mikewesthad/navmesh).

## Changelog


Version 2.3.1

- Fix [issue 40](https://github.com/mikewesthad/navmesh/issues/40) where shrink parameter was not used in buildMeshFromTilemap. Thanks [@SlvainBreton](https://github.com/SylvainBreton).
- Documentation fixes.

Version 2.3.0

- Fix: webpack misconfiguration that caused [issue 37](https://github.com/mikewesthad/navmesh/issues/37). The build was only picking up the "default" export, but now it properly picks up all library exports. Thanks to[@Wenish](https://github.com/Wenish).

Version 2.2.2

- Update all dependencies to the latest versions.
- Fixed TS bug where constructor was missing `pluginKey` which is required in latest version of Phaser. 

Version 2.2.1

- Fix: `PhaserNavMeshPlugin#buildMeshFromTilemap` mesh output is no longer incorrectly rotated (rows & cols were flipped).
  
Version 2.2.0

- Feature: `PhaserNavMeshPlugin#buildMeshFromTilemap` allows you to automatically generate a navmesh from a Tilemap.
- Feature: `PhaserNavMesh#isPointInMesh` allows you to check if a point is inside of the navmesh.

Version 2.1.0

- Added `public removeAllMeshes()` to `PhaserNavMeshPlugin`.
- Bug: fixed double subscription to boot, thanks [@malahaas](https://github.com/malahaas)!
- Converted library to TypeScript.

Version 2.0.5

- Bug: fixed webpack config so that it applied babel transform and so that it worked under node environments, thanks to [@will-hart](https://github.com/will-hart)

Version 2.0.4

- Bug: fixed a bug when destroying navmeshes, thanks to [@GGAlanSmithee](https://github.com/GGAlanSmithee) for pointing it out
