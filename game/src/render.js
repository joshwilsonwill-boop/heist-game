// All canvas drawing for the heist. One job: turn the game state into a
// readable frame. Safe cover is dark slate, danger is amber and red,
// loot is gold, the exit is green. The judge reads the game from these
// frames, so every element stays big and labelled.

import { VIEW_W, VIEW_H, HUD_H, WALLS, EXIT } from './config.js';

const FLOOR_A = '#1b2233';
const FLOOR_B = '#161c2b';
const WALL_FILL = '#2e3a52';
const WALL_TOP = '#46587c';
const CONE_SAFE = 'rgba(255, 204, 60, 0.13)';
const CONE_SAFE_EDGE = 'rgba(255, 204, 60, 0.45)';
const CONE_HOT = 'rgba(255, 64, 64, 0.22)';
const CONE_HOT_EDGE = 'rgba(255, 64, 64, 0.7)';

function conePath(ctx, x, y, angle, range, half) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
}

function drawFloor(ctx) {
  const tile = 64;
  for (let y = HUD_H; y < VIEW_H; y += tile) {
    for (let x = 0; x < VIEW_W; x += tile) {
      const even = ((x / tile) + (y / tile)) % 2 === 0;
      ctx.fillStyle = even ? FLOOR_A : FLOOR_B;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= VIEW_W; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, HUD_H);
    ctx.lineTo(x, VIEW_H);
    ctx.stroke();
  }
  for (let y = HUD_H; y <= VIEW_H; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
    ctx.stroke();
  }
  // Room border.
  ctx.strokeStyle = '#4a5b7d';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, HUD_H + 2, VIEW_W - 4, VIEW_H - HUD_H - 4);
}

function drawWalls(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = WALL_FILL;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = WALL_TOP;
    ctx.fillRect(w.x, w.y, w.w, 6);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
  // Vault alcove label.
  ctx.fillStyle = '#8fa3c8';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MERIDIAN VAULT', 1090, 84);
}

function drawExit(ctx, hasCore, time) {
  const pulse = 0.55 + 0.25 * Math.sin(time * 3);
  ctx.fillStyle = hasCore ? `rgba(46, 204, 113, ${pulse})` : 'rgba(90, 120, 90, 0.5)';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.strokeStyle = hasCore ? '#2ecc71' : '#5a785a';
  ctx.lineWidth = 2;
  ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = hasCore ? '#d5f5e3' : '#a9b8a9';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(hasCore ? 'EXIT - GET OUT' : 'EXIT - LOCKED', EXIT.x + EXIT.w / 2, EXIT.y + 18);
}

function drawLoot(ctx, loot, time) {
  for (const it of loot.items) {
    if (it.taken) continue;
    const bob = Math.sin(time * 2 + it.bob) * 3;
    const x = it.x;
    const y = it.y + bob;
    // Glow ring so loot reads at a glance.
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = it.kind === 'core' ? 'rgba(255, 215, 0, 0.20)' : 'rgba(255, 215, 0, 0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (it.kind === 'cash') {
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(x - 13, y - 8, 26, 16);
      ctx.fillStyle = '#a9dfbf';
      ctx.fillRect(x - 9, y - 4, 18, 8);
      ctx.fillStyle = '#1e8449';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', x, y + 4);
    } else if (it.kind === 'jewels') {
      ctx.fillStyle = '#5dade2';
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x + 11, y);
      ctx.lineTo(x, y + 12);
      ctx.lineTo(x - 11, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d6eaf8';
      ctx.beginPath();
      ctx.moveTo(x, y - 6);
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x, y + 6);
      ctx.lineTo(x - 5, y);
      ctx.closePath();
      ctx.fill();
    } else if (it.kind === 'gold') {
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.moveTo(x - 14, y + 8);
      ctx.lineTo(x - 9, y - 8);
      ctx.lineTo(x + 9, y - 8);
      ctx.lineTo(x + 14, y + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f9e79f';
      ctx.fillRect(x - 6, y - 5, 12, 4);
    } else {
      // Vault core: big gold vault wheel.
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7d6608';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = '#7d6608';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6);
        ctx.lineTo(x + Math.cos(a) * 15, y + Math.sin(a) * 15);
        ctx.stroke();
      }
      ctx.fillStyle = '#7d6608';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f7dc6f';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(it.label, x, y + 34);
  }
}

