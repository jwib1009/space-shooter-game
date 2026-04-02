import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
  BG_SPEED_BACK, BG_SPEED_STARS,
  ENEMY_TYPES, PIXEL_SCALE, EXTRA_LIFE_SCORE,
} from '../config/constants.js';
import { Player } from '../entities/Player.js';
import { EnemyManager } from '../entities/Enemy.js';
import { AsteroidManager } from '../entities/Asteroid.js';
import { PowerUpManager } from '../entities/PowerUp.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { WaveManager } from '../systems/WaveManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // Parallax background
    const bgScale = GAME_WIDTH / 272;
    this.bgBack = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-back')
      .setOrigin(0, 0).setScale(bgScale).setDepth(0);
    this.bgStars = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars')
      .setOrigin(0, 0).setScale(bgScale).setDepth(1);

    // Systems
    this.scoreManager = new ScoreManager();
    this.enemyManager = new EnemyManager(this);
    this.asteroidManager = new AsteroidManager(this);
    this.powerUpManager = new PowerUpManager(this);
    this.waveManager = new WaveManager(this);

    // Queue for deferred body operations (applied after physics step)
    this.postPhysicsQueue = [];

    // Player
    this.player = new Player(this);

    // Track extra lives awarded
    this.nextLifeAt = EXTRA_LIFE_SCORE;

    // Launch HUD overlay scene
    this.scene.launch('HUD');

    // Wire wave events to HUD
    this.waveManager.events.on('waveStart', (wave) => {
      this.events.emit('updateWave', wave);
      this.events.emit('announceWave', wave);
    });

    // Set up collisions
    this.setupCollisions();

    // Flush deferred kills after each physics step
    this.physics.world.on('worldstep', () => {
      for (const fn of this.postPhysicsQueue) fn();
      this.postPhysicsQueue.length = 0;
      // Safety: ensure player body is never disabled by deferred kills
      if (this.player.alive && !this.player.body.enable) {
        this.player.body.enable = true;
      }
    });

    // Start wave system
    this.waveManager.start();
  }

  setupCollisions() {
    // Player bullets hit enemies
    this.physics.add.overlap(
      this.player.bullets,
      this.enemyManager.group,
      this.bulletHitEnemy,
      null,
      this
    );

    // Player bullets hit asteroids
    this.physics.add.overlap(
      this.player.bullets,
      this.asteroidManager.group,
      this.bulletHitAsteroid,
      null,
      this
    );

    // Enemy bullets hit player
    this.physics.add.overlap(
      this.enemyManager.bullets,
      this.player,
      this.enemyBulletHitPlayer,
      null,
      this
    );

    // Enemy collides with player
    this.physics.add.overlap(
      this.enemyManager.group,
      this.player,
      this.enemyHitPlayer,
      null,
      this
    );

    // Asteroid collides with player
    this.physics.add.overlap(
      this.asteroidManager.group,
      this.player,
      this.asteroidHitPlayer,
      null,
      this
    );

    // Player overlaps power-ups
    this.physics.add.overlap(
      this.player,
      this.powerUpManager.group,
      this.collectPowerUp,
      null,
      this
    );
  }

  // Helper: mark a sprite as pending kill so overlap won't re-trigger,
  // but defer the actual body disable to after the physics step.
  deferKill(sprite, group) {
    if (sprite._pendingKill) return;
    sprite._pendingKill = true;
    this.postPhysicsQueue.push(() => {
      group.killAndHide(sprite);
      sprite.body.enable = false;
      sprite._pendingKill = false;
    });
  }

  bulletHitEnemy(bullet, enemy) {
    if (!bullet.active || bullet._pendingKill || !enemy.active || enemy._pendingKill) return;

    // Piercing bullets pass through; non-piercing are destroyed
    if (!bullet.piercing) {
      this.deferKill(bullet, this.player.bullets);
    }

    // Hit FX
    this.spawnHitFX(bullet.x, bullet.y);

    // Damage enemy
    const score = this.enemyManager.damageEnemy(enemy);
    if (score > 0) {
      this.addScore(score, enemy.x, enemy.y);
      // Drop power-up chance
      this.powerUpManager.tryDrop(enemy.x, enemy.y);
    }
  }

  bulletHitAsteroid(bullet, asteroid) {
    if (!bullet.active || bullet._pendingKill || !asteroid.active || asteroid._pendingKill) return;

    if (!bullet.piercing) {
      this.deferKill(bullet, this.player.bullets);
    }

    this.spawnHitFX(bullet.x, bullet.y);

    const score = this.asteroidManager.damageAsteroid(asteroid);
    if (score > 0) {
      this.addScore(score, asteroid.x, asteroid.y);
    }
  }

  enemyBulletHitPlayer(bullet, player) {
    if (!bullet.active || bullet._pendingKill || !this.player.alive) return;

    this.deferKill(bullet, this.enemyManager.bullets);
    this.handlePlayerHit();
  }

  enemyHitPlayer(enemy, player) {
    if (!enemy.active || enemy._pendingKill || !this.player.alive) return;

    this.enemyManager.destroyEnemy(enemy);
    this.handlePlayerHit();
  }

  asteroidHitPlayer(asteroid, player) {
    if (!asteroid.active || asteroid._pendingKill || !this.player.alive) return;

    this.asteroidManager.destroyAsteroid(asteroid);
    this.handlePlayerHit();
  }

  handlePlayerHit() {
    const dead = this.player.hit();
    if (dead) {
      // All lives lost — game over
      this.time.delayedCall(1500, () => {
        this.scene.start('GameOver', { score: this.scoreManager.getScore() });
      });
    }
  }

  collectPowerUp(player, powerup) {
    if (!powerup.active || powerup._pendingKill) return;

    const type = this.powerUpManager.collect(powerup);

    switch (type) {
      case 'spread':
        this.player.weapon.setWeapon('spread');
        this.events.emit('updateWeapon', this.player.weapon.getDisplayName());
        break;
      case 'laser':
        this.player.weapon.setWeapon('laser');
        this.events.emit('updateWeapon', this.player.weapon.getDisplayName());
        break;
      case 'shield':
        this.player.activateShield();
        break;
      case 'bonus':
        this.addScore(500, player.x, player.y);
        break;
    }
  }

  addScore(points, x, y) {
    this.scoreManager.add(points);
    const total = this.scoreManager.getScore();
    this.events.emit('updateScore', total);
    this.events.emit('scorePop', x, y, points);

    // Extra life at score thresholds
    if (total >= this.nextLifeAt) {
      this.player.lives++;
      this.events.emit('updateLives', this.player.lives);
      this.nextLifeAt += EXTRA_LIFE_SCORE;
      // Flash screen green for extra life
      this.cameras.main.flash(200, 0, 255, 0);
    }
  }

  spawnHitFX(x, y) {
    const hit = this.add.sprite(x, y, 'hit1');
    hit.setScale(PIXEL_SCALE);
    hit.setDepth(15);
    hit.play('hit-fx');
    hit.once('animationcomplete', () => hit.destroy());
    this.sound.play('sfx-hit', { volume: 0.2 });
  }

  update(time, delta) {
    // Parallax scrolling
    this.bgBack.tilePositionY -= BG_SPEED_BACK;
    this.bgStars.tilePositionY -= BG_SPEED_STARS;

    // Update entities
    this.player.update(time);
    this.enemyManager.update(time);
    this.asteroidManager.update();
    this.powerUpManager.update(time);

  }
}
