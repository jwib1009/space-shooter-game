import Phaser from 'phaser';
import { BULLET_SPEED, PIXEL_SCALE, WEAPON_TYPES } from '../config/constants.js';

export class WeaponSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.currentType = 'basic';
    this.level = 1;
    this.maxLevel = 3;
  }

  setWeapon(type) {
    if (this.currentType === type) {
      // Same weapon — upgrade
      this.level = Math.min(this.level + 1, this.maxLevel);
    } else {
      // New weapon — reset level
      this.currentType = type;
      this.level = 1;
    }
  }

  fire(time) {
    switch (this.currentType) {
      case 'basic':
        this.fireBasic();
        break;
      case 'spread':
        this.fireSpread();
        break;
      case 'laser':
        this.fireLaser();
        break;
    }
    this.scene.sound.play('sfx-shot1', { volume: 0.3 });
    this.player.lastFired = time;
  }

  fireBasic() {
    this.spawnBullet(this.player.x, this.player.y - 40, 0, -BULLET_SPEED, 'bullet');
  }

  fireSpread() {
    const bulletKey = 'bolt-bullet';
    // Level determines spread count: 3, 5, 7
    const count = 1 + this.level * 2;
    const angleStep = 12; // degrees between bullets
    const startAngle = -((count - 1) / 2) * angleStep;

    for (let i = 0; i < count; i++) {
      const angleDeg = startAngle + i * angleStep;
      const angleRad = Phaser.Math.DegToRad(angleDeg);
      const vx = Math.sin(angleRad) * BULLET_SPEED;
      const vy = -Math.cos(angleRad) * BULLET_SPEED;
      this.spawnBullet(this.player.x, this.player.y - 35, vx, vy, bulletKey);
    }
  }

  fireLaser() {
    const bulletKey = 'laser-bullet';
    // Level determines laser count: 1, 2, 3
    const count = this.level;
    const spacing = 12;
    const startX = this.player.x - ((count - 1) / 2) * spacing;

    for (let i = 0; i < count; i++) {
      const bullet = this.spawnBullet(startX + i * spacing, this.player.y - 40, 0, -BULLET_SPEED * 1.3, bulletKey);
      if (bullet) bullet.piercing = true;
    }
  }

  spawnBullet(x, y, vx, vy, textureKey) {
    const bullet = this.player.bullets.get(x, y);
    if (!bullet) return null;

    bullet.setActive(true).setVisible(true);
    bullet.setTexture(textureKey);
    bullet.setScale(PIXEL_SCALE);
    bullet.setAngle(-90);
    bullet.body.enable = true;
    bullet.body.setCircle(3, bullet.width / 2 - 3, bullet.height / 2 - 3);
    bullet.setVelocity(vx, vy);
    bullet.setDepth(5);
    bullet.piercing = false;

    return bullet;
  }

  getDisplayName() {
    const type = WEAPON_TYPES[this.currentType];
    return `${type.name} L${this.level}`;
  }
}
