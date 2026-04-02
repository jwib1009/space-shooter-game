import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Loading bar
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const bar = this.add.graphics();
    const box = this.add.graphics();
    box.fillStyle(0x222222, 0.8);
    box.fillRect(w / 4, h / 2 - 15, w / 2, 30);

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(0x00ff00, 1);
      bar.fillRect(w / 4 + 4, h / 2 - 11, (w / 2 - 8) * value, 22);
    });

    this.load.on('complete', () => {
      bar.destroy();
      box.destroy();
    });

    // ── Player ──
    this.load.image('player1', 'assets/player/player1.png');
    this.load.image('player2', 'assets/player/player2.png');
    this.load.image('player3', 'assets/player/player3.png');

    // ── Enemies (static) ──
    this.load.image('enemy1', 'assets/enemies/enemy1.png');
    this.load.image('enemy2', 'assets/enemies/enemy2.png');
    this.load.image('enemy3', 'assets/enemies/enemy3.png');
    this.load.image('enemy-small1', 'assets/enemies/enemy-small1.png');
    this.load.image('enemy-medium1', 'assets/enemies/enemy-medium1.png');
    this.load.image('enemy-big1', 'assets/enemies/enemy-big1.png');

    // ── Enemies (animated spritesheets) ──
    this.load.spritesheet('alien-flying', 'assets/enemies-animated/alien-flying.png', {
      frameWidth: 83,
      frameHeight: 64,
    });

    // ── Asteroids ──
    this.load.image('asteroid', 'assets/asteroids/asteroid.png');
    this.load.image('asteroid-small', 'assets/asteroids/asteroid-small.png');
    this.load.image('asteroid-v1', 'assets/asteroids/asteroid-1.png');
    this.load.image('asteroid-v2', 'assets/asteroids/asteroid-2.png');
    this.load.image('asteroid-v3', 'assets/asteroids/asteroid-3.png');
    this.load.image('asteroid-v4', 'assets/asteroids/asteroid-4.png');
    this.load.image('asteroid-v5', 'assets/asteroids/asteroid-5.png');

    // ── Bullets / Weapons ──
    this.load.image('bullet', 'assets/bullets/shoot1.png');
    this.load.image('bullet2', 'assets/bullets/shoot2.png');
    this.load.image('laser-bullet', 'assets/weapons/laser-bolts1.png');
    this.load.image('bolt-bullet', 'assets/weapons/bolt1.png');
    this.load.spritesheet('enemy-bullet', 'assets/bullets/enemy-projectile.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // ── Explosions ──
    this.load.image('explosion1', 'assets/explosions/explosion1.png');
    this.load.image('explosion2', 'assets/explosions/explosion2.png');
    this.load.image('explosion3', 'assets/explosions/explosion3.png');
    this.load.image('explosion4', 'assets/explosions/explosion4.png');
    this.load.image('explosion5', 'assets/explosions/explosion5.png');

    // ── Large Explosions (boss death) ──
    for (let i = 1; i <= 9; i++) {
      this.load.image(`big-explosion${i}`, `assets/explosions-large/explosion-animation${i}.png`);
    }

    // ── Hit FX ──
    this.load.image('hit1', 'assets/hit/hit1.png');
    this.load.image('hit2', 'assets/hit/hit2.png');
    this.load.image('hit3', 'assets/hit/hit3.png');
    this.load.image('hit4', 'assets/hit/hit4.png');

    // ── Flash ──
    this.load.image('flash', 'assets/flash/flash.png');

    // ── Power-ups ──
    this.load.image('powerup-spread', 'assets/powerups/power-up1.png');
    this.load.image('powerup-laser', 'assets/powerups/power-up2.png');
    this.load.image('powerup-shield', 'assets/powerups/power-up3.png');
    this.load.image('powerup-bonus', 'assets/powerups/power-up4.png');

    // ── Shield FX ──
    this.load.spritesheet('energy-shield', 'assets/shield/energy-shield.png', {
      frameWidth: 51,
      frameHeight: 47,
    });

    // ── Backgrounds — Stage 1 ──
    this.load.image('bg-back', 'assets/backgrounds/bg-back.png');
    this.load.image('bg-stars', 'assets/backgrounds/bg-stars.png');
    this.load.image('bg-planet', 'assets/backgrounds/bg-planet.png');

    // ── Backgrounds — Stage 2 ──
    this.load.image('bg-back-s2', 'assets/backgrounds-stage2/blue-back.png');
    this.load.image('bg-stars-s2', 'assets/backgrounds-stage2/blue-stars.png');

    // ── Backgrounds — Stage 3 ──
    this.load.image('bg-back-s3', 'assets/backgrounds-stage3/parallax-space-backgound.png');
    this.load.image('bg-stars-s3', 'assets/backgrounds-stage3/parallax-space-stars.png');

    // ── Boss sprites ──
    this.load.spritesheet('boss-body', 'assets/boss/boss.png', {
      frameWidth: 192,
      frameHeight: 144,
    });
    this.load.spritesheet('boss-thrust', 'assets/boss/boss-thrust.png', {
      frameWidth: 64,
      frameHeight: 48,
    });
    this.load.image('boss-bolt', 'assets/boss/bolt.png');
    this.load.spritesheet('boss-rays', 'assets/boss/rays.png', {
      frameWidth: 64,
      frameHeight: 224,
    });
    this.load.image('boss-cannon-left', 'assets/boss/cannon-left.png');
    this.load.image('boss-cannon-right', 'assets/boss/cannon-right.png');
    this.load.image('boss-helmet', 'assets/boss/helmet.png');

    // ── Sounds ──
    this.load.audio('sfx-explosion', 'assets/sounds/explosion.wav');
    this.load.audio('sfx-hit', 'assets/sounds/hit.wav');
    this.load.audio('sfx-shot1', 'assets/sounds/shot1.wav');
    this.load.audio('sfx-shot2', 'assets/sounds/shot2.wav');
  }

  create() {
    // ── Animations ──
    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player1' }, { key: 'player2' }, { key: 'player3' }, { key: 'player2' }],
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'explosion',
      frames: [
        { key: 'explosion1' }, { key: 'explosion2' }, { key: 'explosion3' },
        { key: 'explosion4' }, { key: 'explosion5' },
      ],
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: 'big-explosion',
      frames: [
        { key: 'big-explosion1' }, { key: 'big-explosion2' }, { key: 'big-explosion3' },
        { key: 'big-explosion4' }, { key: 'big-explosion5' }, { key: 'big-explosion6' },
        { key: 'big-explosion7' }, { key: 'big-explosion8' }, { key: 'big-explosion9' },
      ],
      frameRate: 14,
      repeat: 0,
    });

    this.anims.create({
      key: 'hit-fx',
      frames: [{ key: 'hit1' }, { key: 'hit2' }, { key: 'hit3' }, { key: 'hit4' }],
      frameRate: 16,
      repeat: 0,
    });

    this.anims.create({
      key: 'enemy-bullet-anim',
      frames: this.anims.generateFrameNumbers('enemy-bullet', { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: 'alien-fly-anim',
      frames: this.anims.generateFrameNumbers('alien-flying', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'shield-anim',
      frames: this.anims.generateFrameNumbers('energy-shield', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    // Boss animations
    this.anims.create({
      key: 'boss-idle',
      frames: this.anims.generateFrameNumbers('boss-body', { start: 0, end: 4 }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: 'boss-thrust-anim',
      frames: this.anims.generateFrameNumbers('boss-thrust', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'boss-rays-anim',
      frames: this.anims.generateFrameNumbers('boss-rays', { start: 0, end: 10 }),
      frameRate: 12,
      repeat: -1,
    });

    this.scene.start('Menu');
  }
}
