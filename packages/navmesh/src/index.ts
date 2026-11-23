/**
 * `navmesh` is the core logic package. It is game-engine agnostic, usable outside of Phaser.
 * @packageDocumentation
 * @module navmesh
 */

import NavMesh from "./navmesh";
import GridNavMeshUpdater from "./grid-navmesh-updater";

export { NavMesh };
export { GridNavMeshUpdater };
export * from "./common-types";
export * from "./map-parsers";
export default NavMesh;
