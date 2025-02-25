import Phaser from "phaser";

export class OptionsScene extends Phaser.Scene {
  private soundToggle!: Phaser.GameObjects.Container;
  private soundText!: Phaser.GameObjects.Text;
  private soundEnabled: boolean = true;

  constructor() {
    super({ key: "OptionsScene" });
  }

  preload(): void {
    this.load.image("checkbox", "assets/ui/checkbox.png");
    this.load.image("checkbox-checked", "assets/ui/checkbox-checked.png");
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
      .text(width / 2, height / 6, "OPTIONS", {
        fontFamily: "Arial Black",
        fontSize: "48px",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Get sound setting from registry or default to true
    this.soundEnabled = this.registry.get("soundEnabled") !== false;
    this.registry.set("soundEnabled", this.soundEnabled);

    // Create sound toggle
    this.createSoundToggle(width / 2, height / 2);

    // Create back button
    this.createButton(width / 2, height * 0.8, "Back to Menu", () => {
      if (this.registry.get("soundEnabled") !== false) {
        this.sound.play("button-click");
      }
      this.scene.start("MenuScene");
    });
  }

  private createSoundToggle(x: number, y: number): void {
    this.soundToggle = this.add.container(x, y);

    // Label
    const label = this.add
      .text(-100, 0, "Sound Effects:", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0, 0.5);

    // Checkbox
    const checkbox = this.add
      .image(50, 0, this.soundEnabled ? "checkbox-checked" : "checkbox")
      .setOrigin(0, 0.5)
      .setScale(2);

    // Status text
    this.soundText = this.add
      .text(100, 0, this.soundEnabled ? "ON" : "OFF", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: this.soundEnabled ? "#00ff00" : "#ff0000",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0, 0.5);

    this.soundToggle.add([label, checkbox, this.soundText]);

    // Make checkbox interactive
    checkbox.setInteractive({ useHandCursor: true }).on("pointerup", () => {
      this.soundEnabled = !this.soundEnabled;
      this.registry.set("soundEnabled", this.soundEnabled);

      // Update visuals
      checkbox.setTexture(this.soundEnabled ? "checkbox-checked" : "checkbox");
      this.soundText.setText(this.soundEnabled ? "ON" : "OFF");
      this.soundText.setColor(this.soundEnabled ? "#00ff00" : "#ff0000");

      // Play or mute sounds
      if (this.soundEnabled) {
        this.sound.play("button-click");
        this.sound.setMute(false);
      } else {
        this.sound.setMute(true);
      }
    });
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
}
