import Phaser from 'phaser';
import {
  GAME_WIDTH, PIXEL_SCALE,
  ASTEROID_LARGE, ASTEROID_SMALL, MAX_ASTEROIDS,
} from '../config/constants.js';

export class AsteroidManager {
  constructor(scene) {
    this.scene = scene;

    this.group = scene.physics.add.group({
      allowGravity: false,
      maxSize: MAX_ASTEROIDS,
    });
  }

  spawnLarge() {
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
    const asteroid = this.group.get(x, -40, ASTEROID_LARGE.key);
    if (!asteroid) return null;

    asteroid.setActive(true).setVisible(true);
    asteroid.body.enable = true;
    asteroid.setScale(PIXEL_SCALE);
    asteroid.setDepth(4);

    asteroid.hp = ASTEROID_LARGE.hp;
    asteroid.score = ASTEROID_LARGE.score;
    asteroid.isLarge = true;
    // Circle hitbox — sprite is 35x37, use r=14 centered
    asteroid.body.setCircle(14, 3, 5);

    asteroid.setVelocityY(ASTEROID_LARGE.speed);
    asteroid.setVelocityX(Phaser.Math.Between(-30, 30));
    asteroid.setAngularVelocity(Phaser.Math.Between(-60, 60));

    return asteroid;
  }

  spawnSmall(x, y) {
    const asteroid = this.group.get(x, y, ASTEROID_SMALL.key);
    if (!asteroid) return null;

    asteroid.setActive(true).setVisible(true);
    asteroid.body.enable = true;
    asteroid.setScale(PIXEL_SCALE);
    asteroid.setDepth(4);

    asteroid.hp = ASTEROID_SMALL.hp;
    asteroid.score = ASTEROID_SMALL.score;
    asteroid.isLarge = false;
    // Tighter hitbox — sprite is 14x13, use ~10x10 center
    asteroid.body.setCircle(5, 2, 2);

    asteroid.setVelocityY(ASTEROID_SMALL.speed);
    asteroid.setVelocityX(Phaser.Math.Between(-70, 70));
    asteroid.setAngularVelocity(Phaser.Math.Between(-100, 100));

    return asteroid;
  }

  update() {
    this.group.getChildren().forEach((asteroid) => {
      if (asteroid.active && asteroid.y > 780) {
        this.group.killAndHide(asteroid);
        asteroid.body.enable = false;
      }
    });
  }

  damageAsteroid(asteroid, damage = 1) {
    if (asteroid._pendingKill) return 0;
    asteroid.hp -= damage;
    // Flash
    asteroid.setTint(0xff8800);
    this.scene.time.delayedCall(80, () => {
      if (asteroid.active) asteroid.clearTint();
    });

    if (asteroid.hp <= 0) {
      const score = asteroid.score;
      this.destroyAsteroid(asteroid);
      return score;
    }
    return 0;
  }

  destroyAsteroid(asteroid) {
    if (asteroid._pendingKill) return;
    asteroid._pendingKill = true;

    const x = asteroid.x;
    const y = asteroid.y;
    const wasLarge = asteroid.isLarge;

    // Small explosion
    const explosion = this.scene.add.sprite(x, y, 'explosion1');
    explosion.setScale(wasLarge ? PIXEL_SCALE : PIXEL_SCALE * 0.6);
    explosion.play('explosion');
    explosion.once('animationcomplete', () => explosion.destroy());
    this.scene.sound.play('sfx-explosion', { volume: 0.25 });

    // Defer body changes to after physics step
    if (this.scene.postPhysicsQueue) {
      this.scene.postPhysicsQueue.push(() => {
        this.group.killAndHide(asteroid);
        asteroid.body.enable = false;
        asteroid._pendingKill = false;
        if (wasLarge) {
          this.spawnSmall(x - 15, y);
          this.spawnSmall(x + 15, y);
        }
      });
    } else {
      this.group.killAndHide(asteroid);
      asteroid.body.enable = false;
      asteroid._pendingKill = false;
      if (wasLarge) {
        this.spawnSmall(x - 15, y);
        this.spawnSmall(x + 15, y);
      }
    }
  }
}
