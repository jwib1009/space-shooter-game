# Space Shooter — Complete TODO

---

# Milestone 1 — Core Gameplay Loop

## 1. Project Setup
- [x] Initialize npm project (`npm init`)
- [x] Install Phaser 3 (`npm install phaser`)
- [x] Set up a dev server (e.g. `vite` or `parcel`) for hot-reload during development
- [x] Create `index.html` with a `<canvas>` container and Phaser script import
- [x] Create `src/main.js` with Phaser game config (canvas size, physics engine, scene list)
- [x] Create `src/config/constants.js` for shared values (screen width/height, speeds, etc.)

### What you'll learn
- How Phaser bootstraps: `new Phaser.Game(config)` creates the canvas and starts the scene pipeline
- Phaser's Arcade Physics engine — lightweight AABB collision, perfect for a 2D shooter
- Why a constants file matters: tuning gameplay (bullet speed, spawn rates) without hunting through code

---

## 2. Asset Loading (BootScene)
- [x] Create `src/scenes/BootScene.js`
- [x] Copy/symlink needed assets into an `assets/` folder for clean paths
- [x] Load player sprites: `player1.png`, `player2.png`, `player3.png`
- [x] Load enemy sprites: `enemy1.png`, `enemy2.png`, `enemy3.png`
- [x] Load asteroid sprites: `asteroid.png`, `asteroid-small.png`
- [x] Load bullet sprites: `shoot1.png` (player), `EnemyProjectile/spritesheet.png` (enemy)
- [x] Load explosion frames: `explosion1.png` – `explosion5.png`
- [x] Load hit effect frames: `hit1.png` – `hit4.png`
- [x] Load muzzle flash: `flash.png`
- [x] Load background layers: `bg-back.png`, `bg-stars.png`, `bg-planet.png`
- [x] Load sound effects: `explosion.wav`, `hit.wav`, `shot 1.wav`, `shot 2.wav`
- [x] Create sprite animations from loaded frames (explosion, hit, player idle)
- [x] Transition to MenuScene when loading completes

### What you'll learn
- Phaser's `this.load.image()` / `this.load.spritesheet()` / `this.load.audio()` pipeline
- The preload → create → update lifecycle that every Phaser scene follows
- How to define frame-based animations with `this.anims.create()` and play them on sprites
- Why a dedicated boot/preload scene prevents blank screens while assets download

---

## 3. Menu Screen (MenuScene)
- [x] Create `src/scenes/MenuScene.js`
- [x] Display game title text ("SPACE SHOOTER") using Phaser bitmap/text
- [x] Display "Press SPACE to Start" prompt
- [x] Listen for spacebar input to transition to GameScene
- [x] Show scrolling starfield background behind menu (reuse bg-stars)

### What you'll learn
- Phaser scene transitions: `this.scene.start('GameScene')`
- Adding text objects with `this.add.text()` and styling them retro (monospace, pixel fonts)
- Input handling with `this.input.keyboard.once()`

---

## 4. Parallax Background (GameScene)
- [x] Add `bg-back.png` as the farthest layer (slowest scroll)
- [x] Add `bg-stars.png` as the middle layer (medium scroll)
- [x] ~~Add `bg-planet.png` as the nearest layer~~ (removed — planet arc looked weird tiled vertically)
- [x] Use `tileSprite` for seamless vertical scrolling
- [x] Update each layer's `tilePositionY` in the `update()` loop at different speeds

### What you'll learn
- `this.add.tileSprite()` — Phaser's way to create infinitely scrolling tiled backgrounds
- Parallax effect: layers at different scroll speeds create depth illusion
- The `update(time, delta)` game loop — runs every frame (~60fps), where all movement logic lives
- Why delta-time matters for frame-rate-independent movement

---

## 5. Player Ship (Player.js)
- [x] Create `src/entities/Player.js` as a class extending `Phaser.Physics.Arcade.Sprite`
- [x] Spawn player at bottom-center of screen
- [x] Set up keyboard input: arrow keys + WASD for movement
- [x] Set player velocity based on input direction
- [x] Clamp player position to screen bounds (`setCollideWorldBounds(true)`)
- [x] Play idle animation (cycling player1-3 frames)
- [x] Set player hitbox size (smaller than sprite for fair gameplay)

### What you'll learn
- Extending Phaser sprites to create reusable game entities with custom logic
- Phaser's physics body: `setVelocity()`, `setCollideWorldBounds()`, `setSize()` for hitbox
- `this.input.keyboard.createCursorKeys()` for arrow key bindings
- Why hitboxes are often smaller than the visual sprite — "generous" collision feels fairer to players

