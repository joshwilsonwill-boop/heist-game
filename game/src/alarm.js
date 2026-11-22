// The alarm meter: rises fast while any guard or camera sees the thief,
// falls slowly once the thief breaks line of sight and hides. At the top
// the run is over. The meter is the game's tension dial.

import { ALARM_RISE, ALARM_FALL, ALARM_MAX } from './config.js';

export class Alarm {
  constructor() {
    this.value = 0;
    this.rising = false;
  }

  reset() {
    this.value = 0;
    this.rising = false;
  }

  update(dt, spotted) {
    this.rising = spotted;
    if (spotted) {
      this.value = Math.min(ALARM_MAX, this.value + ALARM_RISE * dt);
    } else {
      this.value = Math.max(0, this.value - ALARM_FALL * dt);
    }
  }

  get tripped() {
    return this.value >= ALARM_MAX;
  }

  get level() {
    if (this.value < 40) return 'calm';
    if (this.value < 70) return 'warm';
    return 'hot';
  }
}
