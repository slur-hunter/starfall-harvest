// Starfall Harvest: tuning and palette in one place.
// Every number that shapes how the game feels lives here so the rest of
// the code reads as rules, not magic numbers.

export const CONFIG = {
  width: 960,
  height: 640,
  groundY: 592,
  playerY: 548,
  playerSpeed: 520,
  playerWidth: 96,
  playerHeight: 26,
  startLives: 3,
  maxLives: 5,
  winScore: 500,
  levelEvery: 10,
  spawn: {
    startInterval: 0.95,
    minInterval: 0.34,
    intervalStep: 0.055,
    meteorChance: 0.16,
    meteorStep: 0.012,
    cometChance: 0.05,
    heartChance: 0.03,
  },
  fall: {
    starMin: 130,
    starMax: 210,
    speedStep: 14,
    meteorMin: 190,
    meteorMax: 300,
  },
  score: {
    star: 10,
    comet: 50,
    heart: 0,
    comboMax: 5,
  },
  storageKey: 'starfall-harvest-best',
};

export const PALETTE = {
  skyTop: '#0b1030',
  skyMid: '#1b2456',
  skyBottom: '#3a2a6e',
  hillFar: '#241d4d',
  hillNear: '#171238',
  ground: '#0e0a26',
  starGold: '#ffd54a',
  starAmber: '#ffb02e',
  cometCyan: '#5ef2e0',
  heartPink: '#ff6b9d',
  meteorRed: '#ff5a3c',
  meteorRock: '#8a4a3a',
  playerGlow: '#7ee7ff',
  playerBody: '#2dd4ff',
  playerTrim: '#ffe066',
  text: '#f4f1ff',
  textDim: '#b9b3e0',
  panel: 'rgba(10, 12, 40, 0.72)',
  panelEdge: 'rgba(126, 231, 255, 0.35)',
};