---

## 6. Shooting System (bullet logic in Player.js)
- [x] ~~Create `src/entities/Bullet.js`~~ (bullet pool managed directly in Player.js — simpler for M1)
- [x] Create a bullet pool (Phaser Group) to recycle bullet objects instead of creating/destroying
- [x] Fire bullet from player position on spacebar/click
- [x] Implement fire rate cooldown (e.g. 200ms between shots)
- [x] Bullets travel upward at constant speed
- [x] Deactivate bullets when they leave the screen (recycle to pool)
- [x] Play muzzle flash at player position on fire
- [x] Play shooting sound effect on fire

### What you'll learn
- **Object pooling** — the #1 performance pattern in game dev. Creating/destroying objects each frame causes GC spikes; pools pre-allocate and recycle
- `this.physics.add.group()` with `maxSize` for automatic pooling
- `getFirstDead()` to grab an inactive bullet from the pool
- Fire rate limiting with timestamp tracking: `if (time > lastFired + fireRate)`

---

## 7. Enemies (Enemy.js)
- [x] Create `src/entities/Enemy.js` extending `Phaser.Physics.Arcade.Sprite`
- [x] Create enemy pool (Phaser Group) for recycling
- [x] Spawn enemies at random X positions above the screen
- [x] Implement 3 movement patterns:
  - **Straight down** — constant downward velocity
  - **Zigzag** — sinusoidal horizontal movement while descending
  - **Dive** — accelerates toward player's X position
- [x] Each enemy type (enemy1/2/3) uses a different pattern and speed
- [x] Enemies fire projectiles downward at random intervals
- [x] Enemy bullets use the EnemyProjectile sprite, travel downward
- [x] Deactivate enemies that leave the bottom of the screen

### What you'll learn
- Spawning with timers: `this.time.addEvent({ delay, callback, loop: true })`
- Movement patterns using velocity + math: `Math.sin(time * frequency) * amplitude` for zigzag
- Why different enemy behaviors create gameplay variety even with simple math
- Enemy bullet pools — same pooling concept as player bullets, separate group

---

## 8. Asteroids (Asteroid.js)
- [x] Create `src/entities/Asteroid.js` extending `Phaser.Physics.Arcade.Sprite`
- [x] Asteroid pool for large and small variants
- [x] Spawn large asteroids at random X, drifting downward with slight rotation
- [x] When a large asteroid is destroyed, spawn 2 small asteroids at its position
- [x] Small asteroids drift at slight angles (not straight down)
- [x] Asteroids have health (large = 3 hits, small = 1 hit)

### What you'll learn
- `setAngularVelocity()` for visual rotation — makes asteroids feel more natural
- Splitting mechanic: spawning child objects at parent's death position (classic Asteroids pattern)
- Health systems on entities: tracking HP, reducing on hit, destroying at zero

---

## 9. Collision Detection
- [x] Player bullets ↔ Enemies: enemy takes damage, bullet deactivates, play hit FX
- [x] Player bullets ↔ Asteroids: asteroid takes damage, bullet deactivates
- [x] Enemy bullets ↔ Player: player takes damage, bullet deactivates
- [x] Player ↔ Enemy: both take damage (enemy destroyed, player destroyed)
- [x] Player ↔ Asteroid: player destroyed
- [x] Play explosion animation at destruction point
- [x] Play hit animation at bullet impact point
- [x] Play appropriate sound effects

### What you'll learn
- `this.physics.add.overlap(groupA, groupB, callback)` — Phaser's overlap detection for groups
- Collision callbacks receive `(objectA, objectB)` — you handle the game logic
- Overlap vs. Collide: overlap detects intersection without physics push, collide adds physical response
- Spawning one-shot animations: create sprite, play anim, destroy on complete

---

## 10. Score System (ScoreManager.js)
- [x] Create `src/systems/ScoreManager.js` as a simple class/singleton
- [x] Track current score (starts at 0)
- [x] Award points on enemy kill: enemy1 = 100, enemy2 = 200, enemy3 = 300
- [x] Award points on asteroid kill: large = 50, small = 25
- [x] Display score at top-left of screen using fixed text object
- [x] Update score display in real-time

### What you'll learn
- Separating game systems from scenes — ScoreManager can be reused across scenes
- Phaser's `this.add.text()` with `setScrollFactor(0)` to pin UI text to the camera
- Event-driven architecture: enemies emit events, ScoreManager listens and updates

