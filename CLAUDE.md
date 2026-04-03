# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (hot reload)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

No test runner is configured. There are no linting tools set up.

## Architecture

**Stack:** Phaser 3.80 + Vite, ES modules, no TypeScript.

**Scene flow:** `BootScene` → `MenuScene` → `GameScene` (+ `HUDScene` as parallel overlay) → `GameOverScene`

- `BootScene` loads all assets (spritesheets, audio, backgrounds). All animation definitions live here.
- `MenuScene` handles ship selection (3 tint variants) and high score display. Passes `{ ship: tintColor }` to GameScene via `scene.start`.
- `GameScene` is the main game loop. Owns all entity managers and wires them together via Phaser's arcade physics `overlap` callbacks.
- `HUDScene` runs in parallel (`scene.launch('HUD')`), listening to `GameScene` events for score, wave, lives, weapon, and boss HP updates.
- `GameOverScene` receives `{ score, stage, victory, isNewHighScore }` from GameScene.

**Entity managers** (`src/entities/`):
- `Player` — extends `Phaser.Physics.Arcade.Sprite`, owns its own bullet pool (`player.bullets`) and a `WeaponSystem` instance.
- `EnemyManager` — manages a shared physics group for enemies and a separate group for enemy bullets. 7 enemy type configs in `constants.js`.
- `AsteroidManager` — object pool for asteroids.
- `PowerUpManager` — object pool for 4 drop types (spread, laser, shield, bonus). Weighted random drop triggered by `tryDrop()`.
- `Boss` — composite entity: one main physics group holding body + cannons as separate sprites. Three attack phases based on HP thresholds (66%/33%).

**Systems** (`src/systems/`):
- `WaveManager` — state machine: `WAITING → SPAWNING → ACTIVE → CLEARED → BOSS`. Reads wave definitions from `src/config/waves.js` (3 stages × 3 waves + boss). Emits `waveStart`, `stageStart`, `bossStart`, `stageClear`, `victory` on its own EventEmitter. GameScene forwards relevant events to its own `this.events` for HUDScene to consume.
- `WeaponSystem` — strategy pattern swapping firing behavior. Three weapon types (basic, spread, laser), each with 3 upgrade levels. Weapon switch resets level to 1.
- `ScoreManager` — in-memory score + `localStorage` persistence. Saves top 10 `{ score, date, stage }` entries. Static methods `isHighScore` / `saveHighScore` are called from GameScene.

**Config** (`src/config/`):
- `constants.js` — all tunable values: speeds, fire rates, enemy HP/score, STAGES array (bgBack/bgStars keys, difficulty multiplier, clearBonus), power-up weights.
- `waves.js` — wave definitions: enemy compositions (type + count + formation) and asteroid counts per wave.

**Key patterns:**
- **Deferred kill queue**: Killing physics bodies mid-overlap callback crashes Phaser. GameScene queues kills in `postPhysicsQueue` and flushes them after each `worldstep`.
- **Depth layers**: bg=0/1, enemies≈5, player=10, shield=11, HUD FX=15, boss=20, overlays=50/51.
- **Stage background swap**: On `stageClear`, GameScene destroys the current tileSprites and creates new ones using the next stage's `bgBack`/`bgStars` asset keys from `STAGES[nextStage]`.
- **PIXEL_SCALE**: All sprites are scaled up from small source assets using this constant (set in constants.js). Collision bodies are manually sized to match visual bounds.
