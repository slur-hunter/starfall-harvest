// Screenshot poses: deterministic scenes for the entry's screenshots.
// ?shot=start renders the title screen, ?shot=play a busy mid-game frame,
// ?shot=win the victory screen and ?shot=end the game-over screen, all
// from a fixed seed so the same URL always renders the same picture.
// Normal play ignores these parameters entirely.

import { CONFIG } from './config.js';
import { mulberry32, range } from './random.js';
import { PHASE } from './world.js';

export function applyShot(world, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  const seed = Number(params.get('seed') || '7');
  const rng = mulberry32(seed);

  if (shot === 'start') {
    world.phase = PHASE.MENU;
    world.best = 240;
    return true;
  }
  if (shot === 'win') {
    world.phase = PHASE.WIN;
    world.score = 520;
    world.best = 520;
    world.level = 4;
    world.caught = 41;
    return true;
  }
  if (shot === 'end') {
    world.phase = PHASE.OVER;
    world.score = 180;
    world.best = 240;
    world.level = 3;
    world.caught = 17;
    world.lives = 0;
    return true;
  }
  if (shot === 'play') {
    world.phase = PHASE.PLAYING;
    world.score = 230;
    world.best = 240;
    world.level = 3;
    world.caught = 21;
    world.combo = 4;
    world.comboTimer = 2.1;
    world.lives = 2;
    world.playerX = CONFIG.width / 2 + 40;
    world.showBanner('LEVEL 3', 'the sky falls faster now');
    world.bannerTimer = 1.6;
    const kinds = ['star', 'star', 'star', 'meteor', 'star', 'comet', 'star', 'heart', 'star', 'meteor', 'star'];
    for (const kind of kinds) {
      const f = CONFIG.fall;
      world.falling.push({
        kind,
        x: 60 + rng() * (CONFIG.width - 120),
        y: 40 + rng() * 420,
        vy: range(rng, f.starMin, f.starMax),
        vx: range(rng, -14, 14),
        spin: range(rng, -2.4, 2.4),
        angle: rng() * Math.PI * 2,
        size: kind === 'comet' ? 16 : kind === 'meteor' ? 15 : 12 + rng() * 5,
        wobble: rng() * Math.PI * 2,
      });
    }
    world.burst(420, 300, '#ffd54a', 10);
    world.burst(640, 180, '#5ef2e0', 8);
    world.floatText(420, 280, '+15 x2', '#ffd54a');
    return true;
  }
  return false;
}
