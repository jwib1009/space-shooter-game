import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT,
  BG_SPEED_BACK, BG_SPEED_STARS,
  PIXEL_SCALE, EXTRA_LIFE_SCORE, STAGES,
} from '../config/constants.js';
import { Player } from '../entities/Player.js';
import { Boss } from '../entities/Boss.js';
import { EnemyManager } from '../entities/Enemy.js';
import { AsteroidManager } from '../entities/Asteroid.js';
import { PowerUpManager } from '../entities/PowerUp.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { WaveManager } from '../systems/WaveManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.shipTint = data?.ship || null; // color tint for selected ship
  }

  create() {
    // Parallax background
    this.bgScale = GAME_WIDTH / 272;
    this.bgBack = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-back')
      .setOrigin(0, 0).setScale(this.bgScale).setDepth(0);
    this.bgStars = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars')
      .setOrigin(0, 0).setScale(this.bgScale).setDepth(1);

    // Systems
    this.scoreManager = new ScoreManager();
    this.enemyManager = new EnemyManager(this);
    this.asteroidManager = new AsteroidManager(this);
    this.powerUpManager = new PowerUpManager(this);
    this.waveManager = new WaveManager(this);

    // Queue for deferred body operations (applied after physics step)
    this.postPhysicsQueue = [];

    // Boss reference
    this.boss = null;

    // Player
    this.player = new Player(this);
    if (this.shipTint) this.player.setTint(this.shipTint);

    // Track extra lives awarded
    this.nextLifeAt = EXTRA_LIFE_SCORE;

    // Launch HUD overlay scene
    this.scene.launch('HUD');

    // Wire wave events to HUD
    this.waveManager.events.on('waveStart', (wave) => {
      this.events.emit('updateWave', wave);
      this.events.emit('announceWave', wave);
    });

    this.waveManager.events.on('stageStart', (stage) => {
      this.events.emit('updateStage', stage + 1);
    });

    this.waveManager.events.on('bossStart', (stage) => {
      this.spawnBoss(stage);
    });

    this.waveManager.events.on('stageClear', (clearedStage) => {
      this.showStageClear(clearedStage);
    });

    this.waveManager.events.on('victory', () => {
      this.showVictory();
    });

    this.events.on('bossDefeated', () => {
      const stageConfig = STAGES[this.waveManager.getCurrentStage()];
      if (stageConfig) {
        this.addScore(stageConfig.clearBonus, GAME_WIDTH / 2, GAME_HEIGHT / 2);
      }
      this.waveManager.onBossDefeated();
    });

    // Set up collisions
    this.setupCollisions();

    // Flush deferred kills after each physics step
    this.physics.world.on('worldstep', () => {
      for (const fn of this.postPhysicsQueue) fn();
      this.postPhysicsQueue.length = 0;
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

  setupBossCollisions() {
    if (!this.boss) return;

    // Player bullets hit boss (group-to-group — proven pattern)
    this.bossOverlap = this.physics.add.overlap(
      this.player.bullets,
      this.boss.group,
      this.bulletHitBoss,
      null,
      this
    );

    // Boss bullets hit player
    this.bossBulletOverlap = this.physics.add.overlap(
      this.boss.bullets,
      this.player,
      this.bossBulletHitPlayer,
      null,
      this
    );

    // Boss ray hits player
    this.bossRayOverlap = this.physics.add.overlap(
      this.boss.rayHitbox,
      this.player,
      this.bossRayHitPlayer,
      null,
      this
    );
  }

  // Helper: mark a sprite as pending kill
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

    if (!bullet.piercing) {
      this.deferKill(bullet, this.player.bullets);
    }

    this.spawnHitFX(bullet.x, bullet.y);

    const score = this.enemyManager.damageEnemy(enemy);
    if (score > 0) {
      this.addScore(score, enemy.x, enemy.y);
      this.powerUpManager.tryDrop(enemy.x, enemy.y);
    }
  }

  bulletHitBoss(bullet, boss) {
    if (!bullet.active || bullet._pendingKill || !this.boss || !this.boss.alive) return;

    if (!bullet.piercing) {
      this.deferKill(bullet, this.player.bullets);
    }

    this.spawnHitFX(bullet.x, bullet.y);

    const score = this.boss.takeDamage(1);
    if (score > 0) {
      this.addScore(score, this.boss.x, this.boss.y);
    }

    // Update boss HP on HUD
    this.events.emit('updateBossHP', this.boss.getHPPercent());
  }

  bossBulletHitPlayer(bullet, player) {
    if (!bullet.active || !this.player.alive) return;

    this.boss.bullets.killAndHide(bullet);
    bullet.body.enable = false;
    this.handlePlayerHit();
  }

  bossRayHitPlayer(rayHitbox, player) {
    if (!this.player.alive) return;
    if (!this.boss?.canDamageWithRay(this.time.now)) return;
    this.handlePlayerHit();
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
      const isNewHighScore = ScoreManager.isHighScore(this.scoreManager.getScore());
      // Screen shake on death
      this.cameras.main.shake(300, 0.015);
      this.time.delayedCall(1500, () => {
        ScoreManager.saveHighScore(this.scoreManager.getScore());
        this.scene.start('GameOver', {
          score: this.scoreManager.getScore(),
          stage: this.waveManager.getCurrentStage() + 1,
          isNewHighScore,
        });
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

    if (total >= this.nextLifeAt) {
      this.player.lives++;
      this.events.emit('updateLives', this.player.lives);
      this.nextLifeAt += EXTRA_LIFE_SCORE;
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

  // ── Boss ──

  spawnBoss(stageIndex) {
    const stageConfig = STAGES[stageIndex];
    this.events.emit('announceBoss');

    this.time.delayedCall(2000, () => {
      this.boss = new Boss(this, stageConfig);
      this.setupBossCollisions();
      this.events.emit('showBossHP');
    });
  }

  cleanupBoss() {
    if (this.bossOverlap) this.physics.world.removeCollider(this.bossOverlap);
    if (this.bossBulletOverlap) this.physics.world.removeCollider(this.bossBulletOverlap);
    if (this.bossRayOverlap) this.physics.world.removeCollider(this.bossRayOverlap);
    if (this.boss) {
      this.boss.destroy();
      this.boss = null;
    }
    this.events.emit('hideBossHP');
  }

  // ── Stage transitions ──

  showStageClear(clearedStage) {
    this.cleanupBoss();

    const stageName = STAGES[clearedStage].name;
    const bonus = STAGES[clearedStage].clearBonus;

    // "STAGE CLEAR" overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5);
    overlay.setDepth(50);

    const clearText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, `${stageName} CLEAR!`, {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#003300',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(51);

    const bonusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Bonus: +${bonus}`, {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(51);

    this.time.delayedCall(3000, () => {
      overlay.destroy();
      clearText.destroy();
      bonusText.destroy();

      // Swap backgrounds for next stage
      const nextStage = STAGES[this.waveManager.getCurrentStage()];
      if (nextStage) {
        this.bgBack.setTexture(nextStage.bgBack);
        this.bgStars.setTexture(nextStage.bgStars);
      }

      this.waveManager.startNextStage();
    });
  }

  showVictory() {
    this.cleanupBoss();

    const isNewHighScore = ScoreManager.isHighScore(this.scoreManager.getScore());
    ScoreManager.saveHighScore(this.scoreManager.getScore());

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    overlay.setDepth(50);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, 'VICTORY!', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ffdd00',
      fontStyle: 'bold',
      stroke: '#ff6600',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(51);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Final Score: ${this.scoreManager.getScore()}`, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(51);

    const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'Press SPACE to Continue', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(51);

    this.tweens.add({
      targets: prompt,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.time.delayedCall(1000, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('GameOver', {
          score: this.scoreManager.getScore(),
          stage: STAGES.length,
          victory: true,
          isNewHighScore,
        });
      });
    });
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

    // Update boss
    if (this.boss && this.boss.alive) {
      this.boss.update(time);
    }
  }
}
