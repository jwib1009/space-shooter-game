# Retro 2D Space Shooter — Game Spec & Implementation Plan

## Context

Build a retro top-down vertical space shooter (1942/Galaga style) using **Phaser 3**. The player's ship is at the bottom, enemies scroll from the top. The game uses pixel art assets from the Legacy Collection already in the project directory.

**Core features:** Power-ups & weapon upgrades, boss fights, score & lives system, wave-based progression.

---

## Project Structure

```
space-shooter-game/
├── index.html                  # Entry point
├── package.json                # Dependencies (Phaser 3)
├── src/
│   ├── main.js                 # Phaser config & game bootstrap
│   ├── scenes/
│   │   ├── BootScene.js        # Asset preloading
│   │   ├── MenuScene.js        # Title screen / main menu
│   │   ├── GameScene.js        # Core gameplay
│   │   ├── HUDScene.js         # Score, lives, UI overlay
│   │   ├── GameOverScene.js    # Game over / high score
│   │   └── BossScene.js        # Boss encounter (M3)
│   ├── entities/
│   │   ├── Player.js           # Player ship class
│   │   ├── Enemy.js            # Base enemy class
│   │   ├── Boss.js             # Boss class (M3)
│   │   ├── Bullet.js           # Player/enemy projectiles
│   │   ├── Asteroid.js         # Asteroid obstacles
│   │   └── PowerUp.js          # Power-up collectibles (M2)
│   ├── systems/
│   │   ├── WaveManager.js      # Wave spawning & formations (M2)
│   │   ├── WeaponSystem.js     # Weapon types & upgrades (M2)
│   │   └── ScoreManager.js     # Score tracking & persistence (M1+)
│   └── config/
│       ├── constants.js        # Game dimensions, speeds, tuning
│       └── waves.js            # Wave definitions (M2)
├── assets/                     # Symlink or copy from Legacy Collection
└── Legacy Collection/          # Original asset packs (already present)
```

---

## Asset Map

All paths relative to `Legacy Collection/Assets/`.

### Player Ship
| Asset | Path | Usage |
|-------|------|-------|
| Player frames (3) | `Packs/SpaceShooter/Space Shooter files/player/sprites/player1.png` through `player3.png` | Player idle animation |
| Player spritesheet source | `Packs/SpaceShooter/Space Shooter files/player/player.ase` | Reference |

### Enemies
| Asset | Path | Usage |
|-------|------|-------|
| Basic enemies (5 types) | `Packs/SpaceShooter/Space Shooter files/enemy/sprites/enemy1.png` – `enemy5.png` | M1: basic enemies |
| Enemy spritesheet | `Packs/SpaceShooter/Space Shooter files/enemy/sprites/spritesheet.png` | Combined sheet |
| Top-down enemies (3 animated) | `Characters/top-down-shooter-enemies/spritesheets/enemy-01.png` – `enemy-03.png` | M2: wave variety |
| Enemy explosion | `Characters/top-down-shooter-enemies/spritesheets/enemy-explosion.png` | M2: death anim |
| Small enemies (2) | `Packs/SpaceShipShooter/Sprites/EnemySmall/enemy-small1.png` – `enemy-small2.png` | M2: fast swarm |
| Medium enemies (2) | `Packs/SpaceShipShooter/Sprites/Enemy Medium/enemy-medium1.png` – `enemy-medium2.png` | M2: mid-tier |
| Big enemies (2) | `Packs/SpaceShipShooter/Sprites/EnemyBig/enemy-big1.png` – `enemy-big2.png` | M2: heavy tanks |
| Flying alien (8 frames) | `Characters/alien-flying-enemy/spritesheet.png` | M2: special enemy |

### Boss
| Asset | Path | Usage |
|-------|------|-------|
| Boss body (5 frames) | `Misc/top-down-boss/PNG/spritesheets/boss.png` | M3: boss idle |
| Boss thrust | `Misc/top-down-boss/PNG/spritesheets/boss-thrust.png` | M3: boss movement |
| Boss bolt attack | `Misc/top-down-boss/PNG/spritesheets/bolt.png` | M3: projectile |
| Boss rays (11 frames) | `Misc/top-down-boss/PNG/spritesheets/rays.png` | M3: special attack |
| Boss cannons | `Misc/top-down-boss/PNG/spritesheets/cannon-left.png`, `cannon-right.png` | M3: cannons |
| Boss helmet | `Misc/top-down-boss/PNG/spritesheets/helmet.png` | M3: visual |

