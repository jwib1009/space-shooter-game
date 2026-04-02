import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, PIXEL_SCALE,
  BOSS_CONFIG,
} from '../config/constants.js';

/**
 * Boss manager — uses a physics group (same pattern as EnemyManager)
 * instead of extending Arcade.Sprite, which avoids body-sync issues.
 */
export class Boss {
  constructor(scene, stageConfig) {
    this.scene = scene;

    // Stats
    this.maxHP = stageConfig.bossHP;
    this.hp = this.maxHP;
    this.moveSpeed = stageConfig.bossSpeed;
    this.baseFireRate = stageConfig.bossFireRate;
    this.bossScore = BOSS_CONFIG.score;

    // State
    this.phase = 1;
    this.alive = true;
    this.entering = true;
    this.lastFired = 0;
    this.lastRayTime = 0;
    this.rayActive = false;
    this.moveDir = 1;

    // Boss sprite in a physics group (proven pattern)
    this.group = scene.physics.add.group({ allowGravity: false, maxSize: 1 });
    this.sprite = this.group.get(GAME_WIDTH / 2, -120, 'boss-body');
    this.sprite.setActive(true).setVisible(true);
    this.sprite.body.enable = true;
    this.sprite.setScale(BOSS_CONFIG.scale);
    this.sprite.setDepth(8);
    this.sprite.play('boss-idle');
    this.sprite.body.setAllowGravity(false);

    // Use default body (full frame) — no custom setSize needed
    // Source frame is 192x144, Phaser auto-scales the body

    // Bullet pool for boss projectiles
    this.bullets = scene.physics.add.group({
      allowGravity: false,
      maxSize: 40,
    });

    // Ray sprite (beam attack)
    this.raySprite = scene.add.sprite(GAME_WIDTH / 2, 0, 'boss-rays');
    this.raySprite.setScale(BOSS_CONFIG.scale * 0.8);
    this.raySprite.setDepth(7);
    this.raySprite.setVisible(false);
    this.raySprite.play('boss-rays-anim');

    // Ray hitbox
    this.rayHitbox = scene.physics.add.sprite(0, 0, null);
    this.rayHitbox.setVisible(false);
    this.rayHitbox.body.setSize(60, GAME_HEIGHT);
    this.rayHitbox.body.enable = false;

    // Decorative child sprites
    this.thrustSprite = scene.add.sprite(0, 0, 'boss-thrust');
    this.thrustSprite.setScale(BOSS_CONFIG.scale);
    this.thrustSprite.setDepth(7);
    this.thrustSprite.play('boss-thrust-anim');

    this.cannonLeft = scene.add.sprite(0, 0, 'boss-cannon-left');
    this.cannonLeft.setScale(BOSS_CONFIG.scale);
    this.cannonLeft.setDepth(9);

    this.cannonRight = scene.add.sprite(0, 0, 'boss-cannon-right');
    this.cannonRight.setScale(BOSS_CONFIG.scale);
    this.cannonRight.setDepth(9);

    this.helmetSprite = scene.add.sprite(0, 0, 'boss-helmet');
    this.helmetSprite.setScale(BOSS_CONFIG.scale);
    this.helmetSprite.setDepth(9);

    // Enter from top — target position
    this.targetY = 180;
    this.sprite.setVelocityY(120);
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }

