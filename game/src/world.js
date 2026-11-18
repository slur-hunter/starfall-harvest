// Starfall Harvest: the world and its rules.
// A falling object is a star to catch, a meteor to dodge, a comet worth
// fifty, or a heart that gives a life back. Catching stars builds a combo
// multiplier; missing one or taking a meteor hit breaks it.

import { CONFIG } from './config.js';
import { mulberry32, range } from './random.js';

export const PHASE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WIN: 'win',
  OVER: 'over',
};

export function makeSky(seed) {
  const rng = mulberry32(seed);
  const stars = [];
  for (let i = 0; i < 130; i++) {
    stars.push({
      x: rng() * CONFIG.width,
      y: rng() * CONFIG.height,
      r: 0.6 + rng() * 1.6,
      twinkle: rng() * Math.PI * 2,
      speed: 0.4 + rng() * 1.4,
    });
  }
  const nebulae = [];
  for (let i = 0; i < 5; i++) {
    nebulae.push({
      x: rng() * CONFIG.width,
      y: rng() * CONFIG.height * 0.55,
      r: 90 + rng() * 130,
      hue: [265, 200, 320, 180, 20][i],
      alpha: 0.05 + rng() * 0.05,
    });
  }
  return { stars, nebulae };
}

export class World {
  constructor() {
    this.reset();
  }

  reset() {
    this.phase = PHASE.MENU;
    this.score = 0;
    this.best = 0;
    this.lives = CONFIG.startLives;
    this.level = 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.caught = 0;
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.playerX = CONFIG.width / 2;
    this.playerTilt = 0;
    this.falling = [];
    this.particles = [];
    this.floats = [];
    this.shake = 0;
    this.flash = 0;
    this.banner = null;
    this.bannerTimer = 0;
  }

  start() {
    const best = this.best;
    this.reset();
    this.best = best;
    this.phase = PHASE.PLAYING;
  }

  spawnInterval() {
    const s = CONFIG.spawn;
    return Math.max(s.minInterval, s.startInterval - (this.level - 1) * s.intervalStep);
  }

  meteorChance() {
    const s = CONFIG.spawn;
    return Math.min(0.34, s.meteorChance + (this.level - 1) * s.meteorStep);
  }

  spawnOne(rng) {
    const roll = rng();
    const s = CONFIG.spawn;
    let kind = 'star';
    if (roll < s.heartChance) kind = 'heart';
    else if (roll < s.heartChance + s.cometChance) kind = 'comet';
    else if (roll < s.heartChance + s.cometChance + this.meteorChance()) kind = 'meteor';

    const f = CONFIG.fall;
    const speed =
      kind === 'meteor'
        ? range(rng, f.meteorMin, f.meteorMax) + (this.level - 1) * f.speedStep
        : range(rng, f.starMin, f.starMax) + (this.level - 1) * f.speedStep;
    this.falling.push({
      kind,
      x: 30 + rng() * (CONFIG.width - 60),
      y: -30,
      vy: speed,
      vx: kind === 'meteor' ? range(rng, -30, 30) : range(rng, -14, 14),
      spin: range(rng, -2.4, 2.4),
      angle: rng() * Math.PI * 2,
      size: kind === 'comet' ? 16 : kind === 'meteor' ? 15 : 12 + rng() * 5,
      wobble: rng() * Math.PI * 2,
    });
  }