---

## 11. Game Over (GameOverScene)
- [x] Create `src/scenes/GameOverScene.js`
- [x] Trigger when player is destroyed (no lives system yet — instant game over)
- [x] Display "GAME OVER" text
- [x] Display final score
- [x] Display "Press SPACE to Restart" prompt
- [x] On spacebar: restart GameScene with fresh state
- [x] Pass score data between scenes using `this.scene.start('GameOver', { score })`

### What you'll learn
- Passing data between Phaser scenes via the `data` parameter in `scene.start()`
- Accessing passed data with `this.scene.settings.data` in the `init()` method
- Scene lifecycle: `init()` → `preload()` → `create()` → `update()` — init runs first and receives data
- Resetting game state cleanly on restart (why global singletons need `.reset()` methods)

---

## 12. Audio Integration
- [x] Play `shot 1.wav` when player fires
- [x] Play `hit.wav` on bullet impact
- [x] Play `explosion.wav` on enemy/asteroid destruction
- [x] Use `shot 2.wav` as variant for enemy shots
- [x] Set appropriate volume levels (explosions louder, shots quieter)
- [x] Handle browser autoplay policy (Phaser handles via first user interaction on Menu)

### What you'll learn
- `this.sound.play('key', { volume })` — Phaser's audio API
- Browser autoplay restrictions: audio can't play until the user clicks/taps. Phaser handles this with `this.sound.unlock()` or your first input event
- Sound design basics: layering sounds at different volumes creates depth

---

## 13. Polish & Playtesting
- [x] Tune spawn rates so difficulty ramps gradually (spawn rate increases every 10s)
- [x] Tune bullet speed, fire rate, enemy speed for satisfying feel
- [x] Ensure no memory leaks (all pooled objects properly recycled)
- [ ] Test in multiple browsers (Chrome, Firefox, Edge)
- [x] Verify all assets load without 404 errors

### What you'll learn
- Game feel ("juice") — small tweaks to speed, timing, and feedback make huge differences
- Browser DevTools for games: watch memory tab for leaks, network tab for missing assets
- The playtest loop: play → notice friction → tweak → repeat

---
---

# Milestone 2 — Waves, Power-ups & Lives

## 14. Wave Manager (WaveManager.js)
- [x] Create `src/systems/WaveManager.js`
- [x] Define wave data structure in `src/config/waves.js`:
  ```
  { wave: 1, enemies: [{ type, count, formation, delay }], asteroids: count }
  ```
- [x] Implement wave sequencing: spawn all enemies in a wave → wait until all defeated → start next wave
- [x] Track current wave number
- [x] Increase difficulty per wave: more enemies, faster speeds, shorter delays
- [x] Add brief pause (2-3 seconds) between waves with "Wave X" text flash
- [x] Emit events when wave starts/ends for HUD updates

### What you'll learn
- **State machines** — WaveManager cycles through states: `WAITING → SPAWNING → ACTIVE → CLEARED`. Most game systems are state machines under the hood
- Data-driven design: defining waves in config files means you can tweak difficulty without touching code
- Event emitters (`Phaser.Events.EventEmitter`): decoupling systems so WaveManager doesn't need to know about HUD directly
- Generator/iterator patterns for sequencing: spawn enemy, wait, spawn next

---

## 15. Enemy Formations
- [x] Implement **Line formation** — enemies spawn in a horizontal row, descend together
- [x] Implement **V-shape formation** — enemies in a V pattern, leader in front
- [x] Implement **Circle formation** — enemies orbit a center point while descending
- [x] Implement **Staggered formation** — enemies spawn in offset rows, creating a grid
- [ ] Each formation has entry path (fly in from top) and combat pattern (once in position)
- [x] Formations defined per-wave in `waves.js` config

### What you'll learn
- **Parametric curves** for formations: V-shape is offset from leader `(leaderX + i * spacing * direction, leaderY + i * rowOffset)`
- Circle formation uses trig: `(centerX + cos(angle + i * step) * radius, centerY + sin(angle + i * step) * radius)`
- Entry paths vs. combat patterns: enemies transition from scripted entry to autonomous behavior
- How classic arcade games (Galaga, Space Invaders) create variety from simple formation math

---

