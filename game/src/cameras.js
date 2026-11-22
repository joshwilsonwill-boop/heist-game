// Wall cameras: fixed mounts that sweep a fixed arc on a timer. Same
// spotting rule as a guard, but the camera never moves and never blinks.

import { canSee } from './sight.js';

export class Camera {
  constructor(def) {
    this.name = def.name;
    this.x = def.x;
    this.y = def.y;
    this.from = def.from;
    this.to = def.to;
    this.period = def.period;
    this.range = def.range;
    this.halfAngle = def.halfAngle;
    this.time = Math.random() * def.period;
    this.angle = def.from;
    this.seesThief = false;
  }

  reset() {
    this.time = 0;
    this.angle = this.from;
    this.seesThief = false;
  }

  // Park the sweep partway through its arc, for staged screenshots.
  placeAt(frac) {
    this.time = this.period * frac;
    const mid = (this.from + this.to) / 2;
    const amp = (this.to - this.from) / 2;
    this.angle = mid + Math.sin((this.time / this.period) * Math.PI * 2) * amp;
  }

  update(dt) {
    this.time += dt;
    const mid = (this.from + this.to) / 2;
    const amp = (this.to - this.from) / 2;
    this.angle = mid + Math.sin((this.time / this.period) * Math.PI * 2) * amp;
  }

  spots(thief, walls, smokes) {
    this.seesThief = canSee(
      this.x, this.y, this.angle, this.range, this.halfAngle,
      thief.x, thief.y, walls, smokes,
    );
    return this.seesThief;
  }
}
