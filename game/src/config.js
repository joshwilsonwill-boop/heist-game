// Eko Vault: Night Heist - level layout and tuning.
// One big vault floor, 1280 by 720. The HUD occupies the top 56 pixels;
// the play area runs from y 56 to y 720. Every number here is a plain
// layout choice, so the level is identical on every load.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const HUD_H = 56;

// Cover the thief can hide behind. Axis aligned rectangles in play-area
// coordinates. Guards and cameras cannot see through them.
export const WALLS = [
  { x: 60, y: 120, w: 180, h: 60 },   // vault shelves, upper left
  { x: 60, y: 220, w: 180, h: 60 },   // vault shelves, lower left
  { x: 560, y: 300, w: 60, h: 140 },  // central pillar
  { x: 980, y: 180, w: 180, h: 50 },  // desks, upper right
  { x: 980, y: 300, w: 180, h: 50 },  // desks, lower right
  { x: 340, y: 420, w: 90, h: 70 },   // crate, lower middle left
  { x: 760, y: 480, w: 90, h: 70 },   // crate, lower middle right
  { x: 1080, y: 90, w: 140, h: 18 },  // vault alcove lintel
];

// Guards patrol between waypoints, pause at each end and sweep their cone
// while they wait. Facing follows movement while walking.
export const GUARDS = [
  {
    name: 'Guard A',
    waypoints: [{ x: 300, y: 200 }, { x: 900, y: 200 }],
    speed: 55,
    pause: 1.0,
    sweep: 0.8,
    range: 220,
    halfAngle: 0.56,
    color: '#4a6fa5',
  },
  {
    name: 'Guard B',
    waypoints: [{ x: 700, y: 120 }, { x: 700, y: 560 }],
    speed: 50,
    pause: 1.2,
    sweep: 0.9,
    range: 220,
    halfAngle: 0.56,
    color: '#5a7fb5',
  },
  {
    name: 'Guard C',
    waypoints: [{ x: 200, y: 580 }, { x: 1100, y: 580 }],
    speed: 65,
    pause: 0.8,
    sweep: 0.7,
    range: 200,
    halfAngle: 0.56,
    color: '#3f6395',
  },
];

// Wall cameras sweep a fixed arc from a fixed mount.
export const CAMERAS = [
  {
    name: 'Cam 1',
    x: 640,
    y: 66,
    from: Math.PI * 0.32,
    to: Math.PI * 0.68,
    period: 4.0,
    range: 300,
    halfAngle: 0.38,
  },
  {
    name: 'Cam 2',
    x: 1270,
    y: 380,
    from: Math.PI * 0.82,
    to: Math.PI * 1.18,
    period: 5.0,
    range: 280,
    halfAngle: 0.38,
  },
];

// Loot scattered around the floor. The vault core is the main target:
// the exit only opens the win once the core is taken.
export const LOOT = [
  { id: 'cash1', kind: 'cash', x: 150, y: 320, value: 100, label: 'Cash' },
  { id: 'cash2', kind: 'cash', x: 420, y: 620, value: 100, label: 'Cash' },
  { id: 'jewels', kind: 'jewels', x: 700, y: 420, value: 150, label: 'Jewels' },
  { id: 'gold', kind: 'gold', x: 900, y: 150, value: 250, label: 'Gold bar' },
  { id: 'core', kind: 'core', x: 1150, y: 130, value: 500, label: 'Vault core' },
];

export const THIEF_START = { x: 120, y: 650 };
export const THIEF_SPEED = 175;
export const THIEF_RADIUS = 14;

export const EXIT = { x: 540, y: 686, w: 200, h: 26 };

export const ALARM_RISE = 45; // per second while any spotter sees the thief
export const ALARM_FALL = 18; // per second while unseen
export const ALARM_MAX = 100;

export const SMOKE_START = 2; // charges
export const SMOKE_COST = 25; // score per puff
export const SMOKE_RADIUS = 95;
export const SMOKE_TIME = 3.5;

export const GRAB_RANGE = 36;
