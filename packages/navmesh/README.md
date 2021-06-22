# NavMesh

A JS plugin for fast pathfinding using [navigation meshes](https://en.wikipedia.org/wiki/Navigation_mesh).

For usage information, see: [mikewesthad/navmesh](https://github.com/mikewesthad/navmesh).

## Changelog

Version 2.3.0

- Fix: webpack misconfiguration that caused [issue 37](https://github.com/mikewesthad/navmesh/issues/37). The build was only picking up the "default" export, but now it properly picks up all library exports. Thanks to[@Wenish](https://github.com/Wenish).

Version 2.2.1

- Update all dependencies to the latest versions.

Version 2.2.0

- Feature: `NavMesh#isPointInMesh` allows you to check if a point is inside of the navmesh.
- Feature: `NavMesh#findClosestMeshPoint` allows you to find the nearest point on the mesh to a given location.
- Feature: `buildPolysFromGridMap` allows you to build polygons for a navmesh using a 2D array of a grid-based level.

Version 2.1.0

- Converted library to TypeScript.

Version 2.0.4

- Internal optimization [#26](https://github.com/mikewesthad/navmesh/pull/26): thanks to [@herohan](https://github.com/herohan) and seowoo.

Version 2.0.3

- Bug: fixed webpack config so that it applied babel transform and so that it worked under node environments, thanks to [@will-hart](https://github.com/will-hart)

Version 2.0.2

- Initial publish of changelog
