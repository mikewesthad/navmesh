# javascript-astar

`astar.js` and `LICENSE` come from [commit c0304b1](https://github.com/mikewesthad/javascript-astar/tree/c0304b12861eda334e27f2f15d701c10b296593f).
This revision clears the start node's search state between path requests and ships
with the NavMesh source so consumers can bundle it directly.

## When to remove this copy

Remove it when either the upstream npm package publishes the fix that marks the
start node for cleanup (or a scoped npm release of the fork is available), or
NavMesh adopts another A\* implementation that supports its graph of neighboring
polygons. A replacement can be built in-house or pulled from npm.

Before switching, verify repeated searches on the same mesh, npm 12 installs
with Git dependencies disabled, and bundling the documented
`phaser-navmesh/src` import from the published package.
