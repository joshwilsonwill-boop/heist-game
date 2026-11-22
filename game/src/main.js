// Eko Vault: Night Heist - game loop, state machine and screenshot staging.
// States: start, playing, caught, win. The thief crosses one vault floor,
// dodges guard cones and camera arcs, grabs loot and slips out the exit.

import {
  VIEW_W, VIEW_H, HUD_H, WALLS, GUARDS, CAMERAS, LOOT,
  THIEF_START, THIEF_SPEED, THIEF_RADIUS, EXIT,
  SMOKE_START, SMOKE_COST, SMOKE_RADIUS, SMOKE_TIME,
} from './config.js';
import { Input } from './input.js';
import { Sound } from './sound.js';
import { Guard } from './guards.js';
import { Camera } from './cameras.js';
import { Loot } from './loot.js';
import { Alarm } from './alarm.js';
import { resolveCircleRect } from './sight.js';
import { drawWorld, drawHud, drawStart, drawCaught, drawWin } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const input = new Input();
const sound = new Sound();
input.onFirstGesture = () => sound.unlock();

const guards = GUARDS.map((g) => new Guard(g));
const cameras = CAMERAS.map((c) => new Camera(c));
const loot = new Loot(LOOT);
const alarm = new Alarm();

const state = {
  phase: 'start',
  thief: { x: THIEF_START.x, y: THIEF_START.y, moving: false },
  smokes: [],
  smokeCharges: SMOKE_START,
  smokeSpent: 0,
  score: 0,
  time: 0,
  spotted: false,
  nearLoot: null,
  guards,
  cameras,
  loot,
  alarm,
};

function resetRun() {
  state.phase = 'playing';
  state.thief.x = THIEF_START.x;
  state.thief.y = THIEF_START.y;
  state.thief.moving = false;
  state.smokes = [];
  state.smokeCharges = SMOKE_START;
  state.smokeSpent = 0;
  state.score = 0;
  state.time = 0;
  state.spotted = false;
  state.nearLoot = null;
  for (const g of guards) g.reset();
  for (const c of cameras) c.reset();
  loot.reset();
  alarm.reset();
}

function updateScore() {
  state.score = loot.totalValue - state.smokeSpent;
}

function thiefHitsWall(x, y) {
  let p = { x, y };
  for (const w of WALLS) p = resolveCircleRect(p.x, p.y, THIEF_RADIUS, w);
  p.x = Math.max(THIEF_RADIUS, Math.min(VIEW_W - THIEF_RADIUS, p.x));
  p.y = Math.max(HUD_H + THIEF_RADIUS, Math.min(VIEW_H - THIEF_RADIUS, p.y));
  return p;
}

function update(dt) {
  state.time += dt;

  // Move the thief.
  const a = input.axis();
  state.thief.moving = a.x !== 0 || a.y !== 0;
  if (state.thief.moving) {
    const nx = state.thief.x + a.x * THIEF_SPEED * dt;
    const ny = state.thief.y + a.y * THIEF_SPEED * dt;
    const p = thiefHitsWall(nx, ny);
    state.thief.x = p.x;
    state.thief.y = p.y;
  }

  // Smoke puffs fade.
  for (const s of state.smokes) s.t -= dt;
  state.smokes = state.smokes.filter((s) => s.t > 0);

  // Patrols and cameras.
  for (const g of guards) g.update(dt);
  for (const c of cameras) c.update(dt);

  // Spotting.
  const wasSpotted = state.spotted;
  state.spotted = false;
  for (const g of guards) {
    if (g.spots(state.thief, WALLS, state.smokes)) state.spotted = true;
  }
  for (const c of cameras) {
    if (c.spots(state.thief, WALLS, state.smokes)) state.spotted = true;
  }
  if (state.spotted && !wasSpotted) sound.spotted();
  alarm.update(dt, state.spotted);

  // Grab loot with E.
  state.nearLoot = loot.nearestTo(state.thief.x, state.thief.y);
  if (input.take('KeyE') && state.nearLoot) {
    const item = loot.grab(state.nearLoot);
    updateScore();
    if (item.kind === 'core') sound.core();
    else sound.pickup();
    state.nearLoot = null;
  }

  // Smoke puff with Q: costs score, hides the thief.
  if (input.take('KeyQ')) {
    if (state.smokeCharges > 0 && state.score >= SMOKE_COST) {
      state.smokeCharges -= 1;
      state.smokeSpent += SMOKE_COST;
      updateScore();
      state.smokes.push({ x: state.thief.x, y: state.thief.y, r: SMOKE_RADIUS, t: SMOKE_TIME });
      sound.smoke();
    }
  }

  // Bumped: a guard walking into the thief spikes the alarm instead of
  // ending the run on the spot. Fair warning, and a high alarm still ends it.
  for (const g of guards) {
    if (Math.hypot(g.x - state.thief.x, g.y - state.thief.y) < 28) {
      if (state.time - (state.lastBump || -99) > 1.5) {
        state.lastBump = state.time;
        alarm.value = Math.min(100, alarm.value + 45);
        sound.spotted();
      }
    }
  }
  if (alarm.tripped) {
    state.phase = 'caught';
    sound.caught();
    return;
  }

  // Win: reach the green exit carrying the vault core.
  if (loot.hasCore) {
    const t = state.thief;
    if (t.x > EXIT.x && t.x < EXIT.x + EXIT.w && t.y > EXIT.y - 8 && t.y < EXIT.y + EXIT.h + 8) {
      state.phase = 'win';
      sound.win();
    }
  }
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawWorld(ctx, state);
  drawHud(ctx, state);
  if (state.phase === 'start') drawStart(ctx);
  if (state.phase === 'caught') drawCaught(ctx, state);
  if (state.phase === 'win') drawWin(ctx, state);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.phase === 'start') {
    if (input.take('Enter') || input.take('Space') || input.takeClick()) {
      resetRun();
    }
  } else if (state.phase === 'playing') {
    update(dt);
  } else if (input.take('KeyR') || input.take('Enter') || input.takeClick()) {
    resetRun();
  }
  render();
  input.endFrame();
  requestAnimationFrame(frame);
}

