import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';
import { ScoreManager } from '../systems/ScoreManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.stageReached = data.stage || 1;
    this.victory = data.victory || false;
  }

  create() {
    this.bgStars = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars');
    this.bgStars.setOrigin(0, 0);
    this.bgStars.setScale(GAME_WIDTH / 272);

    const title = this.victory ? 'YOU WIN!' : 'GAME OVER';
    const titleColor = this.victory ? '#ffdd00' : '#ff0000';

    this.add.text(GAME_WIDTH / 2, 80, title, {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: titleColor,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 150, `Score: ${this.finalScore}`, {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 185, `Stage Reached: ${this.stageReached}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaaff',
    }).setOrigin(0.5);

    // Check if new high score
    const isNew = ScoreManager.isHighScore(this.finalScore);
    if (isNew && this.finalScore > 0) {
      const newHSText = this.add.text(GAME_WIDTH / 2, 220, 'NEW HIGH SCORE!', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffdd00',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.tweens.add({
        targets: newHSText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    }

    // High score table
    this.add.text(GAME_WIDTH / 2, 270, 'HIGH SCORES', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const scores = ScoreManager.getHighScores();
    for (let i = 0; i < Math.min(scores.length, 10); i++) {
      const rank = `${i + 1}.`.padStart(3);
      const scoreStr = `${scores[i].score}`.padStart(8);
      const isCurrent = scores[i].score === this.finalScore;
      this.add.text(GAME_WIDTH / 2, 300 + i * 24, `${rank} ${scoreStr}`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: isCurrent ? '#ffdd00' : '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
    }

    // Restart prompt
    const prompt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Press SPACE to Restart', {
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
        this.scene.start('Menu');
      });
    });
  }

  update() {
    this.bgStars.tilePositionY -= 0.3;
  }
}
