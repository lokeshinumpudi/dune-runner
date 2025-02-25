import Phaser from "phaser";

export class CreditsScene extends Phaser.Scene {
  private creditsText!: Phaser.GameObjects.Text;
  private scrollSpeed: number = 1;

  constructor() {
    super({ key: "CreditsScene" });
  }

  create(): void {
    // Get screen dimensions
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add background
    this.add
      .image(0, 0, "menu-bg")
      .setOrigin(0, 0)
      .setDisplaySize(width, height);

    // Add title
    this.add
      .text(width / 2, 50, "CREDITS", {
        fontFamily: "Cinzel, Arial Black",
        fontSize: "64px",
        color: "#E6B800", // Warm gold color
        stroke: "#4D3800", // Dark brown stroke
        strokeThickness: 8,
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

    // Credits content
    const credits = [
      "DUNE RUNNER",
      "",
      "Game Design & Development",
      "Loki",
      "",
      "Art & Animation",
      "Loki using AI [Grok,ChatGpt,Claude]",
      "",
      "Music & Sound Effects",
      "Loki using AI/ffmpeg",
      "",
      "Special Thanks",
      "Claude and Cursor",
      "",
      "© 2025 Dune Runner Team",
      "All Rights Reserved",
    ];

    // Create scrolling credits text with desert theme
    this.creditsText = this.add
      .text(width / 2, height, credits.join("\n"), {
        fontFamily: "Cinzel, Arial",
        fontSize: "28px",
        color: "#FFE5B4", // Peach color
        align: "center",
        stroke: "#4D3800", // Dark brown stroke
        strokeThickness: 3,
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
      .setOrigin(0.5, 0);

    // Create back button with desert theme
    this.createButton(width / 2, height - 50, "Return", () => {
      if (this.registry.get("soundEnabled") !== false) {
        this.sound.play("button-click");
      }
      this.scene.start("MenuScene");
    });

    // Add scroll speed controls
    this.input?.keyboard?.on("keydown-UP", () => {
      this.scrollSpeed = 3;
    });

    this.input?.keyboard?.on("keyup-UP", () => {
      this.scrollSpeed = 1;
    });

    this.input?.keyboard?.on("keydown-DOWN", () => {
      this.scrollSpeed = -3;
    });

    this.input?.keyboard?.on("keyup-DOWN", () => {
      this.scrollSpeed = 1;
    });
  }

  update(): void {
    // Scroll credits text
    this.creditsText.y -= this.scrollSpeed;

    // Reset position when scrolled through
    if (this.creditsText.y < -this.creditsText.height) {
      this.creditsText.y = this.cameras.main.height;
    }

    // Reset if scrolled too far up
    if (this.creditsText.y > this.cameras.main.height * 2) {
      this.creditsText.y = this.cameras.main.height;
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
      .rectangle(0, 0, 200, 50, 0x4d3800, 0.8)
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