### Asteroids
| Asset | Path | Usage |
|-------|------|-------|
| Large asteroid | `Packs/SpaceShooter/Space Shooter files/asteroids/asteroid.png` | M1: obstacles |
| Small asteroid | `Packs/SpaceShooter/Space Shooter files/asteroids/asteroid-small.png` | M1: obstacles |
| Asteroid variants (5) | `Packs/asteroid-fighter/PNG/asteroids/asteroid-1.png` – `asteroid-5.png` | M2: variety |

### Projectiles
| Asset | Path | Usage |
|-------|------|-------|
| Player bullets (2) | `Packs/SpaceShooter/Space Shooter files/shoot/shoot1.png`, `shoot2.png` | M1: basic shot |
| Laser bolts (4) | `Packs/SpaceShipShooter/Sprites/Laser Bolts/laser-bolts1.png` – `laser-bolts4.png` | M2: laser upgrade |
| Bolt FX (4 frames) | `Misc/Warped shooting fx/Bolt/Sprites/bolt1.png` – `bolt4.png` | M2: bolt weapon |
| Pulse FX (4 frames) | `Misc/Warped shooting fx/Pulse/Sprites/pulse1.png` – `pulse4.png` | M2: pulse weapon |
| Enemy projectile | `Misc/EnemyProjectile/spritesheet.png` | M1: enemy shots |

### Explosions & Hit Effects
| Asset | Path | Usage |
|-------|------|-------|
| Explosion (5 frames) | `Packs/SpaceShooter/Space Shooter files/explosion/sprites/explosion1.png` – `explosion5.png` | M1: enemy death |
| Large explosion (9 frames) | `Misc/Explosion/sprites/explosion-animation1.png` – `explosion-animation9.png` | M3: boss explosion |
| Hit effect (4 frames) | `Packs/SpaceShooter/Space Shooter files/Hit/sprites/hit1.png` – `hit4.png` | M1: bullet impact |
| Flash | `Packs/SpaceShooter/Space Shooter files/flash/flash.png` | M1: muzzle flash |
| Enemy death (8 frames) | `Misc/EnemyDeath/spritesheet.png` | M2: alt death anim |

### Power-ups
| Asset | Path | Usage |
|-------|------|-------|
| Power-up icons (4) | `Packs/SpaceShipShooter/Sprites/PowerUps/power-up1.png` – `power-up4.png` | M2: weapon/shield pickups |
| Gems | `Misc/gems/spritesheets/gems-spritesheet.png` | M2: score bonus pickups |
| Energy shield FX | `Misc/Grotto-escape-2-FX/spritesheets/energy-shield.png` | M2: shield visual |

### Backgrounds (Parallax)
| Asset | Path | Usage |
|-------|------|-------|
| BG back layer | `Packs/SpaceShooter/Space Shooter files/background/layered/bg-back.png` | M1: Stage 1 back |
| BG stars layer | `Packs/SpaceShooter/Space Shooter files/background/layered/bg-stars.png` | M1: Stage 1 stars |
| BG planet layer | `Packs/SpaceShooter/Space Shooter files/background/layered/bg-planet.png` | M1: Stage 1 planet |
| Blue back | `Environments/space_background_pack/Blue Version/layered/blue-back.png` | M3: Stage 2 back |
| Blue stars | `Environments/space_background_pack/Blue Version/layered/blue-stars.png` | M3: Stage 2 stars |
| Blue planets | `Environments/space_background_pack/Blue Version/layered/prop-planet-big.png`, `prop-planet-small.png` | M3: Stage 2 props |
| Old parallax bg | `Environments/space_background_pack/Old Version/layers/parallax-space-backgound.png` | M3: Stage 3 back |
| Old parallax stars | `Environments/space_background_pack/Old Version/layers/parallax-space-stars.png` | M3: Stage 3 stars |
| Old parallax planets | `Environments/space_background_pack/Old Version/layers/parallax-space-far-planets.png`, `parallax-space-ring-planet.png`, `parallax-space-big-planet.png` | M3: Stage 3 props |

