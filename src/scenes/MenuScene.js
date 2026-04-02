import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    // Scrolling starfield background
    this.bgStars = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars');
    this.bgStars.setOrigin(0, 0);
    this.bgStars.setScale(GAME_WIDTH / 272);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, 'SPACE SHOOTER', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#0066ff',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Prompt (blinking)
    const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'Press SPACE to Start', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Controls info
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'WASD / Arrows — Move\nSPACE / Click — Shoot', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#666666',
      align: 'center',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('Game');
    });
  }

  update() {
    this.bgStars.tilePositionY -= 0.5;
  }
}
