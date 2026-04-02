import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PIXEL_SCALE } from '../config/constants.js';

export class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUD');
  }

  create() {
    // Score
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });

    // Stage + Wave counter (combined to avoid overlap)
    this.waveText = this.add.text(GAME_WIDTH / 2, 16, 'Stage 1 — Wave 1', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaaff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0);

    this.currentStageNum = 1;
    this.currentWaveNum = 1;

    // Lives (ship icons)
    this.livesIcons = [];
    this.updateLives(3);

    // Weapon indicator
    this.weaponText = this.add.text(16, 696, 'Basic L1', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#88ff88',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // Wave announcement (big centered text)
    this.waveAnnounce = this.add.text(GAME_WIDTH / 2, 300, '', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#0044ff',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    // Boss health bar (hidden by default) — positioned below wave text
    const bossBarY = 52;
    this.bossLabel = this.add.text(GAME_WIDTH / 2, bossBarY - 4, 'BOSS', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ff4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 1).setDepth(21).setVisible(false);

    this.bossBarBg = this.add.rectangle(GAME_WIDTH / 2, bossBarY + 6, 300, 14, 0x333333);
    this.bossBarBg.setStrokeStyle(2, 0x888888);
    this.bossBarBg.setDepth(20);
    this.bossBarBg.setVisible(false);

    this.bossBarFill = this.add.rectangle(GAME_WIDTH / 2 - 148, bossBarY + 6, 296, 10, 0xff0000);
    this.bossBarFill.setOrigin(0, 0.5);
    this.bossBarFill.setDepth(21);
    this.bossBarFill.setVisible(false);

    // Listen for events from GameScene
    const gameScene = this.scene.get('Game');
    gameScene.events.on('updateScore', this.updateScore, this);
    gameScene.events.on('updateLives', this.updateLives, this);
    gameScene.events.on('updateWave', this.updateWave, this);
    gameScene.events.on('updateStage', this.updateStage, this);
    gameScene.events.on('updateWeapon', this.updateWeapon, this);
    gameScene.events.on('announceWave', this.announceWave, this);
    gameScene.events.on('announceBoss', this.announceBoss, this);
    gameScene.events.on('scorePop', this.scorePop, this);
    gameScene.events.on('showBossHP', this.showBossHP, this);
    gameScene.events.on('hideBossHP', this.hideBossHP, this);
    gameScene.events.on('updateBossHP', this.updateBossHP, this);
    gameScene.events.on('shutdown', this.cleanup, this);
  }

  updateScore(score) {
    this.scoreText.setText(`Score: ${score}`);
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 80,
      yoyo: true,
    });
  }

  updateLives(lives) {
    this.livesIcons.forEach((icon) => icon.destroy());
    this.livesIcons = [];

    for (let i = 0; i < lives; i++) {
      const icon = this.add.image(GAME_WIDTH - 30 - i * 30, 24, 'player1');
      icon.setScale(PIXEL_SCALE * 0.6);
      icon.setAngle(-90);
      this.livesIcons.push(icon);
    }
  }

  updateWave(wave) {
    this.currentWaveNum = wave;
    this.waveText.setText(`Stage ${this.currentStageNum} — Wave ${wave}`);
  }

  updateStage(stage) {
    this.currentStageNum = stage;
    this.waveText.setText(`Stage ${stage} — Wave ${this.currentWaveNum}`);
  }

  updateWeapon(name) {
    this.weaponText.setText(name);
  }

  announceWave(wave) {
    this.waveAnnounce.setText(`WAVE ${wave}`);
    this.waveAnnounce.setAlpha(1).setScale(0.5);
    this.waveAnnounce.setColor('#ffffff');
    this.tweens.add({
      targets: this.waveAnnounce,
      scaleX: 1,
      scaleY: 1,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
    });
  }

  announceBoss() {
    this.waveAnnounce.setText('WARNING\nBOSS INCOMING');
    this.waveAnnounce.setAlign('center');
    this.waveAnnounce.setAlpha(1).setScale(0.8);
    this.waveAnnounce.setColor('#ff0000');

    this.tweens.add({
      targets: this.waveAnnounce,
      scaleX: 1.1,
      scaleY: 1.1,
      alpha: 0,
      duration: 2000,
      ease: 'Power1',
    });
  }

  showBossHP() {
    this.waveText.setVisible(false);
    this.bossBarBg.setVisible(true);
    this.bossBarFill.setVisible(true);
    this.bossLabel.setVisible(true);
    this.bossBarFill.width = 296;
  }

  hideBossHP() {
    this.waveText.setVisible(true);
    this.bossBarBg.setVisible(false);
    this.bossBarFill.setVisible(false);
    this.bossLabel.setVisible(false);
  }

  updateBossHP(percent) {
    this.bossBarFill.width = Math.max(0, 296 * percent);
    // Color shift: green > yellow > red
    if (percent > 0.5) {
      this.bossBarFill.fillColor = 0x00ff00;
    } else if (percent > 0.25) {
      this.bossBarFill.fillColor = 0xffff00;
    } else {
      this.bossBarFill.fillColor = 0xff0000;
    }
  }

  scorePop(x, y, score) {
    const text = this.add.text(x, y, `+${score}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  cleanup() {
    const gameScene = this.scene.get('Game');
    const events = [
      'updateScore', 'updateLives', 'updateWave', 'updateStage',
      'updateWeapon', 'announceWave', 'announceBoss', 'scorePop',
      'showBossHP', 'hideBossHP', 'updateBossHP',
    ];
    for (const evt of events) {
      gameScene.events.off(evt, this[evt], this);
    }
    this.scene.stop('HUD');
  }
}
