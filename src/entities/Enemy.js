import Phaser from 'phaser';
import {
  GAME_WIDTH, PIXEL_SCALE,
  ENEMY_BULLET_SPEED, MAX_ENEMY_BULLETS,
} from '../config/constants.js';

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;

    this.group = scene.physics.add.group({
      allowGravity: false,
      maxSize: 20,
    });

    this.bullets = scene.physics.add.group({
      allowGravity: false,
      maxSize: MAX_ENEMY_BULLETS,
    });
  }

  spawn(typeConfig, spawnX) {
    const x = spawnX != null ? spawnX : Phaser.Math.Between(40, GAME_WIDTH - 40);
    const enemy = this.group.get(x, -30, typeConfig.key);
    if (!enemy) return null;

    enemy.setActive(true).setVisible(true);
    enemy.body.enable = true;
    enemy._pendingKill = false;
    enemy.clearTint();
    enemy.setScale(PIXEL_SCALE);
    enemy.setAngle(typeConfig.angle != null ? typeConfig.angle : -90);
    enemy.setDepth(5);

    // Animated enemies
    if (typeConfig.animated && typeConfig.animKey) {
      enemy.play(typeConfig.animKey);
      enemy.setScale(PIXEL_SCALE * 0.7);
    }

    // Hitbox — circle based on sprite key
    const isLarge = ['enemy-big1', 'enemy-medium1'].includes(typeConfig.key);
    const radius = isLarge ? 12 : typeConfig.animated ? 12 : 10;
    enemy.body.setCircle(radius, enemy.width / 2 - radius, enemy.height / 2 - radius);

    // Data
    enemy.hp = typeConfig.hp;
    enemy.score = typeConfig.score;
    enemy.pattern = typeConfig.pattern;
    enemy.fireRate = typeConfig.fireRate;
    enemy.lastFired = 0;
    enemy.spawnTime = this.scene.time.now;
    enemy.baseX = x;
    enemy.moveSpeed = typeConfig.speed;

    if (typeConfig.pattern === 'straight') {
      enemy.setVelocityY(typeConfig.speed);
    } else if (typeConfig.pattern === 'zigzag') {
      enemy.setVelocityY(typeConfig.speed);
    } else if (typeConfig.pattern === 'dive') {
      enemy.setVelocityY(typeConfig.speed * 0.5);
    }

    return enemy;
  }

  update(time) {
    this.group.getChildren().forEach((enemy) => {
      if (!enemy.active) return;

      if (enemy.y > 780) {
        this.group.killAndHide(enemy);
        enemy.body.enable = false;
        // Count as "left" for wave tracking
        if (this.scene.waveManager) {
          this.scene.waveManager.onEnemyKilled();
        }
        return;
      }

      // Movement patterns
      if (enemy.pattern === 'zigzag') {
        const elapsed = time - enemy.spawnTime;
        enemy.x = enemy.baseX + Math.sin(elapsed * 0.003) * 80;
      } else if (enemy.pattern === 'dive' && this.scene.player && this.scene.player.alive) {
        const dx = this.scene.player.x - enemy.x;
        enemy.setVelocityX(dx * 0.8);
        if (enemy.y > 400) {
          enemy.setVelocityY(enemy.moveSpeed * 1.5);
        }
      }

      // Shooting
      if (enemy.fireRate && time > enemy.lastFired + enemy.fireRate) {
        this.enemyFire(enemy);
        enemy.lastFired = time;
      }
    });

    // Clean up off-screen enemy bullets
    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active && (bullet.y > 780 || bullet.y < -20 || bullet.x < -20 || bullet.x > 500)) {
        this.bullets.killAndHide(bullet);
        bullet.body.enable = false;
      }
    });
  }

  enemyFire(enemy) {
    const bullet = this.bullets.get(enemy.x, enemy.y + 15 * PIXEL_SCALE);
    if (!bullet) return;

    bullet.setActive(true).setVisible(true);
    bullet.body.enable = true;

    if (bullet.texture.key !== 'enemy-bullet') {
      bullet.setTexture('enemy-bullet');
    }
    bullet.setScale(PIXEL_SCALE);
    bullet.setDepth(5);
    bullet.body.setCircle(5, 3, 3);
    bullet.play('enemy-bullet-anim');

    let vx = 0;
    let vy = ENEMY_BULLET_SPEED;
    if (this.scene.player && this.scene.player.alive) {
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.scene.player.x, this.scene.player.y
      );
      vx = Math.cos(angle) * ENEMY_BULLET_SPEED;
      vy = Math.sin(angle) * ENEMY_BULLET_SPEED;
    }
    bullet.setVelocity(vx, vy);

    this.scene.sound.play('sfx-shot2', { volume: 0.15 });
  }

  damageEnemy(enemy, damage = 1) {
    if (enemy._pendingKill) return 0;
    enemy.hp -= damage;
    enemy.setTint(0xff0000);
    this.scene.time.delayedCall(80, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.hp <= 0) {
      const score = enemy.score;
      this.destroyEnemy(enemy);
      return score;
    }
    return 0;
  }

  destroyEnemy(enemy) {
    if (enemy._pendingKill) return;
    enemy._pendingKill = true;

    const explosion = this.scene.add.sprite(enemy.x, enemy.y, 'explosion1');
    explosion.setScale(PIXEL_SCALE);
    explosion.play('explosion');
    explosion.once('animationcomplete', () => explosion.destroy());
    this.scene.sound.play('sfx-explosion', { volume: 0.4 });

    // Defer body changes to after physics step
    if (this.scene.postPhysicsQueue) {
      this.scene.postPhysicsQueue.push(() => {
        this.group.killAndHide(enemy);
        enemy.body.enable = false;
        enemy._pendingKill = false;
        if (this.scene.waveManager) {
          this.scene.waveManager.onEnemyKilled();
        }
      });
    } else {
      this.group.killAndHide(enemy);
      enemy.body.enable = false;
      enemy._pendingKill = false;
      if (this.scene.waveManager) {
        this.scene.waveManager.onEnemyKilled();
      }
    }
  }
}
