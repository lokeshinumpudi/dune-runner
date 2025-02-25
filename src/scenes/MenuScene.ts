import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  private soundEnabled: boolean = true;

  constructor() {
    super({ key: "MenuScene" });
  }

  preload(): void {
    // Load menu assets
    this.load.image("menu-bg", "assets/backgrounds/sky.png");
    this.load.image("logo", "assets/ui/logo.png");
    this.load.image("button", "assets/ui/button.png");
    this.load.audio("menu-music", "assets/sounds/menu-music.mp3");
    this.load.audio("button-click", "assets/sounds/button-click.mp3");
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

    // Add title text
    const title = this.add
      .text(width / 2, height / 4, "DUNE RUNNER", {
        fontFamily: "Arial Black",
        fontSize: "64px",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 8,
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

    // Add subtitle
    const subtitle = this.add
      .text(
        width / 2,
        height / 4 + 70,
        "Control the Spice, Control the Universe",
        {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#FFA500",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5);

    // Create buttons
    this.createButton(width / 2, height / 2 + 20, "Play Game", () => {
      this.playSound("button-click");
      this.scene.start("DesertScene");
    });

    this.createButton(width / 2, height / 2 + 100, "Options", () => {
      this.playSound("button-click");
      this.scene.start("OptionsScene");
    });

    this.createButton(width / 2, height / 2 + 180, "Credits", () => {
      this.playSound("button-click");
      this.scene.start("CreditsScene");
    });

    // Add animation to title
    this.tweens.add({
      targets: title,
      y: title.y - 10,
      duration: 1500,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // Add animation to subtitle
    this.tweens.add({
      targets: subtitle,
      alpha: 0.7,
      duration: 2000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // Play menu music if enabled
    if (this.registry.get("soundEnabled") !== false) {
      this.playMenuMusic();
    }
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // Button background
    const bg = this.add.image(0, 0, "button").setDisplaySize(200, 50);

    // Button text
    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    button.add([bg, buttonText]);

    // Make button interactive
    bg.setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        bg.setTint(0xcccccc);
        buttonText.setScale(1.1);
      })
      .on("pointerout", () => {
        bg.clearTint();
        buttonText.setScale(1);
      })
      .on("pointerdown", () => {
        bg.setTint(0x999999);
      })
      .on("pointerup", () => {
        bg.clearTint();
        callback();
      });

    return button;
  }

  private playSound(key: string): void {
    try {
      if (this.registry.get("soundEnabled") !== false && this.sound.get(key)) {
        this.sound.play(key);
      }
    } catch (error) {
      console.warn(`Error playing sound: ${key}`, error);
    }
  }

  private playMenuMusic(): void {
    try {
      const music = this.sound.get("menu-music");
      if (!music) {
        this.sound.add("menu-music", { loop: true, volume: 0.5 }).play();
      } else if (!music.isPlaying) {
        music.play();
      }
    } catch (error) {
      console.warn("Error playing menu music", error);
    }
  }
}
