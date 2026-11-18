// Starfall Harvest: every pixel the player sees.
// Canvas 2D only, no images and no fonts from the network: the whole look
// is gradients, glow and shapes, so the game renders the same offline.

import { CONFIG, PALETTE } from './config.js';
import { PHASE } from './world.js';

function starPath(ctx, x, y, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.3, y, x - s * 0.7, y - s, x, y - s * 0.25);
  ctx.bezierCurveTo(x + s * 0.7, y - s, x + s * 1.3, y, x, y + s * 0.9);
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class Renderer {
  constructor(ctx, sky) {
    this.ctx = ctx;
    this.sky = sky;
  }

  drawSky(t) {
    const { ctx } = this;
    const g = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    g.addColorStop(0, PALETTE.skyTop);
    g.addColorStop(0.55, PALETTE.skyMid);
    g.addColorStop(1, PALETTE.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    for (const n of this.sky.nebulae) {
      const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      ng.addColorStop(0, `hsla(${n.hue}, 80%, 60%, ${n.alpha})`);
      ng.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
      ctx.fillStyle = ng;
      ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
    }

    for (const s of this.sky.stars) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.speed + s.twinkle));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // The moon, low and bright, with a soft halo.
    const mg = ctx.createRadialGradient(830, 96, 10, 830, 96, 90);
    mg.addColorStop(0, 'rgba(255, 244, 200, 0.5)');
    mg.addColorStop(1, 'rgba(255, 244, 200, 0)');
    ctx.fillStyle = mg;
    ctx.fillRect(730, 0, 200, 200);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(830, 96, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 200, 140, 0.5)';
    ctx.beginPath();
    ctx.arc(818, 86, 8, 0, Math.PI * 2);
    ctx.arc(842, 106, 6, 0, Math.PI * 2);
    ctx.arc(826, 112, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHills() {
    const { ctx } = this;
    ctx.fillStyle = PALETTE.hillFar;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.groundY);
    ctx.quadraticCurveTo(180, 470, 380, CONFIG.groundY - 40);
    ctx.quadraticCurveTo(560, CONFIG.groundY - 90, 760, CONFIG.groundY - 30);
    ctx.quadraticCurveTo(880, CONFIG.groundY - 55, 960, CONFIG.groundY - 10);
    ctx.lineTo(960, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = PALETTE.hillNear;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.groundY);
    ctx.quadraticCurveTo(240, CONFIG.groundY - 34, 520, CONFIG.groundY - 6);
    ctx.quadraticCurveTo(760, CONFIG.groundY - 26, 960, CONFIG.groundY);
    ctx.lineTo(960, CONFIG.groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = PALETTE.ground;
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, CONFIG.height - CONFIG.groundY);
    ctx.fillStyle = 'rgba(126, 231, 255, 0.18)';
    ctx.fillRect(0, CONFIG.groundY, CONFIG.width, 2);
  }

  drawPlayer(world, t) {
    const { ctx } = this;
    const x = world.playerX;
    const y = CONFIG.playerY;
    const tilt = world.playerTilt * 0.14;
    const bob = Math.sin(t * 3) * 2;

    ctx.save();
    ctx.translate(x, y + bob);
    ctx.rotate(tilt);
    ctx.shadowColor = PALETTE.playerGlow;
    ctx.shadowBlur = 22;

    // The harvester: a glowing skiff with a basket and a little lantern.
    ctx.fillStyle = PALETTE.playerBody;
    ctx.beginPath();
    ctx.moveTo(-CONFIG.playerWidth / 2, -6);
    ctx.quadraticCurveTo(0, 22, CONFIG.playerWidth / 2, -6);
    ctx.quadraticCurveTo(0, 2, -CONFIG.playerWidth / 2, -6);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = PALETTE.playerTrim;
    ctx.fillRect(-CONFIG.playerWidth / 2 + 6, -8, CONFIG.playerWidth - 12, 4);
    ctx.fillStyle = '#0b1030';
    ctx.beginPath();
    ctx.arc(-26, -12, 5, 0, Math.PI * 2);
    ctx.arc(0, -14, 5, 0, Math.PI * 2);
    ctx.arc(26, -12, 5, 0, Math.PI * 2);
    ctx.fill();

    // Lantern light above the basket.
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.arc(0, -26, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9d2e';
    ctx.beginPath();
    ctx.arc(0, -26, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawFalling(o, t) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.kind === 'star') {
      ctx.rotate(Math.sin(o.angle) * 0.4);
      ctx.shadowColor = PALETTE.starGold;
      ctx.shadowBlur = 16;
      ctx.fillStyle = PALETTE.starGold;
      starPath(ctx, 0, 0, o.size);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff7d6';
      starPath(ctx, 0, 0, o.size * 0.45);
      ctx.fill();
    } else if (o.kind === 'comet') {
      ctx.rotate(o.angle);
      const trail = ctx.createLinearGradient(-o.size * 3, 0, 0, 0);
      trail.addColorStop(0, 'rgba(94, 242, 224, 0)');
      trail.addColorStop(1, 'rgba(94, 242, 224, 0.8)');
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.moveTo(-o.size * 3, -5);
      ctx.lineTo(0, 0);
      ctx.lineTo(-o.size * 3, 5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = PALETTE.cometCyan;
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#d9fff9';
      ctx.beginPath();
      ctx.arc(0, 0, o.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
    } else if (o.kind === 'heart') {
      const pulse = 1 + Math.sin(t * 6 + o.wobble) * 0.12;
      ctx.scale(pulse, pulse);
      ctx.shadowColor = PALETTE.heartPink;
      ctx.shadowBlur = 16;
      ctx.fillStyle = PALETTE.heartPink;
      heartPath(ctx, 0, 0, o.size * 0.8);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.arc(-o.size * 0.25, -o.size * 0.3, o.size * 0.16, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Meteor: a tumbling rock with a flame tail.
      ctx.rotate(o.angle);
      const flame = ctx.createLinearGradient(0, -o.size * 2.4, 0, 0);
      flame.addColorStop(0, 'rgba(255, 120, 40, 0)');
      flame.addColorStop(1, 'rgba(255, 90, 60, 0.9)');
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(-8, -o.size * 2.4);
      ctx.lineTo(8, -o.size * 2.4);
      ctx.lineTo(0, -4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = PALETTE.meteorRed;
      ctx.shadowBlur = 14;
      ctx.fillStyle = PALETTE.meteorRock;
      ctx.beginPath();
      ctx.arc(0, 0, o.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#5d2f24';
      ctx.beginPath();
      ctx.arc(-4, -3, 4, 0, Math.PI * 2);
      ctx.arc(5, 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffb03a';
      ctx.beginPath();
      ctx.arc(-2, -6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawParticles(world) {
    const { ctx } = this;
    for (const p of world.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawFloats(world) {
    const { ctx } = this;
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    for (const f of world.floats) {
      ctx.globalAlpha = Math.max(0, f.life);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  drawHud(world, muted) {
    const { ctx } = this;
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillStyle = PALETTE.panel;
    roundRect(ctx, 14, 12, 250, 64, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(`SCORE  ${world.score}`, 28, 38);
    ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillStyle = PALETTE.textDim;
    ctx.fillText(`BEST  ${Math.max(world.best, world.score)}`, 28, 60);

    // Lives as hearts, top right.
    ctx.textAlign = 'right';
    ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
    let hearts = '';
    for (let i = 0; i < CONFIG.maxLives; i++) hearts += i < world.lives ? '♥' : '♡';
    ctx.fillStyle = PALETTE.panel;
    roundRect(ctx, CONFIG.width - 264, 12, 250, 64, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.stroke();
    ctx.fillStyle = PALETTE.heartPink;
    ctx.fillText(hearts, CONFIG.width - 28, 40);
    ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillStyle = PALETTE.textDim;
    ctx.fillText(`LEVEL ${world.level}   •   GOAL ${CONFIG.winScore}`, CONFIG.width - 28, 60);

    // Combo meter under the score when a streak is alive.
    if (world.combo >= 2) {
      const mult = 1 + Math.min(world.combo - 1, CONFIG.score.comboMax - 1) * 0.5;
      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.starGold;
      ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText(`COMBO x${mult}  (${world.combo})`, 28, 100);
      ctx.fillStyle = 'rgba(255, 213, 74, 0.25)';
      roundRect(ctx, 28, 108, 120, 8, 4);
      ctx.fill();
      ctx.fillStyle = PALETTE.starGold;
      roundRect(ctx, 28, 108, 120 * Math.max(0, world.comboTimer / 3), 8, 4);
      ctx.fill();
    }

    if (muted) {
      ctx.textAlign = 'right';
      ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillStyle = PALETTE.textDim;
      ctx.fillText('muted (M)', CONFIG.width - 16, CONFIG.height - 16);
    }

    if (world.banner && world.bannerTimer > 0) {
      ctx.globalAlpha = Math.min(1, world.bannerTimer);
      ctx.textAlign = 'center';
      ctx.font = 'bold 44px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillStyle = PALETTE.starGold;
      ctx.shadowColor = PALETTE.starGold;
      ctx.shadowBlur = 24;
      ctx.fillText(world.banner.text, CONFIG.width / 2, 190);
      ctx.shadowBlur = 0;
      ctx.font = '18px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillStyle = PALETTE.text;
      ctx.fillText(world.banner.sub, CONFIG.width / 2, 220);
      ctx.globalAlpha = 1;
    }
  }

  overlay(title, lines, buttonLabel, hint) {
    const { ctx } = this;
    ctx.fillStyle = 'rgba(8, 10, 34, 0.62)';
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    const w = 620;
    const h = 380;
    const x = (CONFIG.width - w) / 2;
    const y = (CONFIG.height - h) / 2;
    ctx.fillStyle = PALETTE.panel;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.starGold;
    ctx.font = 'bold 52px "Trebuchet MS", Verdana, sans-serif';
    ctx.shadowColor = PALETTE.starGold;
    ctx.shadowBlur = 26;
    ctx.fillText(title, CONFIG.width / 2, y + 78);
    ctx.shadowBlur = 0;
    ctx.fillStyle = PALETTE.text;
    ctx.font = '19px "Trebuchet MS", Verdana, sans-serif';
    lines.forEach((line, i) => ctx.fillText(line, CONFIG.width / 2, y + 128 + i * 30));
    if (buttonLabel) {
      const bw = 260;
      const bh = 54;
      const bx = (CONFIG.width - bw) / 2;
      const by = y + h - 108;
      ctx.fillStyle = PALETTE.starGold;
      roundRect(ctx, bx, by, bw, bh, 12);
      ctx.fill();
      ctx.fillStyle = '#241a00';
      ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText(buttonLabel, CONFIG.width / 2, by + 35);
    }
    if (hint) {
      ctx.fillStyle = PALETTE.textDim;
      ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
      ctx.fillText(hint, CONFIG.width / 2, y + h - 26);
    }
  }

  draw(world, t, muted) {
    const { ctx } = this;
    ctx.save();
    if (world.shake > 0) {
      ctx.translate((Math.random() - 0.5) * world.shake * 10, (Math.random() - 0.5) * world.shake * 10);
    }
    this.drawSky(t);
    this.drawHills();
    for (const o of world.falling) this.drawFalling(o, t);
    this.drawParticles(world);
    if (world.phase !== PHASE.MENU) this.drawPlayer(world, t);
    this.drawFloats(world);
    if (world.phase === PHASE.PLAYING || world.phase === PHASE.PAUSED) this.drawHud(world, muted);
    if (world.flash > 0) {
      ctx.fillStyle = `rgba(255, 60, 40, ${world.flash * 0.22})`;
      ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
    }
    ctx.restore();

    if (world.phase === PHASE.MENU) {
      this.overlay(
        'STARFALL HARVEST',
        [
          'Catch the falling stars. Dodge the meteors.',
          'Stars build your combo — comets are worth 50, hearts heal.',
          `Reach ${CONFIG.winScore} points to complete the harvest. 3 lives.`,
        ],
        '▶  START HARVEST',
        'Move with ← → or A / D, or steer with the mouse  •  P pauses  •  M mutes',
      );
    } else if (world.phase === PHASE.PAUSED) {
      this.overlay('PAUSED', ['The sky is waiting for you.'], '▶  RESUME', 'Press P or click Resume to keep playing');
    } else if (world.phase === PHASE.WIN) {
      this.overlay(
        'HARVEST COMPLETE!',
        [
          `You gathered ${world.score} points — the night sky is yours.`,
          `Best: ${Math.max(world.best, world.score)}   •   Level ${world.level}   •   ${world.caught} caught`,
          'Keep playing in endless mode, or start a fresh harvest.',
        ],
        '↻  PLAY AGAIN',
        'Press R or Enter to restart  •  C to keep playing endlessly',
      );
    } else if (world.phase === PHASE.OVER) {
      this.overlay(
        'THE SKY WENT DARK',
        [
          `Score ${world.score}   •   Best ${Math.max(world.best, world.score)}`,
          `Level ${world.level}   •   ${world.caught} stars caught`,
          world.score >= world.best && world.score > 0 ? 'A new best — the stars remember you.' : 'So close. The next shower is already coming.',
        ],
        '↻  TRY AGAIN',
        'Press R or Enter to restart',
      );
    }
  }
}
