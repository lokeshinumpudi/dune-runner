import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private restartButton!: Phaser.GameObjects.Text;
  private menuButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data: { score: number }): void {
    // Store the score from the previous scene
    this.registry.set("lastScore", data.score || 0);

    // Update high score if needed
    const currentHighScore = this.registry.get("highScore") || 0;
    if (data.score > currentHighScore) {
      this.registry.set("highScore", data.score);
    }
  }

  create(): void {
    // Get the final score
    const score = this.registry.get("lastScore");
    const highScore = this.registry.get("highScore");

    // Create a dark overlay
    this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.8
      )
      .setOrigin(0, 0);

    // Add game over title with sand-like text
    const gameOverTitle = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height * 0.25,
        "GAME OVER",
        {
          font: "bold 64px Arial, sans-serif",
          color: "#E6B800",
          stroke: "#4D3800",
          strokeThickness: 8,
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: "#000",
            blur: 5,
            fill: true,
          },
        }
      )
      .setOrigin(0.5)
      .setDepth(10);

    // Add background gradient
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x661100, 0x661100, 0x993300, 0x993300, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    graphics.setAlpha(0.3);
    graphics.setDepth(-1);

    // Score text
    this.scoreText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height * 0.4,
        `Final Score: ${score}`,
        {
          font: "32px Arial",
          color: "#FFE5B4",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    // High score text
    this.highScoreText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height * 0.48,
        `High Score: ${highScore}`,
        {
          font: "28px Arial",
          color: "#FFD700",
          stroke: "#000000",
          strokeThickness: 3,
        }
      )
      .setOrigin(0.5);

    // Add buttons
    this.createButtons();

    // Add a dramatic fading in effect
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // Add sad background music if available
    if (this.sound.get("game-over-music")) {
      this.sound.play("game-over-music", { volume: 0.5 });
    }
  }

  private createButtons(): void {
    // Style for buttons
    const buttonStyle = {
      font: "24px Arial",
      color: "#ffffff",
      backgroundColor: "#4D3800",
      padding: { x: 20, y: 10 },
      shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 2, fill: true },
    };

    // Restart button
    this.restartButton = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height * 0.65,
        "Try Again",
        buttonStyle
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setPadding(20)
      .setStyle({ backgroundColor: "#4D3800" });

    // Menu button
    this.menuButton = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.height * 0.75,
        "Main Menu",
        buttonStyle
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setPadding(20)
      .setStyle({ backgroundColor: "#4D3800" });

    // Add hover and click effects
    this.applyButtonBehavior(this.restartButton, () => {
      this.scene.start("DesertScene");
    });

    this.applyButtonBehavior(this.menuButton, () => {
      this.scene.start("MenuScene");
    });
  }

  private applyButtonBehavior(
    button: Phaser.GameObjects.Text,
    onClick: () => void
  ): void {
    button
      .on("pointerover", () => {
        button.setStyle({ color: "#FFD700" });
        button.setScale(1.1);
      })
      .on("pointerout", () => {
        button.setStyle({ color: "#ffffff" });
        button.setScale(1);
      })
      .on("pointerdown", () => {
        button.setStyle({ color: "#ffcc00" });
        button.setScale(0.95);
      })
      .on("pointerup", () => {
        button.setStyle({ color: "#FFD700" });
        button.setScale(1.1);
        onClick();
      });
  }
}
