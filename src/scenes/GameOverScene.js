import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.bgStars = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars');
    this.bgStars.setOrigin(0, 0);
    this.bgStars.setScale(GAME_WIDTH / 272);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `Score: ${this.finalScore}`, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'Press SPACE to Restart', {
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

    // Delay input slightly to prevent accidental restart
    this.time.delayedCall(500, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('Game');
      });
    });
  }

  update() {
    this.bgStars.tilePositionY -= 0.3;
  }
}
