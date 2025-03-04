import Enemy from "./Enemy";
import Phaser from "phaser";

export default class HarkonnenEnemy extends Enemy {
  private attackRange: number = 200; // Detection range in pixels
  private attackCooldown: number = 0;
  private attacking: boolean = false;
  private shootTimer: number = 0;
  private bullets: Phaser.Physics.Arcade.Group;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrol: number,
    speed: number
  ) {
    // Adjust the y position upward to ensure enemy stands on platforms properly
    // The -16 offset ensures the enemy's feet are on the platform surface
    super(scene, x, y - 16, patrol, speed);
    this.setTexture("harkonnen");
    this.health = 3; // Tougher than basic enemies

    // Adjust the body size and offset to better fit the sprite
    this.body.setSize(32, 40);
    this.body.setOffset(8, 8);

    // Create bullet group
    this.bullets = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 10,
    });

    // Check if animation exists before playing
    if (this.scene.anims.exists("harkonnen-move")) {
      this.play("harkonnen-move");
    } else {
      // Create the animation if it doesn't exist
      this.scene.anims.create({
        key: "harkonnen-move",
        frames: this.scene.anims.generateFrameNumbers("harkonnen", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
      this.play("harkonnen-move");
    }
  }

  update(time: number, delta: number): void {
    // Make sure the enemy stays aligned with platforms
    this.checkPlatformAlignment();

    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // Get reference to player if available
    const player = this.scene.children.getByName("player");

    if (player && !this.attacking) {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        player.x,
        player.y
      );

      if (distance < this.attackRange && this.attackCooldown <= 0) {
        // Attack the player
        this.attacking = true;
        this.body.setVelocityX(0);

        // Move toward player before attack
        this.x += Math.sign(player.x - this.x) * 20;

        // Play attack animation if it exists
        if (this.scene.anims.exists("harkonnen-attack")) {
          this.play("harkonnen-attack", true);
          this.once("animationcomplete", () => {
            this.attacking = false;
            this.attackCooldown = 2000; // 2 seconds cooldown
            this.play("harkonnen-move");
          });
        } else {
          // No animation, just wait a bit
          this.scene.time.delayedCall(500, () => {
            this.attacking = false;
            this.attackCooldown = 2000; // 2 seconds cooldown
          });
        }

        return;
      }
    }

    if (!this.attacking) {
      // Do normal patrolling when not attacking
      super.update(time, delta);
    }

    // Shoot at intervals
    this.shootTimer += delta;
    if (this.shootTimer >= 2000) {
      // Shoot every 2 seconds
      this.shoot();
      this.shootTimer = 0;
    }

    // Update bullets
    this.bullets
      .getChildren()
      .forEach((bullet: Phaser.Physics.Arcade.Sprite) => {
        if (bullet.y > this.scene.game.config.height || bullet.y < 0) {
          bullet.destroy();
        }
      });
  }

  // Helper method to check and fix platform alignment
  private checkPlatformAlignment(): void {
    // Check if on a platform and adjust position if needed
    const platforms = this.scene.physics.world.collide(
      this,
      (this.scene as any).platforms
    );

    // Check for moving platforms too
    const movingPlatforms = this.scene.physics.world.collide(
      this,
      (this.scene as any).movingPlatforms
    );

    // If we're on a platform and have velocity, stop horizontal movement
    if ((platforms || movingPlatforms) && Math.abs(this.body.velocity.y) < 10) {
      this.body.setVelocityY(0);
    }
  }

  private shoot(): void {
    const bullet = this.bullets.get(
      this.x,
      this.y,
      "bullet"
    ) as Phaser.Physics.Arcade.Sprite;
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(200);
      bullet.setScale(0.5);
    }
  }

  public getBullets(): Phaser.Physics.Arcade.Group {
    return this.bullets;
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