## 16. New Enemy Types
- [x] Load new enemy spritesheets in BootScene (animated top-down enemies, small/medium/big, alien)
- [x] Create animation configs for each new type (frame count, frame rate differ per spritesheet)
- [x] Define enemy type configs in constants:
  ```
  ENEMY_TYPES = {
    scout:    { sprite, hp: 1, speed: fast,   score: 100, fireRate: low },
    fighter:  { sprite, hp: 2, speed: medium, score: 200, fireRate: medium },
    tank:     { sprite, hp: 4, speed: slow,   score: 300, fireRate: high },
    small:    { sprite, hp: 1, speed: fast,   score: 150, fireRate: none },
    medium:   { sprite, hp: 3, speed: medium, score: 250, fireRate: medium },
    big:      { sprite, hp: 5, speed: slow,   score: 400, fireRate: high },
    alien:    { sprite, hp: 2, speed: fast,   score: 350, fireRate: low, pattern: zigzag }
  }
  ```
- [x] Update Enemy.js to accept a type config and behave accordingly
- [x] Mix enemy types across waves for variety

### What you'll learn
- **Composition over inheritance**: instead of `SmallEnemy extends Enemy`, one Enemy class configured by data
- Config-driven entities: the same class handles 7+ enemy types because behavior is parameterized
- Spritesheet animations: different enemies have different frame counts, so animation configs must match each sheet's layout
- Balancing enemy stats: HP, speed, and score values work together — fast enemies should be low HP (hard to hit but easy to kill)

---