  update(time) {
    if (!this.alive) return;

    const s = this.sprite;
    const sx = BOSS_CONFIG.scale / PIXEL_SCALE;

    // Position child sprites relative to boss
    this.thrustSprite.setPosition(s.x, s.y - 70 * sx);
    this.cannonLeft.setPosition(s.x - 65 * sx, s.y + 30 * sx);
    this.cannonRight.setPosition(s.x + 65 * sx, s.y + 30 * sx);
    this.helmetSprite.setPosition(s.x, s.y - 15 * sx);

    // Entering phase
    if (this.entering) {
      if (s.y >= this.targetY) {
        s.y = this.targetY;
        s.setVelocity(0, 0);
        this.entering = false;
      }
      return;
    }

    // Determine phase based on HP
    const hpPercent = this.hp / this.maxHP;
    if (hpPercent <= BOSS_CONFIG.phaseThresholds[1]) {
      this.phase = 3;
    } else if (hpPercent <= BOSS_CONFIG.phaseThresholds[0]) {
      this.phase = 2;
    } else {
      this.phase = 1;
    }

    // Side-to-side movement
    const speedMult = this.phase === 3 ? 1.5 : 1;
    if (s.x > GAME_WIDTH - 120) this.moveDir = -1;
    if (s.x < 120) this.moveDir = 1;
    s.setVelocityX(this.moveDir * this.moveSpeed * speedMult);
    s.setVelocityY(0);

    // Attack patterns
    const fireRate = this.phase === 3 ? this.baseFireRate * 0.6 : this.baseFireRate;

    if (time > this.lastFired + fireRate) {
      this.lastFired = time;

      if (this.phase === 1) {
        this.fireBolts();
      } else if (this.phase === 2) {
        this.fireBolts();
        if (time > this.lastRayTime + 5000 && !this.rayActive) {
          this.fireRays();
          this.lastRayTime = time;
        }
      } else {
        this.fireSpread();
      }
    }

    // Clean up off-screen bullets
    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active && (bullet.y > GAME_HEIGHT + 20 || bullet.y < -20 || bullet.x < -20 || bullet.x > GAME_WIDTH + 20)) {
        this.bullets.killAndHide(bullet);
        bullet.body.enable = false;
      }
    });
  }

  fireBolts() {
    this.fireBolt(this.cannonLeft.x, this.cannonLeft.y + 20);
    this.fireBolt(this.cannonRight.x, this.cannonRight.y + 20);
    this.scene.sound.play('sfx-shot2', { volume: 0.25 });
  }

  fireBolt(x, y) {
    const bullet = this.bullets.get(x, y, 'boss-bolt');
    if (!bullet) return;

    bullet.setActive(true).setVisible(true);
    bullet.body.enable = true;
    bullet.setScale(BOSS_CONFIG.scale);
    bullet.setDepth(6);
    bullet.body.setCircle(4);

    let vx = 0;
    let vy = BOSS_CONFIG.boltSpeed;
    if (this.scene.player && this.scene.player.alive) {
      const angle = Phaser.Math.Angle.Between(x, y, this.scene.player.x, this.scene.player.y);
      vx = Math.cos(angle) * BOSS_CONFIG.boltSpeed;
      vy = Math.sin(angle) * BOSS_CONFIG.boltSpeed;
    }
    bullet.setVelocity(vx, vy);
  }

  fireRays() {
    this.rayActive = true;
    this.raySprite.setVisible(true);
    this.raySprite.setPosition(this.sprite.x, this.sprite.y + 200);
    this.raySprite.setAlpha(0);
    this.rayHitbox.body.enable = true;
    this.rayHitbox.setPosition(this.sprite.x, this.sprite.y + 300);

    this.scene.tweens.add({
      targets: this.raySprite,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.scene.tweens.add({
          targets: [this.raySprite, this.rayHitbox],
          x: { from: this.sprite.x - 100, to: this.sprite.x + 100 },
          duration: BOSS_CONFIG.rayDuration,
          yoyo: true,
          onComplete: () => {
            this.raySprite.setVisible(false);
            this.rayHitbox.body.enable = false;
            this.rayActive = false;
          },
        });
      },
    });

    this.scene.cameras.main.flash(300, 255, 100, 0);
  }

  fireSpread() {
    const count = 7;
    const angleStep = 20;
    const startAngle = -((count - 1) / 2) * angleStep;

    for (let i = 0; i < count; i++) {
      const angleDeg = 90 + startAngle + i * angleStep;
      const angleRad = Phaser.Math.DegToRad(angleDeg);
      const bullet = this.bullets.get(this.sprite.x, this.sprite.y + 50, 'boss-bolt');
      if (!bullet) continue;

      bullet.setActive(true).setVisible(true);
      bullet.body.enable = true;
      bullet.setScale(BOSS_CONFIG.scale);
      bullet.setDepth(6);
      bullet.body.setCircle(4);

      const speed = BOSS_CONFIG.boltSpeed * 0.8;
      bullet.setVelocity(Math.cos(angleRad) * speed, Math.sin(angleRad) * speed);
    }
    this.scene.sound.play('sfx-shot2', { volume: 0.3 });
  }

  takeDamage(amount = 1) {
    if (!this.alive || this.entering) return 0;

    this.hp -= amount;
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(80, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });

    this.scene.cameras.main.shake(80, 0.005);

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
      return this.bossScore;
    }
    return 0;
  }

  die() {
    this.alive = false;
    this.sprite.body.enable = false;

    this.raySprite.setVisible(false);
    this.rayHitbox.body.enable = false;

    this.bullets.getChildren().forEach((b) => {
      if (b.active) {
        this.bullets.killAndHide(b);
        b.body.enable = false;
      }
    });

    this.scene.cameras.main.shake(500, 0.02);
    this.scene.cameras.main.flash(400, 255, 255, 255);

    const explosionCount = 8;
    for (let i = 0; i < explosionCount; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        const ex = this.sprite.x + Phaser.Math.Between(-80, 80);
        const ey = this.sprite.y + Phaser.Math.Between(-60, 60);
        const exp = this.scene.add.sprite(ex, ey, 'big-explosion1');
        exp.setScale(BOSS_CONFIG.scale * 0.8);
        exp.setDepth(15);
        exp.play('big-explosion');
        exp.once('animationcomplete', () => exp.destroy());
        this.scene.sound.play('sfx-explosion', { volume: 0.5 + Math.random() * 0.3 });
      });
    }

    this.scene.time.delayedCall(explosionCount * 200, () => {
      const finalExp = this.scene.add.sprite(this.sprite.x, this.sprite.y, 'big-explosion1');
      finalExp.setScale(BOSS_CONFIG.scale * 1.5);
      finalExp.setDepth(15);
      finalExp.play('big-explosion');
      finalExp.once('animationcomplete', () => finalExp.destroy());
      this.scene.sound.play('sfx-explosion', { volume: 0.9 });

      this.sprite.setVisible(false);
      this.thrustSprite.setVisible(false);
      this.cannonLeft.setVisible(false);
      this.cannonRight.setVisible(false);
      this.helmetSprite.setVisible(false);

      this.scene.time.delayedCall(1000, () => {
        this.scene.events.emit('bossDefeated');
      });
    });
  }

  getHPPercent() {
    return this.hp / this.maxHP;
  }

  destroy() {
    this.thrustSprite.destroy();
    this.cannonLeft.destroy();
    this.cannonRight.destroy();
    this.helmetSprite.destroy();
    this.raySprite.destroy();
    this.rayHitbox.destroy();
    this.bullets.destroy(true);
    this.group.destroy(true);
  }
}
