import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PIXEL_SCALE } from '../config/constants.js';
import { ScoreManager } from '../systems/ScoreManager.js';

// All three use the same base sprite (player1) with different tints
const SHIP_TINTS = [0xff6666, 0xffee44, 0x44ddff];
const SHIP_NAMES = ['Red', 'Yellow', 'Blue'];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.selectedShip = 0;

    // Scrolling starfield background
    this.bgStars = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg-stars');
    this.bgStars.setOrigin(0, 0);
    this.bgStars.setScale(GAME_WIDTH / 272);

    // Title
    this.add.text(GAME_WIDTH / 2, 80, 'SPACE SHOOTER', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#0066ff',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Ship selection label
    this.add.text(GAME_WIDTH / 2, 160, 'SELECT SHIP', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#888888',
    }).setOrigin(0.5);

    // Ship previews — smaller scale, proper spacing
    this.shipPreviews = [];
    this.shipHighlights = [];
    const shipY = 210;
    const spacing = 100;
    const startX = GAME_WIDTH / 2 - ((SHIP_NAMES.length - 1) / 2) * spacing;
    const shipScale = PIXEL_SCALE * 0.8; // smaller for menu display

    for (let i = 0; i < SHIP_NAMES.length; i++) {
      const x = startX + i * spacing;

      // Highlight box — drawn AFTER ship so we can control depth
      const highlight = this.add.rectangle(x, shipY, 50, 50, 0x0066ff, 0.25);
      highlight.setStrokeStyle(2, 0x44aaff);
      highlight.setDepth(5); // behind ship
      highlight.setVisible(i === 0);
      this.shipHighlights.push(highlight);

      // Ship sprite — all use player1 with color tint
      const ship = this.add.image(x, shipY, 'player1');
      ship.setScale(shipScale);
      ship.setAngle(-90);
      ship.setTint(SHIP_TINTS[i]);
      ship.setDepth(10); // in front of highlight
      this.shipPreviews.push(ship);

      // Ship name — below with clear spacing
      this.add.text(x, shipY + 35, SHIP_NAMES[i], {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#aaaaaa',
      }).setOrigin(0.5).setDepth(10);

      // Clickable
      ship.setInteractive();
      ship.on('pointerdown', () => this.selectShip(i));
    }

    // Arrow key hint
    this.add.text(GAME_WIDTH / 2, shipY + 55, '< A/D to select >', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#555555',
    }).setOrigin(0.5);

    // Start prompt (blinking)
    const prompt = this.add.text(GAME_WIDTH / 2, 320, 'Press SPACE to Start', {
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
    this.add.text(GAME_WIDTH / 2, 380, 'WASD / Arrows — Move\nSPACE / Click — Shoot', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#666666',
      align: 'center',
    }).setOrigin(0.5);

    // High scores
    this.add.text(GAME_WIDTH / 2, 460, 'HIGH SCORES', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffdd00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const scores = ScoreManager.getHighScores();
    if (scores.length === 0) {
      this.add.text(GAME_WIDTH / 2, 490, 'No scores yet', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#555555',
      }).setOrigin(0.5);
    } else {
      const top5 = scores.slice(0, 5);
      for (let i = 0; i < top5.length; i++) {
        const rank = `${i + 1}.`.padStart(3);
        const scoreStr = `${top5[i].score}`.padStart(8);
        this.add.text(GAME_WIDTH / 2, 490 + i * 24, `${rank} ${scoreStr}`, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: i === 0 ? '#ffdd00' : '#aaaaaa',
          stroke: '#000000',
          strokeThickness: 2,
        }).setOrigin(0.5);
      }
    }

    // Input
    this.input.keyboard.on('keydown-A', () => this.selectShip(this.selectedShip - 1));
    this.input.keyboard.on('keydown-LEFT', () => this.selectShip(this.selectedShip - 1));
    this.input.keyboard.on('keydown-D', () => this.selectShip(this.selectedShip + 1));
    this.input.keyboard.on('keydown-RIGHT', () => this.selectShip(this.selectedShip + 1));

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('Game', { ship: SHIP_TINTS[this.selectedShip] });
    });
  }

  selectShip(index) {
    const i = Phaser.Math.Clamp(index, 0, SHIP_NAMES.length - 1);
    this.shipHighlights[this.selectedShip].setVisible(false);
    this.selectedShip = i;
    this.shipHighlights[i].setVisible(true);
  }

  update() {
    this.bgStars.tilePositionY -= 0.5;
  }
}
