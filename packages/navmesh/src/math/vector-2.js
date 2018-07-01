/**
 * Stripped down version of Phaser's Vector2 with just the functionality needed for navmeshes
 *
 * @export
 * @class Vector2
 */
export default class Vector2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  equals(v) {
    return this.x === v.x && this.y === v.y;
  }

  angle(v) {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  distance(v) {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
}