// Staged shots: ?shot=cover|near|loot|win sets a fixed, readable game
// state, paints one frame synchronously and raises __shotReady.
function stageShot(name) {
  resetRun();
  if (name === 'cover') {
    state.thief.x = 430;
    state.thief.y = 520;
    guards[0].placeAt(0.45);
    guards[1].placeAt(0.30);
    guards[2].placeAt(0.70);
    cameras[0].placeAt(0.25);
    cameras[1].placeAt(0.60);
    loot.items[0].taken = true; // cash1
    loot.items[2].taken = true; // jewels
    updateScore();
    alarm.value = 35;
    state.time = 42;
    state.phase = 'playing';
  } else if (name === 'near') {
    state.thief.x = 760;
    state.thief.y = 290;
    guards[0].placeAt(0.55);
    guards[1].placeAt(0.55);
    guards[2].placeAt(0.20);
    cameras[0].placeAt(0.5);
    cameras[1].placeAt(0.3);
    loot.items[0].taken = true;
    updateScore();
    alarm.value = 62;
    state.spotted = true;
    state.time = 71;
    state.phase = 'playing';
  } else if (name === 'loot') {
    state.thief.x = 1110;
    state.thief.y = 160;
    guards[0].placeAt(0.15);
    guards[1].placeAt(0.80);
    guards[2].placeAt(0.45);
    cameras[0].placeAt(0.75);
    cameras[1].placeAt(0.15);
    loot.items[0].taken = true;
    loot.items[1].taken = true;
    updateScore();
    alarm.value = 18;
    state.nearLoot = loot.items.find((i) => i.id === 'core');
    state.time = 58;
    state.phase = 'playing';
  } else if (name === 'win') {
    for (const it of loot.items) it.taken = true;
    state.smokeCharges = 0;
    state.smokeSpent = 50;
    updateScore();
    state.time = 96;
    state.phase = 'win';
  }
  render();
  window.__shotReady = true;
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

// Debug read-out for automated playtests. Read-only; the game never reads it.
window.__heist = {
  get phase() { return state.phase; },
  get thief() { return { x: state.thief.x, y: state.thief.y }; },
  get alarm() { return alarm.value; },
  get score() { return state.score; },
  get time() { return state.time; },
  get lootTaken() { return loot.takenCount; },
  get hasCore() { return loot.hasCore; },
  get guards() { return guards.map((g) => ({ x: g.x, y: g.y, angle: g.angle, sees: g.seesThief })); },
  get cameras() { return cameras.map((c) => ({ x: c.x, y: c.y, angle: c.angle, sees: c.seesThief })); },
};

if (shot) {
  stageShot(shot);
} else {
  requestAnimationFrame(frame);
}