### Sound Effects
| Asset | Path | Usage |
|-------|------|-------|
| Explosion SFX | `Packs/SpaceShooter/Space Shooter files/Sound FX/explosion.wav` | All milestones |
| Hit SFX | `Packs/SpaceShooter/Space Shooter files/Sound FX/hit.wav` | All milestones |
| Shot SFX 1 | `Packs/SpaceShooter/Space Shooter files/Sound FX/shot 1.wav` | All milestones |
| Shot SFX 2 | `Packs/SpaceShooter/Space Shooter files/Sound FX/shot 2.wav` | All milestones |

---

## Milestone 1 — Core Gameplay Loop

**Goal:** A playable arcade game with ship movement, shooting, enemies, asteroids, explosions, and scoring.

### Features
- **Player ship** — Keyboard (arrow/WASD) + mouse control, constrained to screen bounds
- **Basic shooting** — Spacebar/click fires bullets upward at fixed rate
- **3 enemy types** — Fly in from top with simple downward/zigzag paths, shoot back
- **Asteroids** — Drift downward as obstacles, destructible (large splits into small)
- **Collision detection** — Bullet↔enemy, bullet↔asteroid, player↔enemy, player↔asteroid, enemy-bullet↔player
- **Explosions & hit FX** — Animated sprite on destruction
- **Score display** — Top of screen, points per enemy/asteroid kill
- **Sound effects** — Shooting, hits, explosions
- **Scrolling parallax background** — 3-layer vertical scroll (back, stars, planet)
- **Game over** — When player is destroyed, show score and restart option

### Assets Used
- Player: `player1-3.png`
- Enemies: `enemy1.png`, `enemy2.png`, `enemy3.png` (from SpaceShooter pack)
- Asteroids: `asteroid.png`, `asteroid-small.png`
- Bullets: `shoot1.png` (player), `EnemyProjectile/spritesheet.png` (enemy)
- Explosions: `explosion1-5.png`
- Hit FX: `hit1-4.png`
- Flash: `flash.png`
- Background: `bg-back.png`, `bg-stars.png`, `bg-planet.png`
- Sound: all 4 wav files

### Key Files to Create
- `index.html`, `package.json`, `src/main.js`
- `src/scenes/BootScene.js`, `MenuScene.js`, `GameScene.js`, `GameOverScene.js`
- `src/entities/Player.js`, `Enemy.js`, `Bullet.js`, `Asteroid.js`
- `src/systems/ScoreManager.js`
- `src/config/constants.js`

### Playable State
Open in browser → Title screen → Press start → Fly ship, shoot enemies & asteroids, see score increase, die, see game over screen with score, restart.

### Verification
- [x] `npm install && npm start` launches game in browser
- [x] Player moves with keyboard, stays in bounds
- [x] Bullets fire on spacebar/click, destroy enemies
- [x] Enemies fly in, shoot projectiles at player
- [x] Asteroids drift, can be destroyed
- [x] Explosions play on destruction
- [x] Score increments correctly
- [x] Player death triggers game over screen
- [x] Sound effects play for shots, hits, explosions
- [x] Background scrolls with parallax effect

---

## Milestone 2 — Waves, Power-ups & Lives

**Goal:** A full arcade experience with wave-based enemy progression, weapon upgrades, power-up pickups, and a lives system.

### Features
- **Wave system** — Defined waves of enemies with increasing difficulty; wave counter on HUD
- **Enemy formations** — V-shape, line, circle, staggered patterns
- **7+ enemy types** — Add top-down animated enemies, small/medium/big variants, flying alien
- **Power-up drops** — Enemies randomly drop power-ups on death:
  - **Spread Shot** (power-up1) — 3-way bullet spread
  - **Laser** (power-up2) — Piercing laser bolt
  - **Shield** (power-up3) — Absorbs 1-3 hits (energy-shield FX around ship)
  - **Score Bonus** (power-up4 / gems) — Extra points
- **Weapon upgrade system** — Collecting same weapon type upgrades it (wider spread, faster laser)
- **Lives system** — Start with 3 lives, respawn with brief invincibility, extra life at score thresholds
- **HUD overlay** — Lives remaining, current wave, weapon indicator, score
- **More asteroid variants** — 5 asteroid types from asteroid-fighter pack
- **Enhanced death anims** — enemy-explosion spritesheet, EnemyDeath spritesheet

