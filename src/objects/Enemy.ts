import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  private moveDirection: number = 1;
  private moveSpeed: number = 100;
  private patrolDistance: number = 200;
  private startX: number;
  private health: number = 3;
  private isAttacking: boolean = false;
  private attackCooldown: number = 0;
  private attackRange: number = 150;
  private detectionRange: number = 300;
  private player?: Phaser.Physics.Arcade.Sprite;
  private enemyType: string;

  // Override body property with more specific type
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy");

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set physics properties
    this.setCollideWorldBounds(true);
    this.setBounce(0.2);
    this.setGravityY(300);

    // Increase hitbox size to make enemies easier to hit
    this.body.setSize(28, 40); // Wider and taller hitbox than the sprite's visual size
    this.body.setOffset(2, -4); // Center the hitbox and extend it upward

    // Store starting position for patrol
    this.startX = x;

    // Randomly select enemy type for variety
    const types = ["scout", "guard", "elite"];
    this.enemyType = types[Math.floor(Math.random() * types.length)];

    // Set properties based on enemy type
    switch (this.enemyType) {
      case "scout":
        this.moveSpeed = 150;
        this.health = 2;
        this.setTint(0x00ffff);
        break;
      case "guard":
        this.moveSpeed = 100;
        this.health = 3;
        this.setTint(0xff0000);
        break;
      case "elite":
        this.moveSpeed = 80;
        this.health = 5;
        this.setTint(0xffaa00);
        break;
    }

    // Set depth to appear in front of background elements
    this.setDepth(5);
  }

  setPlayer(player: Phaser.Physics.Arcade.Sprite): void {
    this.player = player;
  }

  update(time: number, delta: number): void {
    // Skip update if not active
    if (!this.active) return;

    // Handle attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }

    // Check if player is in detection range
    if (this.player) {
      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.player.x,
        this.player.y
      );

      if (distanceToPlayer < this.detectionRange) {
        // Player detected - move toward player
        this.moveTowardPlayer();

        // Attack if in range and cooldown is ready
        if (distanceToPlayer < this.attackRange && this.attackCooldown <= 0) {
          this.attack();
        }
      } else {
        // No player detected - patrol normally
        this.patrol();
      }
    } else {
      // No player reference - patrol normally
      this.patrol();
    }

    // Update animation based on movement
    this.updateAnimation();
  }

  private moveTowardPlayer(): void {
    if (!this.player) return;

    // Move toward player
    if (this.player.x < this.x) {
      this.setVelocityX(-this.moveSpeed);
      this.moveDirection = -1;
    } else {
      this.setVelocityX(this.moveSpeed);
      this.moveDirection = 1;
    }

    // Flip sprite based on direction
    this.setFlipX(this.moveDirection === -1);
  }

  private patrol(): void {
    // Patrol back and forth
    if (this.x > this.startX + this.patrolDistance) {
      this.moveDirection = -1;
    } else if (this.x < this.startX - this.patrolDistance) {
      this.moveDirection = 1;
    }

    // Apply velocity based on direction
    this.setVelocityX(this.moveSpeed * this.moveDirection);

    // Flip sprite based on direction
    this.setFlipX(this.moveDirection === -1);
  }

  private attack(): void {
    // Set attacking state
    this.isAttacking = true;

    // Emit event for player to take damage
    this.scene.events.emit("enemyAttack", this);

    // Reset cooldown
    this.attackCooldown = 1000;

    // Play attack animation
    this.play("enemy-attack", true);

    // Reset attacking state after animation completes
    this.scene.time.delayedCall(500, () => {
      this.isAttacking = false;
    });
  }

  private updateAnimation(): void {
    // Update animation based on state
    if (this.isAttacking) {
      // Attack animation is handled in attack method
      return;
    }

    if (this.body.velocity.x !== 0) {
      this.play("enemy-move", true);
    } else {
      this.play("enemy-idle", true);
    }
  }

  takeDamage(damage: number = 1): boolean {
    // Reduce health
    this.health -= damage;

    // Flash the sprite
    this.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();

      // Restore type-specific tint
      switch (this.enemyType) {
        case "scout":
          this.setTint(0x00ffff);
          break;
        case "guard":
          this.setTint(0xff0000);
          break;
        case "elite":
          this.setTint(0xffaa00);
          break;
      }
    });

    // Check if enemy is defeated
    if (this.health <= 0) {
      // Play death animation
      this.play("enemy-death", true);

      // Disable physics body
      this.body.enable = false;

      // Remove after animation completes
      this.on("animationcomplete-enemy-death", () => {
        this.destroy();
      });

      return true; // Enemy defeated
    }

    return false; // Enemy still alive
  }
}
