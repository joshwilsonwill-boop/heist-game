// Loot: cash, jewels, a gold bar and the vault core. The thief grabs one
// with E when close enough. The core is the main target; the exit only
// pays off once it is taken.

import { GRAB_RANGE } from './config.js';

export class Loot {
  constructor(defs) {
    this.items = defs.map((d) => ({ ...d, taken: false, bob: Math.random() * Math.PI * 2 }));
  }

  reset() {
    for (const it of this.items) it.taken = false;
  }

  nearestTo(x, y) {
    let best = null;
    let bestD = GRAB_RANGE;
    for (const it of this.items) {
      if (it.taken) continue;
      const d = Math.hypot(it.x - x, it.y - y);
      if (d < bestD) {
        bestD = d;
        best = it;
      }
    }
    return best;
  }

  grab(item) {
    item.taken = true;
    return item;
  }

  get takenCount() {
    return this.items.filter((i) => i.taken).length;
  }

  get totalValue() {
    return this.items.filter((i) => i.taken).reduce((s, i) => s + i.value, 0);
  }

  get hasCore() {
    const core = this.items.find((i) => i.id === 'core');
    return !!core && core.taken;
  }
}
