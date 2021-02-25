import { Point } from "../common-types";
declare type PointLike = Vector2 | Point;
/**
 * Stripped down version of Phaser's Vector2 with just the functionality needed for navmeshes.
 *
 * @export
 * @class Vector2
 */
export default class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    equals(v: PointLike): boolean;
    angle(v: PointLike): number;
    distance(v: PointLike): number;
    add(v: PointLike): void;
    subtract(v: PointLike): void;
    clone(): Vector2;
}
export {};
//# sourceMappingURL=vector-2.d.ts.map