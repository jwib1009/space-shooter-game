import Phaser from 'phaser';
import { GAME_WIDTH, PIXEL_SCALE, POWERUP_DROP_CHANCE, POWERUP_TYPES } from '../config/constants.js';

export class PowerUpManager {
  constructor(scene) {
    this.scene = scene;
    this.group = scene.physics.add.group({
      allowGravity: false,
      maxSize: 10,
    });

    // Build weighted table
    this.lootTable = [];
    for (const [type, config] of Object.entries(POWERUP_TYPES)) {
      for (let i = 0; i < config.weight; i++) {
        this.lootTable.push(type);
      }
    }
  }

  tryDrop(x, y) {
    if (Math.random() > POWERUP_DROP_CHANCE) return;

    const type = Phaser.Utils.Array.GetRandom(this.lootTable);
    const config = POWERUP_TYPES[type];

    const powerup = this.group.get(x, y, config.key);
    if (!powerup) return;

    powerup.setActive(true).setVisible(true);
    powerup.body.enable = true;
    powerup.setScale(PIXEL_SCALE);
    powerup.setDepth(8);
    powerup.body.setCircle(6, 2, 2);
    powerup.powerType = type;
    powerup.spawnTime = this.scene.time.now;
    powerup.baseY = y;
    powerup.floatSpeed = 60;
  }

  update(time) {
    this.group.getChildren().forEach((p) => {
      if (!p.active) return;

      // Derive pickup motion from spawn time so the drift stays stable.
      const elapsed = time - p.spawnTime;
      const driftY = (elapsed / 1000) * p.floatSpeed;
      const bobOffset = Math.sin(elapsed * 0.005) * 8;
      p.y = p.baseY + driftY + bobOffset;
      p.body.updateFromGameObject();

      // Off-screen cleanup
      if (p.y > 780) {
        this.group.killAndHide(p);
        p.body.enable = false;
      }
    });
  }

  collect(powerup) {
    if (powerup._pendingKill) return null;
    powerup._pendingKill = true;

    const type = powerup.powerType;

    // Screen flash on collect
    this.scene.cameras.main.flash(100, 255, 255, 255);

    // Defer body changes to after physics step
    if (this.scene.postPhysicsQueue) {
      this.scene.postPhysicsQueue.push(() => {
        this.group.killAndHide(powerup);
        powerup.body.enable = false;
        powerup._pendingKill = false;
      });
    } else {
      this.group.killAndHide(powerup);
      powerup.body.enable = false;
      powerup._pendingKill = false;
    }

    return type;
  }
}
