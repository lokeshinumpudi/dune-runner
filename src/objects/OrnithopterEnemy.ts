import Enemy from "./Enemy";
import Phaser from "phaser";

export default class OrnithopterEnemy extends Enemy {
  private flyTimer: number = 0;
  private flyPattern: number = 0;
  private originalY: number;
  private playerTarget: Phaser.GameObjects.GameObject | null = null;
  private attackMode: boolean = false;
  private attackCooldown: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrol: number,
    speed: number
  ) {
    super(scene, x, y, patrol, speed);
    this.setTexture("ornithopter");
    this.health = 2;
    this.originalY = y;

    // Fix transparency issues by setting alpha to fully opaque
    this.setAlpha(1);

    // Set a tint to make it more visible
    this.setTint(0xffaa00);

    // Allow flying movement
    this.body.allowGravity = false;

    // Set scale for better visibility
    this.setScale(1.2);

    // Check if animation exists before playing
    if (this.scene.anims.exists("ornithopter-move")) {
      this.play("ornithopter-move");
    } else {
      // Create the animation if it doesn't exist
      this.scene.anims.create({
        key: "ornithopter-move",
        frames: this.scene.anims.generateFrameNumbers("ornithopter", {
          start: 0,
          end: 3,
        }),
        frameRate: 12,
        repeat: -1,
      });
      this.play("ornithopter-move");
    }

    // Find the player in the scene
    this.playerTarget = scene.children.getByName("player");
  }

  update(time: number, delta: number): void {
    // Decrease attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // Update player reference if needed
    if (!this.playerTarget) {
      this.playerTarget = this.scene.children.getByName("player");
    }

    // Check for player proximity to enter attack mode
    if (this.playerTarget && this.attackCooldown <= 0) {
      const player = this.playerTarget;
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        player.x,
        player.y
      );

      // If player is within range, enter attack mode
      if (distance < 300) {
        this.attackMode = true;

        // Set a cooldown for the next attack pattern change
        if (this.flyPattern === 0) {
          this.flyPattern = Phaser.Math.Between(1, 3);
          this.attackCooldown = 3000; // 3 seconds between pattern changes
        }
      } else {
        this.attackMode = false;
        this.flyPattern = 0;
      }
    }

    // Update movement based on current mode
    if (this.attackMode && this.playerTarget) {
      const player = this.playerTarget;

      // Different attack patterns
      switch (this.flyPattern) {
        case 1: // Dive attack
          // Move toward player's position with a diving motion
          const targetX = player.x;
          const targetY = player.y - 50;
          const angleToPlayer = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            targetX,
            targetY
          );

          // Move toward player
          this.x += Math.cos(angleToPlayer) * this.speed * (delta / 1000) * 1.5;
          this.y += Math.sin(angleToPlayer) * this.speed * (delta / 1000) * 1.5;
          break;

        case 2: // Circle around player
          const circleSpeed = delta / 1000;
          const radius = 150;
          this.flyTimer += circleSpeed;

          // Create a circular path around the player
          this.x = player.x + Math.cos(this.flyTimer * 2) * radius;
          this.y = player.y + Math.sin(this.flyTimer * 2) * radius;
          break;

        case 3: // Erratic movement
          this.flyTimer += delta / 1000;
          // Random jerky movements
          this.x +=
            Math.cos(this.flyTimer * 5) * this.speed * (delta / 1000) * 0.8;
          this.y +=
            Math.sin(this.flyTimer * 7) * this.speed * (delta / 1000) * 0.8;

          // Keep somewhat near the player
          if (
            Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) >
            400
          ) {
            const angle = Phaser.Math.Angle.Between(
              this.x,
              this.y,
              player.x,
              player.y
            );
            this.x += Math.cos(angle) * this.speed * (delta / 1000);
            this.y += Math.sin(angle) * this.speed * (delta / 1000);
          }
          break;
      }

      // Keep within world bounds
      this.x = Phaser.Math.Clamp(
        this.x,
        0,
        this.scene.physics.world.bounds.width
      );
      this.y = Phaser.Math.Clamp(
        this.y,
        0,
        this.scene.physics.world.bounds.height
      );
    } else {
      // Standard patrol behavior when not in attack mode
      // Update fly pattern
      this.flyTimer += delta;

      // Create a figure-8 flying pattern
      const t = this.flyTimer / 1000;
      this.y = this.originalY + Math.sin(t * 2) * 50;
      this.x += Math.cos(t) * this.speed * (delta / 1000);

      // Keep within patrol bounds
      if (this.x > this.startX + this.patrol) {
        this.x = this.startX + this.patrol;
        this.speed = -Math.abs(this.speed);
      } else if (this.x < this.startX - this.patrol) {
        this.x = this.startX - this.patrol;
        this.speed = Math.abs(this.speed);
      }
    }

    // Flip sprite based on movement direction
    if (this.body.velocity.x < 0 || this.x < this.prevX) {
      this.flipX = true;
    } else if (this.body.velocity.x > 0 || this.x > this.prevX) {
      this.flipX = false;
    }

    // Store current position for next frame comparison
    this.prevX = this.x;
  }

  takeDamage(amount: number): boolean {
    const isDead = super.takeDamage(amount);
    if (isDead && this.scene && this.scene.add) {
      // Create explosion effect
      const explosion = this.scene.add.sprite(this.x, this.y, "explosion");
      // Check if explosion animation exists
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
    }
    return isDead;
  }
}
