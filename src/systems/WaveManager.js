import Phaser from 'phaser';
import { STAGE_WAVES } from '../config/waves.js';
import { GAME_WIDTH, ENEMY_TYPES, STAGES } from '../config/constants.js';

const STATE = { WAITING: 0, SPAWNING: 1, ACTIVE: 2, CLEARED: 3, BOSS: 4 };

export class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.currentStage = 0;
    this.currentWaveInStage = 0;
    this.globalWave = 0;
    this.state = STATE.WAITING;
    this.spawnQueue = [];
    this.enemiesAlive = 0;
    this.events = new Phaser.Events.EventEmitter();
  }

  start() {
    this.currentStage = 0;
    this.currentWaveInStage = 0;
    this.globalWave = 0;
    this.events.emit('stageStart', this.currentStage);
    this.startWave();
  }

  startWave() {
    const stageWaves = STAGE_WAVES[this.currentStage];
    if (!stageWaves) return; // game complete

    if (this.currentWaveInStage >= stageWaves.length) {
      // All waves in stage cleared — trigger boss
      this.state = STATE.BOSS;
      this.events.emit('bossStart', this.currentStage);
      return;
    }

    const waveDef = stageWaves[this.currentWaveInStage];
    this.state = STATE.WAITING;
    this.globalWave++;
    this.events.emit('waveStart', this.globalWave);

    // 2-second pause before spawning
    this.scene.time.delayedCall(2000, () => {
      this.state = STATE.SPAWNING;
      this.buildSpawnQueue(waveDef);
      this.spawnAsteroids(waveDef.asteroids || 0);
      this.processQueue();
    });
  }

  buildSpawnQueue(waveDef) {
    const diffMult = STAGES[this.currentStage]?.difficultyMult || 1;
    this.spawnQueue = [];
    for (const group of waveDef.enemies) {
      const typeConfig = ENEMY_TYPES[group.type];
      if (!typeConfig) continue;

      const positions = this.getFormationPositions(group.formation, group.count);
      for (let i = 0; i < group.count; i++) {
        // Scale enemy stats by difficulty multiplier
        const scaled = { ...typeConfig };
        scaled.hp = Math.ceil(scaled.hp * diffMult);
        scaled.speed = Math.round(scaled.speed * (0.8 + diffMult * 0.2));

        this.spawnQueue.push({
          typeConfig: scaled,
          typeName: group.type,
          x: positions[i].x,
          delay: group.delay * i,
        });
      }
    }
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

    const maxDelay = this.spawnQueue[this.spawnQueue.length - 1].delay;
    this.scene.time.delayedCall(maxDelay + 500, () => {
      this.state = STATE.ACTIVE;
      if (this.enemiesAlive <= 0) {
        this.waveCleared();
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
      this.waveCleared();
    }
  }

  waveCleared() {
    this.state = STATE.CLEARED;
    this.events.emit('waveEnd', this.globalWave);
    this.currentWaveInStage++;

    this.scene.time.delayedCall(1500, () => {
      this.startWave();
    });
  }

  onBossDefeated() {
    this.currentStage++;
    this.currentWaveInStage = 0;

    if (this.currentStage >= STAGES.length) {
      // Game complete — victory!
      this.events.emit('victory');
    } else {
      // Stage clear — transition to next stage
      this.events.emit('stageClear', this.currentStage - 1);
    }
  }

  startNextStage() {
    this.events.emit('stageStart', this.currentStage);
    this.startWave();
  }

  getCurrentWave() {
    return this.globalWave;
  }

  getCurrentStage() {
    return this.currentStage;
  }
}