### New Assets Introduced
- Enemies: `enemy-01.png` – `enemy-03.png` (animated), `enemy-small1-2.png`, `enemy-medium1-2.png`, `enemy-big1-2.png`, `alien-flying-enemy/spritesheet.png`
- Enemy death: `enemy-explosion.png`, `EnemyDeath/spritesheet.png`
- Power-ups: `power-up1-4.png`, `gems-spritesheet.png`
- Shield: `energy-shield.png`
- Weapon FX: `laser-bolts1-4.png`, `bolt1-4.png`, `pulse1-4.png`
- Asteroids: `asteroid-1.png` – `asteroid-5.png`

### Key Files to Create/Modify
- **New:** `src/systems/WaveManager.js`, `src/systems/WeaponSystem.js`, `src/scenes/HUDScene.js`, `src/entities/PowerUp.js`, `src/config/waves.js`
- **Modify:** `GameScene.js` (wave integration, power-up spawning, lives), `Player.js` (weapon switching, shield, respawn), `Enemy.js` (new types, formations), `BootScene.js` (load new assets)

### Playable State
Launch → Start game → Survive waves of increasingly varied enemies → Collect power-ups to change weapons → Shield absorbs hits → Lose all 3 lives → Game over with final score.

### Verification
- [x] Waves spawn sequentially with increasing difficulty
- [x] At least 3 different enemy formations appear
- [x] All 7+ enemy types appear across waves
- [x] Power-ups drop from destroyed enemies
- [x] Collecting spread shot gives 3-way fire
- [x] Collecting laser gives piercing projectile
- [x] Shield visually wraps player and absorbs damage
- [x] Gems/bonus give score boost
- [x] Lives display in HUD, decrement on death
- [x] Respawn with brief invincibility flashing
- [x] Wave counter advances in HUD

---

## Milestone 3 — Boss Fights, Stages & Polish

**Goal:** A complete game with multi-stage progression, boss encounters, high score persistence, and visual polish.

### Features
- **3 stages** — Each with unique parallax background theme, ending in a boss fight
  - Stage 1: Original SpaceShooter background (purple/dark)
  - Stage 2: Blue space background
  - Stage 3: Old-style parallax background with ring planet
- **Boss fights** — Multi-phase boss at end of each stage:
  - Phase 1: Boss moves side-to-side, fires bolt projectiles from cannons
  - Phase 2: Boss activates rays (energy beam sweep)
  - Phase 3: Boss speeds up, fires spread patterns
  - Health bar displayed at top of screen
  - Large explosion sequence on defeat (9-frame explosion)
- **Stage transitions** — Brief "Stage Clear" screen with score bonus between stages
- **High score persistence** — localStorage for top 10 scores, displayed on game over and menu
- **Screen shake & flash** — On explosions, boss hits
- **Particle effects** — Starfield particles behind parallax layers
- **Difficulty scaling** — Enemy speed, fire rate, and health scale across stages
- **Ship selection** — Choose from 4 ship designs (red/yellow variants) on menu screen

### New Assets Introduced
- Boss: all `top-down-boss` spritesheets (boss, thrust, bolt, rays, cannons, helmet)
- Large explosion: `Misc/Explosion/sprites/explosion-animation1-9.png`
- Stage 2 BG: `Blue Version/layered/` files
- Stage 3 BG: `Old Version/layers/` files

### Key Files to Create/Modify
- **New:** `src/entities/Boss.js`, `src/scenes/BossScene.js` (or integrated into GameScene)
- **Modify:** `MenuScene.js` (ship select, high scores), `GameScene.js` (stage transitions, boss trigger), `GameOverScene.js` (high score table), `BootScene.js` (load boss + new BG assets), `ScoreManager.js` (localStorage persistence), `constants.js` (stage configs)

### Playable State
Launch → Select ship → Play through Stage 1 waves → Defeat Stage 1 boss → "Stage Clear" → Stage 2 with new background → ... → Stage 3 boss → Victory screen → High score table saved to localStorage.

### Verification
- [x] Ship selection works on menu with 4+ ship options
- [x] 3 distinct stage backgrounds with parallax scrolling
- [x] Boss appears after final wave of each stage
- [x] Boss has visible health bar that depletes
- [x] Boss cycles through attack phases
- [x] Boss defeat triggers large explosion sequence
- [x] "Stage Clear" screen shows between stages
- [x] Screen shake on big explosions
- [x] High scores persist across browser sessions (localStorage)
- [x] Top 10 scores displayed on menu/game over
- [x] Victory screen after defeating final boss
- [x] Full game is completable start to finish
