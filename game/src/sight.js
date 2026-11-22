// Line of sight: the only question guards and cameras ask. A ray from an
// eye to the thief is blocked by any cover rectangle or by a smoke puff
// (a circle the ray passes through). Angles are standard canvas angles,
// y pointing down.

// Liang-Barsky clip: does segment (x1,y1)-(x2,y2) cross rectangle r?
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

// Does segment (x1,y1)-(x2,y2) pass through circle (cx,cy,r)?
export function segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = 0;
  if (len2 > 0) {
    t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
  }
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  const ddx = px - cx;
  const ddy = py - cy;
  return ddx * ddx + ddy * ddy <= r * r;
}

// True when the eye at (ex,ey) can see point (tx,ty): inside the cone
// (range and half angle around facing) and no wall or smoke in the way.
export function canSee(ex, ey, facing, range, halfAngle, tx, ty, walls, smokes) {
  const dx = tx - ex;
  const dy = ty - ey;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist > 1) {
    let diff = Math.atan2(dy, dx) - facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > halfAngle) return false;
  }
  for (const w of walls) {
    if (segmentHitsRect(ex, ey, tx, ty, w)) return false;
  }
  for (const s of smokes) {
    if (segmentHitsCircle(ex, ey, tx, ty, s.x, s.y, s.r)) return false;
  }
  return true;
}

// Circle (the thief) against a rectangle: push the circle out so it
// cannot pass through cover. Returns the corrected position.
export function resolveCircleRect(px, py, radius, r) {
  const nx = Math.max(r.x, Math.min(px, r.x + r.w));
  const ny = Math.max(r.y, Math.min(py, r.y + r.h));
  const dx = px - nx;
  const dy = py - ny;
  const d2 = dx * dx + dy * dy;
  if (d2 >= radius * radius) return { x: px, y: py };
  if (d2 > 0.0001) {
    const d = Math.sqrt(d2);
    return { x: nx + (dx / d) * radius, y: ny + (dy / d) * radius };
  }
  // Centre inside the rectangle: push out along the smallest exit.
  const left = px - r.x;
  const right = r.x + r.w - px;
  const top = py - r.y;
  const bottom = r.y + r.h - py;
  const m = Math.min(left, right, top, bottom);
  if (m === left) return { x: r.x - radius, y: py };
  if (m === right) return { x: r.x + r.w + radius, y: py };
  if (m === top) return { x: px, y: r.y - radius };
  return { x: px, y: r.y + r.h + radius };
}
