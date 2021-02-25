import Vector2 from "./math/vector-2";
export interface Portal {
    left: Vector2;
    right: Vector2;
}
/**
 * @private
 */
export default class Channel {
    path: Vector2[];
    private portals;
    constructor();
    push(p1: Vector2, p2?: Vector2): void;
    stringPull(): Vector2[];
}
//# sourceMappingURL=channel.d.ts.map