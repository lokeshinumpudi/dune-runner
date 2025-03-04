import Enemy from "./Enemy";
import Phaser from "phaser";

export default class SandwormEnemy extends Enemy {
  private burrowTimer: number = 0;
  private burrowInterval: number = 5000; // 5 seconds
  private isBurrowed: boolean = false;
  private burrowDuration: number = 3000; // 3 seconds underground
  private emergePosition: { x: number; y: number } | null = null;
  private light: Phaser.GameObjects.Light | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrol: number,
    speed: number
  ) {
    super(scene, x, y, patrol, speed);
    this.setTexture("sandworm");
    this.setScale(1.5);
    this.health = 5;

    // Set up for light pipeline if rendering with WebGL
    if (this.scene.renderer.type === Phaser.WEBGL) {
      this.setPipeline("Light2D");
      this.light = this.scene.lights.addLight(this.x, this.y, 100, 0xff6600, 1);
    }

    // Check if animation exists before playing
    if (this.scene.anims.exists("sandworm-move")) {
      this.play("sandworm-move");
    } else {
      // Create the animation if it doesn't exist
      this.scene.anims.create({
        key: "sandworm-move",
        frames: this.scene.anims.generateFrameNumbers("sandworm", {
          frames: [0, 1, 2, 3, 2, 1], // Sequence for undulating movement
        }),
        frameRate: 8,
        repeat: -1,
      });
      this.play("sandworm-move");
    }

    // Create burrow animation if needed
    if (!this.scene.anims.exists("sandworm-burrow")) {
      this.scene.anims.create({
        key: "sandworm-burrow",
        frames: this.scene.anims.generateFrameNumbers("sandworm", {
          frames: [4, 5, 6, 7], // Sequence for burrowing
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    // Create emerge animation if needed
    if (!this.scene.anims.exists("sandworm-emerge")) {
      this.scene.anims.create({
        key: "sandworm-emerge",
        frames: this.scene.anims.generateFrameNumbers("sandworm", {
          frames: [7, 6, 5, 4], // Reverse sequence for emerging
        }),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  private playSoundWithFallback(key: string): void {
    try {
      if (this.scene.sound.get(key)) {
        this.scene.sound.play(key);
      } else {
        console.warn(`Sound ${key} not found, skipping playback`);
      }
    } catch (error) {
      console.warn(`Error playing sound ${key}: ${error}`);
    }
  }

  private burrow(): void {
    if (this.scene.anims.exists("sandworm-burrow")) {
      this.play("sandworm-burrow");
      this.once("animationcomplete-sandworm-burrow", () => {
        this.setVisible(false);
        if (this.body) this.body.enable = false;
        this.isBurrowed = true;
      });
    } else {
      // No animation, just burrow immediately
      this.setVisible(false);
      if (this.body) this.body.enable = false;
      this.isBurrowed = true;
    }

    this.playSoundWithFallback("sandworm");
    this.createSandEffect(this.x, this.y, 40, 0.8);

    // Randomly pick a new position within patrol bounds to emerge
    const randX = Phaser.Math.Between(
      this.startX - this.patrol,
      this.startX + this.patrol
    );
    this.emergePosition = { x: randX, y: this.y };

    // Update light if exists
    if (this.light) {
      this.light.setIntensity(0.2);
    }
  }

  private emerge(): void {
    if (this.emergePosition) {
      this.x = this.emergePosition.x;
      this.y = this.emergePosition.y;
      this.emergePosition = null;
    }

    this.setVisible(true);
    if (this.body) this.body.enable = true;
    this.isBurrowed = false;

    if (this.scene.anims.exists("sandworm-emerge")) {
      this.play("sandworm-emerge");
      this.once("animationcomplete-sandworm-emerge", () => {
        this.play("sandworm-move");
      });
    } else {
      // No animation, just play the move animation
      this.play("sandworm-move");
    }

    this.playSoundWithFallback("sandworm");
    this.createSandEffect(this.x, this.y, 60, 1);

    // Update light if exists
    if (this.light) {
      this.light.setIntensity(1);
    }
  }

  private createSandEffect(
    x: number,
    y: number,
    count: number,
    scale: number
  ): void {
    // Create ground crack effect
    const crackGraphics = this.scene.add.graphics();
    crackGraphics.lineStyle(3, 0x8b4513, 0.8);

    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const length = 20 + Math.random() * 30;
      crackGraphics.beginPath();
      crackGraphics.moveTo(x, y);
      crackGraphics.lineTo(
        x + Math.cos(angle) * length,
        y + Math.sin(angle) * length
      );
      crackGraphics.stroke();
    }

    // Fade out and destroy
    this.scene.tweens.add({
      targets: crackGraphics,
      alpha: 0,
      duration: 1000,
      onComplete: () => crackGraphics.destroy(),
    });

    if (!this.scene.textures.exists("sand-particle")) return;

    // Sand particle colors
    const colors = [0xdaa520, 0xd2b48c, 0xf4a460, 0xcd853f];

    // Create sand particles
    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.image(
        x + Phaser.Math.Between(-10, 10),
        y + Phaser.Math.Between(-5, 5),
        "sand-particle"
      );

      particle.setTint(colors[Phaser.Math.Between(0, colors.length - 1)]);
      particle.setAlpha(0.8);
      particle.setScale(scale * (0.5 + Math.random() * 0.5));

      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 100;

      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Math.cos(angle) * speed,
        y: particle.y + Math.sin(angle) * speed - 100,
        alpha: 0,
        scale: particle.scale * 0.5,
        duration: 1000 + Math.random() * 500,
        onComplete: () => particle.destroy(),
      });
    }
  }

  update(time: number, delta: number): void {
    // Update light position if it exists
    if (this.light) {
      this.light.x = this.x;
      this.light.y = this.y - 50; // Position above the worm
    }

    // Handle burrowing behavior
    this.burrowTimer += delta;

    if (!this.isBurrowed && this.burrowTimer > this.burrowInterval) {
      this.burrow();
      this.burrowTimer = 0;
    } else if (this.isBurrowed && this.burrowTimer > this.burrowDuration) {
      this.emerge();
      this.burrowTimer = 0;
    }

    if (!this.isBurrowed) {
      super.update(time, delta);
    }
  }

  takeDamage(amount: number): boolean {
    // Create hit effect
    this.createSandEffect(this.x, this.y, 15, 0.6);

    // Play hit sound
    this.playSoundWithFallback("hit");

    const isDead = super.takeDamage(amount);

    if (isDead && this.scene && this.scene.add) {
      // Create explosion effect
      const explosion = this.scene.add.sprite(this.x, this.y, "explosion");
      if (this.scene.anims && this.scene.anims.exists("explosion")) {
        explosion.play("explosion");
        explosion.once("animationcomplete", () => {
          explosion.destroy();
        });
      } else {
        // Just destroy it after a delay if no animation
        if (this.scene.time) {
          this.scene.time.delayedCall(300, () => {
            explosion.destroy();
          });
        } else {
          // If scene.time is also not available, destroy immediately
          explosion.destroy();
        }
      }

      // Create a larger sand effect for death
      this.createSandEffect(this.x, this.y, 80, 1.2);

      // Remove light if it exists
      if (this.light && this.scene.lights) {
        this.scene.lights.removeLight(this.light);
        this.light = null;
      }
    }

    return isDead;
  }
}