  burst(x, y, color, count, speed = 160) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.7);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 40,
        life: 0.5 + Math.random() * 0.4,
        max: 0.9,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  floatText(x, y, text, color) {
    this.floats.push({ x, y, text, color, life: 1 });
  }

  showBanner(text, sub) {
    this.banner = { text, sub };
    this.bannerTimer = 2.2;
  }

  catchValue(kind) {
    if (kind === 'comet') return CONFIG.score.comet;
    if (kind === 'heart') return 0;
    return CONFIG.score.star * (1 + Math.min(this.combo, CONFIG.score.comboMax - 1) * 0.5);
  }

  update(dt, rng, sounds) {
    if (this.phase !== PHASE.PLAYING) return;
    this.elapsed += dt;
    if (this.bannerTimer > 0) this.bannerTimer -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 3);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 2.5);
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnOne(rng);
      this.spawnTimer = this.spawnInterval() * (0.75 + rng() * 0.5);
    }

    const top = CONFIG.playerY - 8;
    const bottom = CONFIG.playerY + CONFIG.playerHeight;
    const half = CONFIG.playerWidth / 2;
    for (let i = this.falling.length - 1; i >= 0; i--) {
      const o = this.falling[i];
      o.y += o.vy * dt;
      o.x += o.vx * dt + Math.sin(this.elapsed * 2 + o.wobble) * 12 * dt;
      o.angle += o.spin * dt;

      const caught = o.y > top && o.y < bottom + 14 && Math.abs(o.x - this.playerX) < half + o.size * 0.6;
      if (caught) {
        this.falling.splice(i, 1);
        this.onCatch(o, sounds);
        continue;
      }
      if (o.y > CONFIG.groundY + 10) {
        this.falling.splice(i, 1);
        if (o.kind === 'star') {
          if (this.combo > 0) this.floatText(o.x, CONFIG.groundY - 14, 'combo lost', '#b9b3e0');
          this.combo = 0;
          this.comboTimer = 0;
          sounds.missStar();
        }
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      f.y -= 42 * dt;
      f.life -= dt * 0.9;
      if (f.life <= 0) this.floats.splice(i, 1);
    }

    if (this.score > this.best) this.best = this.score;
  }

  onCatch(o, sounds) {
    if (o.kind === 'meteor') {
      this.lives -= 1;
      this.combo = 0;
      this.comboTimer = 0;
      this.shake = 1;
      this.flash = 0.7;
      this.burst(o.x, o.y, '#ff5a3c', 22, 220);
      this.floatText(o.x, o.y - 10, '-1 life', '#ff5a3c');
      sounds.hitMeteor();
      if (this.lives <= 0) {
        this.phase = PHASE.OVER;
        sounds.gameOver();
      }
      return;
    }
    if (o.kind === 'heart') {
      if (this.lives < CONFIG.maxLives) {
        this.lives += 1;
        this.floatText(o.x, o.y - 10, '+1 life', '#ff6b9d');
      } else {
        this.score += 25;
        this.floatText(o.x, o.y - 10, '+25', '#ff6b9d');
      }
      this.burst(o.x, o.y, '#ff6b9d', 14);
      sounds.catchHeart();
      return;
    }
    if (o.kind === 'comet') {
      this.score += CONFIG.score.comet;
      this.caught += 1;
      this.burst(o.x, o.y, '#5ef2e0', 20);
      this.floatText(o.x, o.y - 10, '+50 comet!', '#5ef2e0');
      sounds.catchComet();
      this.checkLevel(sounds);
      return;
    }
    const value = this.catchValue('star');
    this.score += Math.round(value);
    this.combo += 1;
    this.comboTimer = 3;
    this.caught += 1;
    this.burst(o.x, o.y, '#ffd54a', 12);
    const mult = 1 + Math.min(this.combo - 1, CONFIG.score.comboMax - 1) * 0.5;
    this.floatText(o.x, o.y - 10, `+${Math.round(value)}${mult > 1 ? ` x${mult}` : ''}`, '#ffd54a');
    sounds.catchStar(this.combo);
    this.checkLevel(sounds);
  }

  checkLevel(sounds) {
    const nextLevel = 1 + Math.floor(this.caught / CONFIG.levelEvery);
    if (nextLevel > this.level) {
      this.level = nextLevel;
      this.showBanner(`LEVEL ${this.level}`, 'the sky falls faster now');
      sounds.levelUp();
    }
    if (this.score >= CONFIG.winScore && this.phase === PHASE.PLAYING) {
      this.phase = PHASE.WIN;
      sounds.winFanfare();
    }
  }
}