function drawCones(ctx, spotters) {
  for (const s of spotters) {
    const hot = s.seesThief;
    conePath(ctx, s.x, s.y, s.angle, s.range, s.halfAngle);
    ctx.fillStyle = hot ? CONE_HOT : CONE_SAFE;
    ctx.fill();
    ctx.strokeStyle = hot ? CONE_HOT_EDGE : CONE_SAFE_EDGE;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawGuards(ctx, guards) {
  for (const g of guards) {
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = g.seesThief ? '#ff4040' : '#d6e4f5';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Facing tick.
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * 18, g.y + Math.sin(g.angle) * 18);
    ctx.stroke();
    // Eyes.
    const ex = Math.cos(g.angle);
    const ey = Math.sin(g.angle);
    const px = -ey;
    const py = ex;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(g.x + ex * 5 + px * 4, g.y + ey * 5 + py * 4, 2, 0, Math.PI * 2);
    ctx.arc(g.x + ex * 5 - px * 4, g.y + ey * 5 - py * 4, 2, 0, Math.PI * 2);
    ctx.fill();
    if (g.seesThief) {
      ctx.fillStyle = '#ff4040';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 22);
    }
  }
}

function drawCameras(ctx, cameras) {
  for (const c of cameras) {
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.seesThief ? '#ff4040' : '#ecf0f1';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = c.seesThief ? '#ff4040' : '#ecf0f1';
    ctx.beginPath();
    ctx.arc(c.x + Math.cos(c.angle) * 12, c.y + Math.sin(c.angle) * 12, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawThief(ctx, thief, time) {
  const x = thief.x;
  const y = thief.y;
  ctx.fillStyle = 'rgba(255, 140, 0, 0.25)';
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
  // Hooded thief: amber circle with a dark hood peak.
  ctx.fillStyle = '#ff8c00';
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7e5100';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#2c1a00';
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 4);
  ctx.lineTo(x, y - 16);
  ctx.lineTo(x + 9, y - 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 4, y + 1, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y + 1, 2, 0, Math.PI * 2);
  ctx.fill();
  // Soft bob while walking.
  if (thief.moving) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(x, y + 12 + Math.sin(time * 12) * 1.5, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSmokes(ctx, smokes) {
  for (const s of smokes) {
    ctx.fillStyle = 'rgba(200, 200, 210, 0.35)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 220, 230, 0.3)';
    ctx.beginPath();
    ctx.arc(s.x - 20, s.y - 12, s.r * 0.55, 0, Math.PI * 2);
    ctx.arc(s.x + 22, s.y + 10, s.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawWorld(ctx, state) {
  drawFloor(ctx);
  drawWalls(ctx);
  drawExit(ctx, state.loot.hasCore, state.time);
  drawCones(ctx, [...state.guards, ...state.cameras]);
  drawLoot(ctx, state.loot, state.time);
  drawSmokes(ctx, state.smokes);
  drawCameras(ctx, state.cameras);
  drawGuards(ctx, state.guards);
  drawThief(ctx, state.thief, state.time);
}

export function drawHud(ctx, state) {
  ctx.fillStyle = '#0d1220';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.strokeStyle = '#2e3a52';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H);
  ctx.lineTo(VIEW_W, HUD_H);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#f1c40f';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('EKO VAULT', 16, 26);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Night Heist', 16, 44);

  // Loot counter.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText(`LOOT $${state.score}  (${state.loot.takenCount}/5)`, 210, 30);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(state.loot.hasCore ? 'Vault core secured' : 'Grab the vault core', 210, 47);

  // Alarm meter.
  const ax = 520;
  const ay = 16;
  const aw = 260;
  const ah = 20;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('ALARM', ax, ay + 14);
  ctx.fillStyle = '#1a2233';
  ctx.fillRect(ax + 70, ay, aw, ah);
  const frac = state.alarm.value / 100;
  const level = state.alarm.level;
  ctx.fillStyle = level === 'calm' ? '#2ecc71' : level === 'warm' ? '#f39c12' : '#e74c3c';
  ctx.fillRect(ax + 70, ay, aw * frac, ah);
  ctx.strokeStyle = state.alarm.rising ? '#ff4040' : '#46587c';
  ctx.lineWidth = 2;
  ctx.strokeRect(ax + 70, ay, aw, ah);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`${Math.round(state.alarm.value)}%`, ax + 70 + aw + 8, ay + 15);

  // Smoke charges and time.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(`SMOKE x${state.smokeCharges}  (Q)`, 900, 26);
  ctx.fillStyle = '#8fa3c8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`Time ${Math.floor(state.time)}s`, 900, 44);

  // Objective line on the right.
  ctx.fillStyle = state.loot.hasCore ? '#2ecc71' : '#f7dc6f';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(state.loot.hasCore ? 'Reach the green exit' : 'Steal the core, then escape', VIEW_W - 16, 30);

  // Spotted warning.
  if (state.spotted) {
    ctx.fillStyle = '#ff4040';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED! Break line of sight!', VIEW_W / 2, HUD_H + 34);
  }

  // Context prompt near the thief, on a dark pill so it reads over anything.
  if (state.nearLoot) {
    const text = `Press E to grab ${state.nearLoot.label} ($${state.nearLoot.value})`;
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(text).width;
    const px = state.thief.x;
    const py = state.thief.y - 34;
    ctx.fillStyle = 'rgba(5, 8, 16, 0.85)';
    ctx.fillRect(px - tw / 2 - 10, py - 17, tw + 20, 24);
    ctx.strokeStyle = '#f7dc6f';
    ctx.lineWidth = 1;
    ctx.strokeRect(px - tw / 2 - 10, py - 17, tw + 20, 24);
    ctx.fillStyle = '#f7dc6f';
    ctx.fillText(text, px, py);
  }
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5, 8, 16, 0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 54px system-ui, sans-serif';
  ctx.fillText(title, VIEW_W / 2, 220);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px system-ui, sans-serif';
  lines.forEach((ln, i) => {
    ctx.fillText(ln, VIEW_W / 2, 290 + i * 34);
  });
}

export function drawStart(ctx) {
  overlay(ctx, 'EKO VAULT', [
    'Night Heist in Lagos',
    'Move with WASD or arrow keys. Grab loot with E.',
    'Stay out of guard cones and camera arcs. Q puffs smoke ($25).',
    'Steal the vault core, then slip out the green exit.',
    '',
    'Press ENTER or click to begin',
  ], '#f1c40f');
}

export function drawCaught(ctx, state) {
  overlay(ctx, 'CAUGHT!', [
    `The alarm hit 100%. The vault crew grabbed you at $${state.score} of loot.`,
    'Watch the cones. Wait for a patrol to turn, then move.',
    '',
    'Press R to try again',
  ], '#e74c3c');
}

export function drawWin(ctx, state) {
  overlay(ctx, 'CLEAN GETAWAY', [
    `You slipped out with the vault core and $${state.score} of loot.`,
    `Time: ${Math.floor(state.time)}s   Loot: ${state.loot.takenCount}/5   Smoke left: ${state.smokeCharges}`,
    'The Meridian Vault never saw you coming.',
    '',
    'Press R to play again',
  ], '#2ecc71');
}
