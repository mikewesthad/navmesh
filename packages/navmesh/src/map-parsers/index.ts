/**
 * Currently there is only one map parser (for grid tile maps), but the plan is to extend this to
 * multiple parsers.
 */

import buildPolysFromGridMap from "./build-polys-from-grid-map";

export { buildPolysFromGridMap };
export * from "./build-polys-from-grid-map";
export * from "./point-queue";
export * from "./rectangle-hull";
