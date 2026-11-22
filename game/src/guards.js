// Guards: walk a fixed patrol between waypoints, pause at each end and
// sweep their vision cone while they wait. A guard spots the thief when
// the thief is inside the cone with a clear line of sight.

import { canSee } from './sight.js';

export class Guard {
  constructor(def) {
    this.name = def.name;
    this.waypoints = def.waypoints;
    this.speed = def.speed;
    this.pause = def.pause;
    this.sweep = def.sweep;
    this.range = def.range;
    this.halfAngle = def.halfAngle;
    this.color = def.color;
    this.leg = 0; // index of the waypoint we are heading for
    this.x = def.waypoints[0].x;
    this.y = def.waypoints[0].y;
    this.angle = 0;
    this.waiting = 0;
    this.waitTotal = 0;
    this.sweepPhase = Math.random() * Math.PI * 2;
    this.seesThief = false;
    this.faceBase();
  }

  faceBase() {
    const t = this.waypoints[1 % this.waypoints.length];
    this.angle = Math.atan2(t.y - this.y, t.x - this.x);
  }

  reset() {
    this.leg = 0;
    this.x = this.waypoints[0].x;
    this.y = this.waypoints[0].y;
    this.waiting = 0;
    this.seesThief = false;
    this.faceBase();
  }

  // Place the guard partway along a leg, for staged screenshots.
  placeAt(frac) {
    const a = this.waypoints[0];
    const b = this.waypoints[1 % this.waypoints.length];
    this.x = a.x + (b.x - a.x) * frac;
    this.y = a.y + (b.y - a.y) * frac;
    this.angle = Math.atan2(b.y - a.y, b.x - a.x);
    this.waiting = 0;
  }

  update(dt) {
    if (this.waiting > 0) {
      this.waiting -= dt;
      this.sweepPhase += dt;
      // Slow scan left and right while waiting at a waypoint.
      const base = this.waitBase;
      this.angle = base + Math.sin(this.sweepPhase * 1.6) * this.sweep;
      if (this.waiting <= 0) {
        this.leg = (this.leg + 1) % this.waypoints.length;
        this.faceBase();
      }
      return;
    }
    const target = this.waypoints[(this.leg + 1) % this.waypoints.length];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;
    if (dist <= step) {
      this.x = target.x;
      this.y = target.y;
      this.waiting = this.pause;
      this.waitTotal = this.pause;
      // Remember which way we were walking so the sweep pivots on it.
      this.waitBase = Math.atan2(dy, dx);
      this.angle = this.waitBase;
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      this.angle = Math.atan2(dy, dx);
    }
  }

  spots(thief, walls, smokes) {
    this.seesThief = canSee(
      this.x, this.y, this.angle, this.range, this.halfAngle,
      thief.x, thief.y, walls, smokes,
    );
    return this.seesThief;
  }
}
