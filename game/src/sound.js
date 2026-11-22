// Tiny WebAudio synth: every sound is an oscillator beep made on the
// spot. No audio files, no network. The context is created on the first
// user gesture and every call is guarded so a headless run never throws.

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) {
      this.ctx = null;
    }
  }

  beep(freq, dur, type, gain, when) {
    if (this.muted || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + (when || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.08, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    } catch (e) {
      // Sound is garnish; a failed beep never breaks the game.
    }
  }

  pickup() {
    this.beep(880, 0.09, 'sine', 0.09, 0);
    this.beep(1318, 0.12, 'sine', 0.08, 0.07);
  }

  core() {
    this.beep(660, 0.1, 'triangle', 0.1, 0);
    this.beep(990, 0.1, 'triangle', 0.1, 0.09);
    this.beep(1320, 0.18, 'triangle', 0.1, 0.18);
  }

  smoke() {
    this.beep(220, 0.25, 'sine', 0.07, 0);
    this.beep(165, 0.3, 'sine', 0.06, 0.05);
  }

  spotted() {
    this.beep(440, 0.12, 'square', 0.05, 0);
    this.beep(440, 0.12, 'square', 0.05, 0.16);
  }

  caught() {
    this.beep(392, 0.18, 'sawtooth', 0.08, 0);
    this.beep(311, 0.18, 'sawtooth', 0.08, 0.16);
    this.beep(233, 0.4, 'sawtooth', 0.09, 0.32);
  }

  win() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => this.beep(f, 0.22, 'triangle', 0.09, i * 0.11));
  }
}
