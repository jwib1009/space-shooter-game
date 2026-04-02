import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, PIXEL_SCALE,
  PLAYER_SPEED, PLAYER_FIRE_RATE, PLAYER_LIVES,
  INVINCIBILITY_DURATION, MAX_PLAYER_BULLETS,
} from '../config/constants.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene) {
    super(scene, GAME_WIDTH / 2, GAME_HEIGHT - 60, 'player1');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(PIXEL_SCALE);
    this.setAngle(-90);
    this.setCollideWorldBounds(true);
    this.body.setCircle(8, 5, 3);
    this.setDepth(10);

    this.play('player-idle');

    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.fireKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Bullet pool
    this.bullets = scene.physics.add.group({
      maxSize: MAX_PLAYER_BULLETS,
      allowGravity: false,
    });

    // State
    this.lastFired = 0;
    this.alive = true;
    this.lives = PLAYER_LIVES;
    this.invincible = false;

    // Shield
    this.shieldHP = 0;
    this.shieldSprite = scene.add.sprite(this.x, this.y, 'energy-shield');
    this.shieldSprite.setScale(PIXEL_SCALE * 1.2);
    this.shieldSprite.setDepth(11);
    this.shieldSprite.setVisible(false);
    this.shieldSprite.play('shield-anim');

    // Weapon system
    this.weapon = new WeaponSystem(scene, this);

  }

  update(time) {
    if (!this.alive) return;

    // Movement
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = 1;

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    this.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);

    // Shield follows player
    this.shieldSprite.setPosition(this.x, this.y);

    // Shooting
    const mouseDown = this.scene.input.activePointer.isDown;
    if ((this.fireKey.isDown || mouseDown) && time > this.lastFired + PLAYER_FIRE_RATE) {
      this.weapon.fire(time);

      // Muzzle flash
      const flash = this.scene.add.sprite(this.x, this.y - 45, 'flash');
      flash.setScale(PIXEL_SCALE);
      flash.setAngle(-90);
      flash.setDepth(11);
      this.scene.time.delayedCall(60, () => flash.destroy());
    }
  }

  activateShield() {
    this.shieldHP = 3;
    this.shieldSprite.setVisible(true);
    this.shieldSprite.setAlpha(1);
    this.shieldSprite.clearTint();
  }

  hitShield() {
    this.shieldHP--;
    // Flash shield red
    this.shieldSprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.shieldSprite.visible) this.shieldSprite.clearTint();
    });

    // Visual feedback: fade shield as it weakens
    if (this.shieldHP <= 0) {
      this.shieldSprite.setVisible(false);
      this.shieldHP = 0;
    } else {
      this.shieldSprite.setAlpha(this.shieldHP / 3);
    }
  }

  hasShield() {
    return this.shieldHP > 0;
  }

  hit() {
    if (this.invincible) return false;

    if (this.hasShield()) {
      this.hitShield();
      return false; // not dead
    }

    // Lose a life
    this.lives--;
    this.scene.events.emit('updateLives', this.lives);

    if (this.lives <= 0) {
      this.die();
      return true; // dead for real
    }

    // Respawn immediately — never disable the body
    this.respawn();
    return false;
  }

  respawn() {
    // Explosion at current position
    const explosion = this.scene.add.sprite(this.x, this.y, 'explosion1');
    explosion.setScale(PIXEL_SCALE);
    explosion.play('explosion');
    explosion.once('animationcomplete', () => explosion.destroy());
    this.scene.sound.play('sfx-explosion', { volume: 0.5 });

    // Prevent further damage — body stays enabled for physics/movement
    this.invincible = true;

    // Reposition directly — avoid body.reset() which can cause issues
    this.x = GAME_WIDTH / 2;
    this.y = GAME_HEIGHT - 60;
    this.setVelocity(0, 0);

    // Blink effect
    this.scene.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.alive) this.setAlpha(this.alpha === 1 ? 0.3 : 1);
      },
      repeat: Math.floor(INVINCIBILITY_DURATION / 100) - 1,
    });

    // End invincibility
    this.scene.time.delayedCall(INVINCIBILITY_DURATION, () => {
      this.invincible = false;
      this.setAlpha(1);
    });
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    this.setVisible(false);
    this.body.enable = false;
    this.shieldSprite.setVisible(false);

    const explosion = this.scene.add.sprite(this.x, this.y, 'explosion1');
    explosion.setScale(PIXEL_SCALE);
    explosion.play('explosion');
    explosion.once('animationcomplete', () => explosion.destroy());
    this.scene.sound.play('sfx-explosion', { volume: 0.6 });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    // Recycle off-screen bullets
    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active && (bullet.y < -20 || bullet.x < -20 || bullet.x > 500)) {
        this.bullets.killAndHide(bullet);
        bullet.body.enable = false;
      }
    });
  }
}
