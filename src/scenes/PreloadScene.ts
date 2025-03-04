import { Scene } from "phaser";

export class PreloadScene extends Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    // Load background images
    this.load.image("bg-sky", "assets/backgrounds/sky.png");
    this.load.image("bg-dunes-far", "assets/backgrounds/dunes-far.png");
    this.load.image("bg-dunes-near", "assets/backgrounds/dunes-near.png");

    // Load platform sprites - fix path
    this.load.image("platform-sand", "assets/sprites/platform-sand.png");

    // Load player spritesheet
    this.load.spritesheet("player", "assets/sprites/player.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    

    // Load particle effects - fix path
    this.load.image("sand-particle", "assets/particles/sand-particle.png");
    this.load.image("dash-trail", "assets/particles/dash-trail.png");

    // Load UI assets
    this.load.image("button", "assets/ui/button.png");
    this.load.image("checkbox", "assets/ui/checkbox.png");
    this.load.image("checkbox-checked", "assets/ui/checkbox-checked.png");
    this.load.image("logo", "assets/ui/logo.png");

    // Load UI elements - fix paths
    this.load.image("ui-heart", "assets/ui/heart.png");
    this.load.image("ui-bullet", "assets/ui/bullet.png");

    // Handle audio loading errors
    this.load.on("loaderror", (fileObj: Phaser.Loader.File) => {
      console.warn("Error loading asset:", fileObj.key);

      // Create a dummy audio for missing audio files
      if (fileObj.type === "audio") {
        this.cache.audio.add(fileObj.key, { tag: new Audio() });
      }

      // For image errors, create a placeholder
      if (fileObj.type === "image") {
        // Create a canvas with a colored rectangle as placeholder
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#FF00FF"; // Magenta placeholder
          ctx.fillRect(0, 0, 32, 32);
          ctx.strokeStyle = "#000000";
          ctx.strokeRect(0, 0, 32, 32);
          ctx.font = "10px Arial";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(fileObj.key, 2, 16, 28);
        }

        // Add the placeholder to the cache
        const img = new Image();
        img.src = canvas.toDataURL();
        this.textures.addImage(fileObj.key, img);
      }
    });

    // Load audio with fallbacks
    this.loadAudioWithFallback("menu-music", [
      "assets/sounds/menu-music.mp3",
      "assets/sounds/menu-music.wav",
      "assets/sounds/menu-music.ogg",
    ]);

    this.loadAudioWithFallback("button-click", [
      "assets/sounds/button-click.mp3",
      "assets/sounds/button-click.wav",
      "assets/sounds/button-click.ogg",
    ]);

    this.loadAudioWithFallback("level-complete", [
      "assets/sounds/level-complete.mp3",
      "assets/sounds/coin.wav",
      "assets/sounds/explosion.wav",
    ]);

    // Loading UI
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    const loadingText = this.add
      .text(width / 2, height / 2 - 50, "Loading...", {
        font: "20px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        width / 4 + 10,
        height / 2 - 20,
        (width / 2 - 20) * value,
        30
      );
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  // Helper method to try loading audio with multiple formats
  private loadAudioWithFallback(key: string, paths: string[]): void {
    // Try to load the first format
    this.load.audio(key, paths[0]);

    // Set up a specific error handler for this audio file
    const errorHandler = (fileObj: Phaser.Loader.File) => {
      if (fileObj.key === key) {
        console.warn(
          `Failed to load audio ${key} from ${fileObj.url}, trying fallback...`
        );

        // Remove this specific error handler
        this.load.off("loaderror", errorHandler);

        // Try the next format if available
        if (paths.length > 1) {
          this.loadAudioWithFallback(key, paths.slice(1));
        } else {
          console.error(`All fallbacks for ${key} failed`);
          // Create a dummy audio object to prevent errors
          this.cache.audio.add(key, { tag: new Audio() });
        }
      }
    };

    this.load.on("loaderror", errorHandler);
  }

  create(): void {
    // Check if animations already exist before creating
    if (!this.anims.exists("left")) {
      this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.anims.exists("turn")) {
      this.anims.create({
        key: "turn",
        frames: [{ key: "player", frame: 4 }],
        frameRate: 20,
      });
    }

    if (!this.anims.exists("right")) {
      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // Initialize game settings
    this.registry.set("soundEnabled", true);
    this.registry.set("score", 0);
    this.registry.set("enemiesDefeated", 0);
    this.registry.set("ammoUsed", 0);

    // Start with the menu scene instead of the game scene
    this.scene.start("MenuScene");
  }
}
