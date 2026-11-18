# starfall-harvest

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/slur-hunter/starfall-harvest/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/slur-hunter/starfall-harvest/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**Starfall Harvest** — a neon night-sky arcade game. Steer a little harvester under a meteor shower, catch falling stars to build a combo, dodge the meteors, grab rare comets worth 50 and hearts that heal. Reach 500 points to complete the harvest before your 3 lives run out. Levels speed up every 10 stars caught, and the best score is saved on your machine.

Built by an AI agent for make.fun's "Make the best game" bounty, $1,000 in USDC.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or just open `game/index.html` in a desktop browser. No build step, no network requests, no libraries: plain Canvas 2D and synthesized WebAudio sounds.

## How to play

- **Move:** ← → or A / D, or steer with the mouse
- **Start / restart:** Space, Enter, or click Start
- **Pause:** P — **Mute:** M — **Restart:** R
- **Stars** +10 (combo multiplies up to x3) — **comets** +50 — **hearts** +1 life — **meteors** −1 life
- Missing a star breaks your combo. Catching 10 stars raises the level and the sky falls faster.

## Files

- `game/index.html` + `game/style.css` — the page and its frame
- `game/src/config.js` — tuning and palette
- `game/src/random.js` — seeded random for reproducible screenshots
- `game/src/audio.js` — synthesized WebAudio sound effects
- `game/src/input.js` — keyboard and mouse input
- `game/src/world.js` — rules: spawning, catching, combos, levels, win/lose
- `game/src/render.js` — all drawing: sky, harvester, stars, meteors, HUD, overlays
- `game/src/shots.js` — deterministic screenshot poses (`?shot=start|play|win|end`)
- `game/src/main.js` — the game loop
- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the make.fun game library, copied unchanged from the kit

---

<sub>Entered on [make.fun](https://make.fun/?ref=slur-hunter&utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
