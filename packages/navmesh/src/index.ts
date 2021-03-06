/**
 * `navmesh` is the core logic package. It is game-engine agnostic, usable outside of Phaser.
 * @packageDocumentation
 * @module navmesh
 */

import NavMesh from "./navmesh";

export { NavMesh };
export * from "./common-types";
export * from "./map-parsers";
export default NavMesh;
