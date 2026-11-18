// Starfall Harvest: the loop that ties input, world and rendering together.
// Catch falling stars in your harvester, dodge the meteors, build combos
// and reach 500 points to complete the harvest before your 3 lives run out.

import { CONFIG } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { makeSky } from './world.js';
import { World, PHASE } from './world.js';
import { Renderer } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const muteBtn = document.getElementById('muteBtn');
const statusEl = document.getElementById('status');

const world = new World();
const sky = makeSky(20261118);
const renderer = new Renderer(ctx, sky);
const input = new Input(canvas);
const sounds = new SoundBank();

try {
  world.best = Number(window.localStorage.getItem(CONFIG.storageKey) || '0') || 0;
} catch (e) {
  world.best = 0;
}

function saveBest() {
  try {
    window.localStorage.setItem(CONFIG.storageKey, String(Math.max(world.best, world.score)));
  } catch (e) {
    // Private mode or blocked storage: the best score simply does not persist.
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function startGame() {
  sounds.ensure();
  sounds.click();
  world.start();
  saveBest();
  pauseBtn.textContent = 'II Pause';
  startBtn.hidden = true;
  setStatus('Catch the stars. Dodge the meteors.');
}

function togglePause() {
  if (world.phase === PHASE.PLAYING) {
    world.phase = PHASE.PAUSED;
    pauseBtn.textContent = '▶ Resume';
    setStatus('Paused.');
  } else if (world.phase === PHASE.PAUSED) {
    world.phase = PHASE.PLAYING;
    pauseBtn.textContent = 'II Pause';
    setStatus('Catch the stars. Dodge the meteors.');
  }
}

function toggleMute() {
  sounds.ensure();
  const muted = sounds.toggleMute();
  muteBtn.textContent = muted ? '♪ Muted' : '♪ Sound';
}

function restart() {
  if (world.phase === PHASE.WIN || world.phase === PHASE.OVER || world.phase === PHASE.MENU) {
    startGame();
  }
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
muteBtn.addEventListener('click', toggleMute);

canvas.addEventListener('click', () => {
  sounds.ensure();
  if (world.phase === PHASE.MENU || world.phase === PHASE.WIN || world.phase === PHASE.OVER) {
    // Clicking the canvas on an overlay screen starts (or restarts) the game.
    if (world.phase !== PHASE.PLAYING) restart();
  }
});

// A seeded screenshot pose, when the URL asks for one: ?shot=start|play|win|end
const shotMode = applyShot(world, new URLSearchParams(window.location.search));
if (shotMode) {
  startBtn.hidden = true;
  pauseBtn.hidden = true;
  muteBtn.hidden = true;
}

let last = performance.now();
let t = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  t += dt;

  if (input.consume('Space') || input.consume('Enter')) {
    if (world.phase === PHASE.MENU || world.phase === PHASE.WIN || world.phase === PHASE.OVER) {
      startGame();
    }
  }
  if (input.consume('KeyP') || input.consume('Escape')) togglePause();
  if (input.consume('KeyM')) toggleMute();
  if (input.consume('KeyR')) restart();
  if (input.consume('KeyC') && world.phase === PHASE.WIN) {
    world.phase = PHASE.PLAYING;
    setStatus('Endless mode — keep harvesting!');
  }

  if (world.phase === PHASE.PLAYING && !shotMode) {
    const steer = input.steer(world.playerX, CONFIG.width);
    const prevX = world.playerX;
    world.playerX += steer * CONFIG.playerSpeed * dt;
    world.playerX = Math.max(CONFIG.playerWidth / 2, Math.min(CONFIG.width - CONFIG.playerWidth / 2, world.playerX));
    world.playerTilt = (world.playerX - prevX) / Math.max(dt, 0.001) / CONFIG.playerSpeed;
    world.update(dt, Math.random, sounds);
    if (world.phase === PHASE.OVER || world.phase === PHASE.WIN) saveBest();
  } else if (world.phase === PHASE.PLAYING && shotMode) {
    // A posed frame stays frozen so its screenshot is stable.
  }

  // The background sky keeps twinkling even on the menu.
  renderer.draw(world, t, sounds.muted);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
