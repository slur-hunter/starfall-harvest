// Synthesized sound effects with WebAudio: no audio files, no network.
// Every effect is a short oscillator envelope so the game stays fully
// self-contained. The audio context is created on the first user gesture.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, duration, type, volume, when = 0, slideTo = null) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  // Catch a star: the pitch climbs with the combo, so a streak sounds like one.
  catchStar(combo) {
    const base = 520 + Math.min(combo, 5) * 70;
    this.tone(base, 0.12, 'sine', 0.22, 0, base * 1.6);
    this.tone(base * 2, 0.08, 'triangle', 0.08);
  }

  catchComet() {
    this.tone(880, 0.16, 'sine', 0.2, 0, 1760);
    this.tone(1320, 0.2, 'sine', 0.14, 0.08, 2093);
  }

  catchHeart() {
    this.tone(523, 0.14, 'sine', 0.2);
    this.tone(659, 0.14, 'sine', 0.2, 0.1);
    this.tone(784, 0.22, 'sine', 0.2, 0.2);
  }

  hitMeteor() {
    this.tone(160, 0.28, 'sawtooth', 0.22, 0, 55);
    this.tone(90, 0.2, 'square', 0.12, 0, 45);
  }

  missStar() {
    this.tone(330, 0.14, 'sine', 0.1, 0, 220);
  }

  levelUp() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.18, i * 0.09));
  }

  winFanfare() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.24, 'triangle', 0.2, i * 0.12));
  }

  gameOver() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.18, i * 0.16));
  }

  click() {
    this.tone(700, 0.06, 'square', 0.08);
  }
}
