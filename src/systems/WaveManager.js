import Phaser from 'phaser';
import { WAVES } from '../config/waves.js';
import { GAME_WIDTH, ENEMY_TYPES } from '../config/constants.js';

const STATE = { WAITING: 0, SPAWNING: 1, ACTIVE: 2, CLEARED: 3 };

export class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.state = STATE.WAITING;
    this.spawnQueue = [];
    this.spawnTimer = null;
    this.enemiesAlive = 0;
    this.events = new Phaser.Events.EventEmitter();
  }

  start() {
    this.currentWave = 0;
    this.startWave();
  }

  startWave() {
    if (this.currentWave >= WAVES.length) {
      // Loop waves with increased difficulty
      this.currentWave = 0;
    }

    const waveDef = WAVES[this.currentWave];
    this.state = STATE.WAITING;
    this.events.emit('waveStart', this.currentWave + 1);

    // 2-second pause before spawning
    this.scene.time.delayedCall(2000, () => {
      this.state = STATE.SPAWNING;
      this.buildSpawnQueue(waveDef);
      this.spawnAsteroids(waveDef.asteroids || 0);
      this.processQueue();
    });
  }

  buildSpawnQueue(waveDef) {
    this.spawnQueue = [];
    for (const group of waveDef.enemies) {
      const typeConfig = ENEMY_TYPES[group.type];
      if (!typeConfig) continue;

      const positions = this.getFormationPositions(group.formation, group.count);
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({
          typeConfig: { ...typeConfig },
          typeName: group.type,
          x: positions[i].x,
          delay: group.delay * i,
        });
      }
    }
    // Sort by delay so they spawn in order
    this.spawnQueue.sort((a, b) => a.delay - b.delay);
  }

  getFormationPositions(formation, count) {
    const cx = GAME_WIDTH / 2;
    const positions = [];

    switch (formation) {
      case 'line': {
        const spacing = Math.min(60, (GAME_WIDTH - 80) / count);
        const startX = cx - (spacing * (count - 1)) / 2;
        for (let i = 0; i < count; i++) {
          positions.push({ x: startX + i * spacing });
        }
        break;
      }
      case 'v': {
        for (let i = 0; i < count; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const row = Math.floor(i / 2);
          positions.push({ x: cx + side * (row + 1) * 40 });
        }
        // Leader in center
        if (count > 0) positions[0].x = cx;
        break;
      }
      case 'circle': {
        const radius = 80;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          positions.push({ x: cx + Math.cos(angle) * radius });
        }
        break;
      }
      case 'staggered':
      default: {
        const cols = Math.min(4, count);
        const spacing = (GAME_WIDTH - 80) / cols;
        for (let i = 0; i < count; i++) {
          const col = i % cols;
          positions.push({ x: 40 + col * spacing + (Math.floor(i / cols) % 2) * (spacing / 2) });
        }
        break;
      }
    }
    return positions;
  }

  processQueue() {
    if (this.spawnQueue.length === 0) {
      this.state = STATE.ACTIVE;
      return;
    }

    for (const entry of this.spawnQueue) {
      this.scene.time.delayedCall(entry.delay, () => {
        const enemy = this.scene.enemyManager.spawn(entry.typeConfig, entry.x);
        if (enemy) {
          this.enemiesAlive++;
        }
      });
    }

    // After all spawned, switch to active
    const maxDelay = this.spawnQueue[this.spawnQueue.length - 1].delay;
    this.scene.time.delayedCall(maxDelay + 500, () => {
      this.state = STATE.ACTIVE;
      // If all enemies already dead/offscreen, advance immediately
      if (this.enemiesAlive <= 0) {
        this.state = STATE.CLEARED;
        this.events.emit('waveEnd', this.currentWave + 1);
        this.currentWave++;
        this.scene.time.delayedCall(1500, () => {
          this.startWave();
        });
      }
    });

    this.spawnQueue = [];
  }

  spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(1000 + i * 2000, () => {
        this.scene.asteroidManager.spawnLarge();
      });
    }
  }

  onEnemyKilled() {
    this.enemiesAlive = Math.max(0, this.enemiesAlive - 1);
    if (this.state === STATE.ACTIVE && this.enemiesAlive <= 0) {
      this.state = STATE.CLEARED;
      this.events.emit('waveEnd', this.currentWave + 1);
      this.currentWave++;

      // Brief delay then start next wave
      this.scene.time.delayedCall(1500, () => {
        this.startWave();
      });
    }
  }

  getCurrentWave() {
    return this.currentWave + 1;
  }
}
