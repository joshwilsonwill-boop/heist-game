// Keyboard and mouse state for the heist. Keys are tracked by code so
// WASD and arrows both steer the thief. Edge-triggered actions (grab,
// smoke, start, restart) are consumed once per press.

export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.mouse = { x: 0, y: 0, clicked: false };
    this.onFirstGesture = null;
    this._onKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.down.has(e.code)) this.pressed.add(e.code);
      this.down.add(e.code);
      if (this.onFirstGesture) this.onFirstGesture();
    };
    this._onKeyUp = (e) => {
      this.down.delete(e.code);
    };
    this._onMouseMove = (e) => {
      const r = e.target.getBoundingClientRect ? e.target.getBoundingClientRect() : null;
      this.mouse.x = r ? e.clientX - r.left : e.clientX;
      this.mouse.y = r ? e.clientY - r.top : e.clientY;
    };
    this._onMouseDown = (e) => {
      this.mouse.clicked = true;
      if (this.onFirstGesture) this.onFirstGesture();
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
  }

  axis() {
    let x = 0;
    let y = 0;
    if (this.down.has('KeyA') || this.down.has('ArrowLeft')) x -= 1;
    if (this.down.has('KeyD') || this.down.has('ArrowRight')) x += 1;
    if (this.down.has('KeyW') || this.down.has('ArrowUp')) y -= 1;
    if (this.down.has('KeyS') || this.down.has('ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) {
      const n = Math.hypot(x, y);
      x /= n;
      y /= n;
    }
    return { x, y };
  }

  // True once for the frame after the key went down.
  take(code) {
    if (this.pressed.has(code)) {
      this.pressed.delete(code);
      return true;
    }
    return false;
  }

  takeClick() {
    const c = this.mouse.clicked;
    this.mouse.clicked = false;
    return c;
  }

  endFrame() {
    this.pressed.clear();
  }
}
