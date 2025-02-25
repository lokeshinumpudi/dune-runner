import Phaser from "phaser";

export class LevelCompleteScene extends Phaser.Scene {
  private levelNumber: number = 1;
  private score: number = 0;
  private timeElapsed: number = 0;

  constructor() {
    super({ key: "LevelCompleteScene" });
  }

  init(data: {
    levelNumber: number;
    score: number;
    timeElapsed: number;
  }): void {
    this.levelNumber = data.levelNumber || 1;
    this.score = data.score || 0;
    this.timeElapsed = data.timeElapsed || 0;
  }

  create(): void {
    // Get screen dimensions
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add semi-transparent background with sand texture
    const bg = this.add
      .rectangle(0, 0, width, height, 0x4d3800, 0.85)
      .setOrigin(0, 0);

    // Add container for all elements (for animations)
    const container = this.add.container(width / 2, height / 2);

    // Add completion message with Dune style
    const title = this.add
      .text(0, -150, `LEVEL ${this.levelNumber} COMPLETE`, {
        fontFamily: "Cinzel, Arial Black",
        fontSize: "64px",
        color: "#E6B800", // Warm gold
        stroke: "#4D3800", // Dark brown
        strokeThickness: 8,
        align: "center",
        shadow: {
          offsetX: 3,
          offsetY: 3,
          color: "#000",
          blur: 8,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);
    container.add(title);

    // Format time as minutes:seconds
    const minutes = Math.floor(this.timeElapsed / 60000);
    const seconds = Math.floor((this.timeElapsed % 60000) / 1000);
    const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    // Add stats with desert theme
    const stats = [
      `Score: ${this.score}`,
      `Time: ${timeString}`,
      `Enemies Defeated: ${this.registry.get("enemiesDefeated") || 0}`,
      `Ammo Used: ${this.registry.get("ammoUsed") || 0}`,
    ];

    const statsText = this.add
      .text(0, -50, stats, {
        fontFamily: "Cinzel, Arial",
        fontSize: "28px",
        color: "#FFE5B4", // Peach color
        stroke: "#4D3800", // Dark brown
        strokeThickness: 3,
        align: "center",
        lineSpacing: 15,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000",
          blur: 5,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);
    container.add(statsText);

    // Add buttons with desert theme
    if (this.levelNumber < 2) {
      const nextButton = this.createButton(0, 80, "Continue Journey", () => {
        if (this.registry.get("soundEnabled") !== false) {
          this.sound.play("button-click");
        }
        this.scene.start(`Level${this.levelNumber + 1}Scene`);
      });
      container.add(nextButton);
    }

    const menuButton = this.createButton(0, 150, "Return to Base", () => {
      if (this.registry.get("soundEnabled") !== false) {
        this.sound.play("button-click");
      }
      this.scene.start("MenuScene");
    });
    container.add(menuButton);

    // Add animation for container (slide in from top with sand particles)
    this.tweens.add({
      targets: container,
      y: height / 2,
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: "Back.easeOut",
    });

    // Enhanced particle effects for celebration
    const particles = this.add.particles(0, 0, "sand-particle", {
      x: width / 2,
      y: height / 4,
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 4000,
      quantity: 3,
      frequency: 80,
      blendMode: "ADD",
      tint: [0xe6b800, 0xffd700, 0xffe5b4], // Gold and sand colors
      alpha: { start: 0.6, end: 0 },
      rotate: { min: 0, max: 360 },
    });

    // Play victory sound if enabled
    if (this.registry.get("soundEnabled") !== false) {
      this.sound.play("level-complete", { volume: 0.5 });
    }
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // Button background - semi-transparent dark overlay
    const bg = this.add
      .rectangle(0, 0, 250, 50, 0x4d3800, 0.8)
      .setStrokeStyle(2, 0xe6b800); // Gold border

    // Button text with desert theme
    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "Cinzel, Arial",
        fontSize: "24px",
        color: "#FFE5B4", // Peach color
        stroke: "#4D3800", // Dark brown stroke
        strokeThickness: 2,
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: "#000",
          blur: 3,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);

    button.add([bg, buttonText]);

    // Make button interactive with desert hover effects
    bg.setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        bg.setStrokeStyle(3, 0xffd700); // Brighter gold on hover
        buttonText.setScale(1.1);
        bg.setFillStyle(0x6b4f00, 0.9); // Slightly lighter brown
      })
      .on("pointerout", () => {
        bg.setStrokeStyle(2, 0xe6b800);
        buttonText.setScale(1);
        bg.setFillStyle(0x4d3800, 0.8);
      })
      .on("pointerdown", () => {
        bg.setFillStyle(0x362900, 0.95); // Darker brown on click
      })
      .on("pointerup", () => {
        bg.setFillStyle(0x4d3800, 0.8);
        callback();
      });

    return button;
  }
}