## 17. Weapon System (WeaponSystem.js)
- [x] Create `src/systems/WeaponSystem.js`
- [x] Define weapon types:
  - **Basic** — single bullet straight up (default)
  - **Spread** — 3 bullets in a fan pattern (center + 15° left + 15° right)
  - **Laser** — piercing bolt that passes through enemies (doesn't deactivate on hit)
- [x] Track current weapon type and upgrade level on the player
- [x] Upgrade levels per weapon:
  - Spread L1: 3-way → L2: 5-way → L3: 7-way
  - Laser L1: single → L2: double (parallel) → L3: triple
- [x] Each weapon type uses different bullet sprites (shoot1 for basic, laser-bolts for laser, bolt for spread)
- [x] Weapon switch resets upgrade level to 1

### What you'll learn
- **Strategy pattern**: WeaponSystem swaps firing behavior without changing Player code. `weapon.fire()` does different things based on active weapon
- Angle-based bullet spread: `velocity.x = speed * Math.sin(angle)`, `velocity.y = -speed * Math.cos(angle)`
- Piercing projectiles: instead of `bullet.deactivate()` on overlap, the bullet stays alive — you control this with a `piercing` flag
- Upgrade progression: same weapon, increasing power — a core loop that makes players feel stronger over time

---

## 18. Power-up System (PowerUp.js)
- [x] Create `src/entities/PowerUp.js` extending `Phaser.Physics.Arcade.Sprite`
- [x] Power-up pool with different types
- [x] Spawn power-ups from destroyed enemies (random chance, e.g. 15%)
- [x] Power-up types mapped to sprites:
  - `power-up1.png` → Spread Shot (orange/red icon)
  - `power-up2.png` → Laser (blue icon)
  - `power-up3.png` → Shield (green icon)
  - `power-up4.png` / gems → Score Bonus (+500 points)
- [x] Power-ups drift downward slowly, bob up and down (sine wave on Y)
- [x] Player ↔ PowerUp overlap: collect and apply effect
- [x] Power-ups deactivate if they leave the screen
- [x] Brief flash/sound on collection

### What you'll learn
- **Loot tables**: random drops with weighted probabilities. Not all power-ups should be equally common — shield might be rare (5%), score bonus common (40%)
- Visual feedback for pickups: bobbing motion uses `y + Math.sin(time * freq) * amplitude` — same sine wave pattern as enemy zigzag, different use
- Item lifecycle: spawn → drift → collect/expire. Managing transient objects cleanly prevents memory leaks

---

## 19. Shield Mechanic
- [x] When shield power-up collected, activate shield on player
- [x] Display `energy-shield.png` spritesheet animation around the player ship
- [x] Shield absorbs up to 3 hits before breaking
- [x] Visual feedback: shield sprite flashes on hit, changes color/opacity as it weakens
- [ ] Shield breaks with a visual pop effect
- [x] Shield duration: either hit-based (3 hits) or time-based (10 seconds) — hit-based is more strategic

### What you'll learn
- **Composite sprites**: the shield is a separate sprite that follows the player's position every frame
- Damage absorption layers: collision callback checks `if (player.hasShield)` → absorb damage → skip player death
- Visual state feedback: players need to know shield strength at a glance — opacity or color tint communicates this
- `sprite.setTint(0xff0000)` for damage flash, `sprite.setAlpha()` for transparency

---

## 20. Lives System
- [x] Player starts with 3 lives
- [x] On death: lose 1 life, respawn at bottom-center
- [x] Brief invincibility window after respawn (2 seconds)
- [x] During invincibility: player sprite blinks (alpha toggle every 100ms)
- [x] When invincible, disable player↔enemy and player↔bullet overlaps
- [x] Extra life awarded at 10,000 points (with fanfare sound or flash)
- [x] At 0 lives: trigger Game Over scene
- [x] Lives displayed as ship icons in HUD

### What you'll learn
- **Invincibility frames (i-frames)** — a universal game design pattern. Without them, players die instantly on respawn if enemies are nearby
- Blinking effect with timed events: `this.time.addEvent({ delay: 100, callback: toggleAlpha, repeat: 20 })`
- Conditional collision: disabling overlap checks during invincibility, then re-enabling
- Score thresholds for rewards: `if (score >= nextLifeThreshold)` — simple but satisfying progression hook

---

## 21. HUD Overlay (HUDScene)
- [x] Create `src/scenes/HUDScene.js`
- [x] Run as a **parallel scene** on top of GameScene (`this.scene.launch('HUD')`)
- [x] Display: Score (top-left), Lives (top-right as ship icons), Wave counter (top-center)
- [x] Display current weapon type indicator (bottom-left, small icon)
- [x] Update HUD via Phaser events emitted from GameScene
- [x] "Wave X" announcement: large text that fades in/out at wave start
- [x] Score pop: brief "+100" text at enemy death position, floats up and fades

### What you'll learn
- **Parallel scenes** — Phaser can run multiple scenes simultaneously. HUD runs above GameScene, unaffected by game camera
- Scene communication: `this.scene.get('HUD').events.emit('scoreUpdate', score)` — scenes talk through events
- Why HUD is a separate scene: if GameScene pauses or restarts, HUD can handle transitions smoothly
- Floating score text ("juice"): `this.tweens.add({ y: '-=30', alpha: 0, duration: 800, onComplete: destroy })`

---

## 22. Enhanced Visual Effects
- [ ] Use `enemy-explosion.png` spritesheet for animated enemy deaths (instead of single explosion)
- [ ] Use `EnemyDeath/spritesheet.png` for alternate death effect on special enemies
- [ ] Different explosion sizes for different enemy sizes (scale the sprite)
- [ ] Bullet trail: faint afterimage or particle trail behind laser bolts
- [x] Screen flash (brief white overlay) on large enemy kills

### What you'll learn
- Spritesheet-based vs. frame-based animations: sheets are more efficient (one draw call), individual frames are easier to manage
- Particle systems in Phaser: `this.add.particles()` for bullet trails — lightweight GPU-accelerated effects
- Scaling sprites: `sprite.setScale(2)` makes small explosion assets work for big enemies
- Screen flash as feedback: `this.cameras.main.flash(100, 255, 255, 255)` — a one-liner for impact feel

---

## 23. Asteroid Variety
- [x] Load 5 asteroid variants from asteroid-fighter pack
- [ ] Randomly select variant when spawning
- [ ] Different asteroid sizes/HP per variant
- [x] Vary rotation speed per asteroid for visual diversity
- [x] Increase asteroid spawn rate in later waves

### What you'll learn
- Visual variety from minimal assets: random selection + random rotation speed makes 5 sprites feel like dozens
- `Phaser.Math.Between(min, max)` for random values — Phaser's built-in random utilities

---

## 24. Balance & Playtesting
- [ ] Define at least 10 waves with escalating difficulty
- [ ] Ensure power-up drop rate feels rewarding but not trivial
- [ ] Test weapon upgrades feel meaningfully stronger at each level
- [ ] Verify shield feels valuable but not overpowered
- [ ] Test that 3 lives is enough to reach wave 5+ for average skill
- [ ] Tune extra-life threshold so it happens once per session for most players

### What you'll learn
- **Difficulty curves**: linear difficulty (same increase per wave) feels boring. Exponential or stepped curves feel better — easy waves, then a spike, then a breather
- Drop rate psychology: too common = no excitement, too rare = frustration. 10-20% is a sweet spot
- Playtesting is design: numbers on paper mean nothing until you feel them in play

---
---

# Milestone 3 — Boss Fights, Stages & Polish

## 25. Stage System
- [x] Define 3 stages in `constants.js`, each with:
  - Background asset keys (parallax layers)
  - Wave definitions (which waves belong to this stage)
  - Difficulty multipliers (enemy speed, fire rate, HP scaling)
  - Boss config
- [x] Stage 1: SpaceShooter background (purple/dark) — waves 1-5
- [x] Stage 2: Blue space background — waves 6-10
- [x] Stage 3: Old parallax background with ring planet — waves 11-15
- [x] Load all background sets in BootScene
- [ ] GameScene reads current stage config to set background layers
- [x] After final wave of a stage, trigger boss fight

### What you'll learn
- **Level/stage architecture**: stages are just config objects that parameterize the same GameScene. You don't need 3 separate scenes
- Config composition: `stage.background`, `stage.waves`, `stage.difficulty` — one object drives the entire stage
- Asset management across stages: all assets load upfront in BootScene to avoid loading screens mid-game
- Difficulty multipliers: `enemy.speed * stage.difficultyMultiplier` — one number scales the entire stage

---

## 26. Background Transitions
- [x] Load Stage 2 backgrounds: `blue-back.png`, `blue-stars.png`, `prop-planet-big.png`
- [x] Load Stage 3 backgrounds: `parallax-space-backgound.png`, `parallax-space-stars.png`, `parallax-space-ring-planet.png`, `parallax-space-far-planets.png`
- [ ] On stage transition: crossfade between background sets (old fades out, new fades in)
- [ ] Different parallax scroll speeds per stage for visual variety
- [ ] Stage 3 has additional parallax layer (more planet props = more depth)

### What you'll learn
- **Crossfade transitions**: tween old background alpha to 0 while tweening new background alpha to 1 simultaneously
- `this.tweens.add({ targets: oldBg, alpha: 0, duration: 2000 })` — Phaser's tween system handles smooth transitions
- More parallax layers = more depth perception. Stage 3 feeling "deeper" is a visual reward for progression

---

## 27. Stage Clear Screen
- [x] After boss is defeated, pause gameplay briefly
- [x] Display "STAGE CLEAR" text with score bonus (+1000 per stage)
- [ ] Show stage stats: enemies killed, accuracy %, time taken
- [x] Auto-advance to next stage after 3 seconds (or on keypress)
- [x] If Stage 3 boss defeated: show Victory screen instead

### What you'll learn
- **Pacing through downtime**: constant action causes fatigue. Brief pauses between stages let the player breathe and feel accomplishment
- Stats tracking: incrementing counters during gameplay (`enemiesKilled++`, `shotsFired++`, `shotsHit++`) — simple but players love seeing data
- Accuracy percentage: `(shotsHit / shotsFired * 100).toFixed(1)` — basic stat that motivates skillful play

---

## 28. Boss Entity (Boss.js)
- [x] Create `src/entities/Boss.js` extending `Phaser.Physics.Arcade.Sprite`
- [x] Load boss assets: body, thrust, bolt, rays, cannons, helmet
- [x] Boss is a **composite entity** — multiple sprites layered together:
  - Main body (animated, 5 frames)
  - Helmet (static, overlaid on body)
  - Left cannon (attached to body left side)
  - Right cannon (attached to body right side)
  - Thrust (animated, behind body, visible during movement)
- [x] Boss HP: high value (e.g. 100), with a health bar
- [x] Boss entry: flies in slowly from top of screen to its combat position
- [x] Boss hitbox covers the main body area only (not rays/effects)

### What you'll learn
- **Composite entities**: the boss isn't one sprite — it's 5+ sprites moving as a unit. Each child sprite's position is relative to the body: `cannon.x = body.x + offset`
- Container sprites: `this.add.container(x, y, [body, helmet, cannonL, cannonR])` groups them so they move together
- Large hitbox management: boss is big, but the hitbox should match the "damageable" area, not decorative parts
- Entry choreography: scripted movement using tweens before the boss enters combat mode

---

## 29. Boss Attack Phases
- [x] **Phase 1** (100%-66% HP) — Cannon barrage:
  - Boss moves side-to-side slowly
  - Fires bolt projectiles from left and right cannons alternately
  - Bolts aimed at player position (leading shots)
  - Fire rate: moderate (every 800ms)
- [x] **Phase 2** (66%-33% HP) — Ray sweep:
  - Boss stops moving, charges up (visual: rays animation plays)
  - Fires wide energy ray beam that sweeps left-to-right (or right-to-left)
  - Ray damages player on contact (large hitbox, must dodge vertically)
  - Between sweeps, fires faster cannon bolts
- [x] **Phase 3** (33%-0% HP) — Enraged:
  - Boss moves faster (erratic side-to-side)
  - Fires spread pattern: 5 bolts in a fan
  - Ray sweeps are faster
  - Cannon fire rate doubles
- [x] Phase transitions: brief pause, boss flashes, visual/audio cue

### What you'll learn
- **Phase-based boss design**: each phase introduces a new threat. Players learn phase 1, then must adapt. This is the core of boss fight design
- **Leading shots**: aim at where the player will be, not where they are. `targetX = player.x + player.body.velocity.x * leadTime`
- Sweep attacks: the ray's hitbox moves across the screen over time — `this.tweens.add({ targets: ray, x: from → to })`
- Difficulty escalation within a single fight: speed/rate changes per phase create tension as HP drops
- State machines in practice: boss.state = `PHASE1 | PHASE2 | PHASE3 | TRANSITION` — update logic switches on state

---

## 30. Boss Health Bar
- [x] Create health bar UI at top of screen (full width, red/green bar)
- [x] Bar shows boss name/title text above it
- [x] Bar depletes smoothly (tweened, not instant) as boss takes damage
- [x] Color changes: green (high) → yellow (mid) → red (low)
- [x] Bar appears with boss entry, disappears on boss death
- [x] Flash bar briefly white when boss takes damage

### What you'll learn
- **Custom UI with graphics**: `this.add.graphics()` to draw rectangles — `graphics.fillRect(x, y, width * hpPercent, height)`
- Lerped health bars: instead of instant updates, tween `displayHP` toward `actualHP` for smooth visual
- Color interpolation: `Phaser.Display.Color.Interpolate.ColorWithColor(green, red, 100, hpPercent)` for gradient health color
- UI layering: health bar is in HUD scene, receives damage events from GameScene

---

## 31. Boss Defeat Sequence
- [x] On boss HP reaching 0: freeze boss movement
- [x] Play series of small explosions at random positions on the boss body (staggered over 2 seconds)
- [x] Final large explosion (9-frame `explosion-animation`) centered on boss
- [x] Screen shake during explosion sequence: `this.cameras.main.shake(2000, 0.02)`
- [x] Screen flash on final explosion: `this.cameras.main.flash(500)`
- [x] Award large score bonus (5000/10000/15000 per stage boss)
- [x] Transition to Stage Clear screen

### What you'll learn
- **Death choreography**: important enemies deserve dramatic deaths. Multiple staggered explosions > one big explosion
- Staggered events: `this.time.addEvent({ delay: 200, callback: spawnSmallExplosion, repeat: 8 })` — fires 8 times, 200ms apart
- Camera effects: Phaser's built-in `shake()`, `flash()`, `fade()` — powerful one-liners for cinematic feel
- The "delayed satisfaction" principle: the boss doesn't just disappear — the 2-second death sequence is the player's reward

---

## 32. Ship Selection Screen
- [x] Add ship selection to MenuScene
- [x] Display 4 ship designs from `top-down-shooter-ship` (red variants: ship-01 to ship-04)
- [x] Show yellow variant toggle (same ships, different color)
- [x] Highlight selected ship with border/glow effect
- [x] Arrow keys or click to select, spacebar to confirm
- [ ] Load corresponding thrust animation for selected ship
- [x] Pass selected ship key to GameScene

### What you'll learn
- **Menu UI with sprites**: using game sprites in menus lets players preview what they'll play with
- Selection state: track `selectedIndex`, highlight with tint or scale: `ships[selectedIndex].setTint(0xffff00)`
- Player customization creates attachment: even cosmetic-only choice makes players feel invested
- Data flow: menu → game scene. Selected ship ID passed via scene data, GameScene creates the right sprite

---

## 33. High Score Persistence (ScoreManager.js update)
- [x] Save top 10 scores to `localStorage` as JSON array
- [x] Each entry: `{ score: number, date: string, stage: number }`
- [x] On game over: check if score qualifies for top 10
- [x] If qualified: insert into sorted list, trim to 10 entries
- [x] Display high score table on GameOverScene
- [x] Display high score table on MenuScene (accessible via "High Scores" option)
- [x] Highlight new high score entry with different color
- [x] Handle missing/corrupted localStorage gracefully (fallback to empty array)

### What you'll learn
- **localStorage API**: `localStorage.setItem('highScores', JSON.stringify(scores))` and `JSON.parse(localStorage.getItem('highScores'))`
- Defensive parsing: `try/catch` around `JSON.parse` because localStorage can be corrupted or cleared by the user
- Sorted insertion: `scores.push(newScore); scores.sort((a, b) => b.score - a.score); scores = scores.slice(0, 10)`
- Persistence across sessions is the simplest form of progression — it gives players a reason to replay

---

## 34. Screen Shake & Juice
- [x] Screen shake on any explosion: small shake for enemies, large shake for boss hits
  - `this.cameras.main.shake(duration, intensity)` — 100ms/0.005 for small, 300ms/0.01 for big
- [x] Screen flash on player death and boss death
- [ ] Hit stop (brief 50ms freeze) on significant impacts — pause physics for 1-2 frames
- [x] Enemy tint flash red on taking damage: `sprite.setTint(0xff0000)` then reset after 100ms
- [ ] Score text scales up briefly when increasing: `this.tweens.add({ scaleX: 1.2, scaleY: 1.2, yoyo: true, duration: 100 })`

### What you'll learn
- **Game juice**: the difference between a game that feels "flat" and one that feels "alive" is almost entirely screen shake, flash, and hit stop
- **Hit stop / freeze frames**: pausing the game for 30-50ms on impact makes hits feel powerful. `this.physics.pause(); this.time.delayedCall(50, () => this.physics.resume())`
- Yoyo tweens: `yoyo: true` plays the tween forward then backward — perfect for punch-scale effects
- Layering feedback: impact = hit stop + screen shake + tint flash + particle burst. Each is subtle alone, together they're powerful

---

## 35. Particle Effects
- [ ] Starfield particle emitter behind parallax layers (tiny white dots drifting downward)
- [ ] Thruster particles behind player ship (small orange/yellow dots trailing behind)
- [ ] Explosion particle burst accompanying sprite explosions (sparks flying outward)
- [ ] Boss ray charging particles (energy gathering toward boss before ray fires)

### What you'll learn
- Phaser particle system: `this.add.particles(x, y, 'particle', { speed, lifespan, scale, quantity, blendMode })`
- Blend modes: `ADD` blend mode makes particles glow (additive light) — essential for lasers, fire, energy
- Emitter shapes: `emitZone` defines where particles spawn (circle for explosions, line for thrusters)
- Performance: particles are cheap individually but add up. Set `maxParticles` to cap them

---

## 36. Difficulty Scaling Across Stages
- [x] Stage 1: baseline difficulty (1.0x multiplier)
- [x] Stage 2: 1.3x enemy speed, 1.2x fire rate, 1.5x enemy HP
- [x] Stage 3: 1.6x enemy speed, 1.5x fire rate, 2.0x enemy HP
- [x] More enemies per wave in later stages
- [x] Faster asteroid spawn in later stages
- [x] Boss HP and attack speed scale per stage

### What you'll learn
- **Multiplicative scaling**: one multiplier adjusts everything. `speed = baseSpeed * stageMultiplier` — clean and tunable
- Why difficulty should scale non-linearly: stage 2 is 30% harder, stage 3 is 60% harder — the gap grows because player skill grows too
- Boss scaling: same boss entity, different stats. Config-driven design pays off — you don't need 3 boss classes

---

## 37. Final Polish & QA
- [ ] Full playthrough test: Menu → Ship Select → Stage 1 → Boss 1 → Stage 2 → Boss 2 → Stage 3 → Boss 3 → Victory
- [ ] Verify high scores save and display correctly across sessions
- [ ] Test all 4 ship selections work properly
- [ ] Test all power-up types function correctly
- [ ] Test all 3 boss phases for each stage
- [ ] Test edge cases: dying during boss fight, collecting power-up while invincible
- [ ] Verify no memory leaks during extended play (30+ minutes)
- [ ] Test browser refresh/tab close doesn't corrupt high scores
- [ ] Final balance pass on difficulty curve
- [ ] Add favicon and page title for browser tab

### What you'll learn
- **End-to-end testing**: the full game loop must work seamlessly. Edge cases at transitions (dying during boss entry, boss dying during ray attack) are where bugs hide
- Memory profiling: Chrome DevTools → Memory → Take heap snapshots before and after a full stage. If memory grows, something isn't being cleaned up
- The "last 10%" problem: a game that's 90% done feels 50% done. Polish, edge cases, and balance are where the time goes
