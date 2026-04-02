import Phaser from 'phaser';
import { GAME_WIDTH, PIXEL_SCALE } from '../config/constants.js';

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

    // Wave counter
    this.waveText = this.add.text(GAME_WIDTH / 2, 16, 'Wave 1', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaaff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0);

    // Lives (ship icons)
    this.livesIcons = [];
    this.updateLives(3);

    // Weapon indicator
    this.weaponText = this.add.text(16, GAME_WIDTH > 400 ? 696 : 680, 'Basic L1', {
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

    // Listen for events from GameScene
    const gameScene = this.scene.get('Game');
    gameScene.events.on('updateScore', this.updateScore, this);
    gameScene.events.on('updateLives', this.updateLives, this);
    gameScene.events.on('updateWave', this.updateWave, this);
    gameScene.events.on('updateWeapon', this.updateWeapon, this);
    gameScene.events.on('announceWave', this.announceWave, this);
    gameScene.events.on('scorePop', this.scorePop, this);
    gameScene.events.on('shutdown', this.cleanup, this);
  }

  updateScore(score) {
    this.scoreText.setText(`Score: ${score}`);
    // Brief scale punch
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 80,
      yoyo: true,
    });
  }

  updateLives(lives) {
    // Clear old icons
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
    this.waveText.setText(`Wave ${wave}`);
  }

  updateWeapon(name) {
    this.weaponText.setText(name);
  }

  announceWave(wave) {
    this.waveAnnounce.setText(`WAVE ${wave}`);
    this.waveAnnounce.setAlpha(1).setScale(0.5);
    this.tweens.add({
      targets: this.waveAnnounce,
      scaleX: 1,
      scaleY: 1,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
    });
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
    gameScene.events.off('updateScore', this.updateScore, this);
    gameScene.events.off('updateLives', this.updateLives, this);
    gameScene.events.off('updateWave', this.updateWave, this);
    gameScene.events.off('updateWeapon', this.updateWeapon, this);
    gameScene.events.off('announceWave', this.announceWave, this);
    gameScene.events.off('scorePop', this.scorePop, this);
    this.scene.stop('HUD');
  }
}
