import Phaser from "phaser";
import { IInputHandler } from "../interfaces/IInputHandler.ts";

export class Player
  extends Phaser.Physics.Arcade.Sprite
  implements IInputHandler
{
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private isJumping: boolean = false;
  private canDoubleJump: boolean = false;
  private gun: Phaser.GameObjects.Sprite;
  private lastFired: number = 0;
  private fireRate: number = 200; // ms between shots
  public bullets: Phaser.Physics.Arcade.Group;
  private facing: string = "right";
  private fireButton: Phaser.Input.Keyboard.Key;
  private spaceKey: Phaser.Input.Keyboard.Key;
  private canShoot: boolean = true;
  private justPressed: boolean = false; // Track if jump button was just pressed
  private isInvincible: boolean = false;
  private invincibilityDuration: number = 1000; // 1 second of invincibility after being hit

  // Player stats
  public health: number = 5;
  public maxHealth: number = 5;
  public ammo: number = 20;
  public maxAmmo: number = 30;
  public score: number = 0;
  public isPoweredUp: boolean = false;
  private powerUpDuration: number = 5000; // 5 seconds
  private powerUpTimer?: Phaser.Time.TimerEvent;

  // WASD keys
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;

  // Dash key and properties
  private shiftKey: Phaser.Input.Keyboard.Key;
  private isDashing: boolean = false;
  private dashCooldown: number = 0;
  private dashDuration: number = 200; // ms
  private dashCooldownTime: number = 1000; // ms

  // Debug properties
  private debugKey: Phaser.Input.Keyboard.Key;
  private showDebug: boolean = false;
  private debugStartTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;

  // Override body property with more specific type
  declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");

    // Add player to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.body.setGravityY(800);
    this.body.setSize(20, 40);
    this.body.setOffset(6, 8);

    // Set up animations
    this.createAnimations();

    // Set up input
    this.cursors = scene.input.keyboard!.createCursorKeys();

    // Set up WASD keys
    this.keyW = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // Set up space key for jumping
    this.spaceKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Set up shift key for dashing
    this.shiftKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );

    // Create gun
    this.gun = scene.add.sprite(x, y, "gun");
    this.gun.setOrigin(0.3, 0.5);
    this.gun.setScale(0.7);

    // Create bullet group
    this.bullets = scene.physics.add.group({
      defaultKey: "bullet",
      maxSize: 10,
    });

    // Add fire button (X key or CTRL)
    this.fireButton = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    );

    // Set up debug key (F1)
    this.debugKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.F1
    );

    // Toggle debug with F1 key
    scene.input.keyboard!.on("keydown-F1", () => {
      this.toggleDebug();
    });

    // Also toggle debug with Shift+D
    scene.input.keyboard!.on("keydown-P", (event: KeyboardEvent) => {
      if (event.shiftKey) {
        this.toggleDebug();
      }
    });

    // Initialize debug time
    this.debugStartTime = scene.time.now;
  }

  // Helper method to toggle debug display
  private toggleDebug(): void {
    this.showDebug = !this.showDebug;

    // Get or create debug text
    let debugText = this.scene.registry.get("debugText");
    if (!debugText && this.showDebug) {
      debugText = this.scene.add.text(10, 10, "", {
        font: "16px Arial",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 10 },
      });
      debugText.setScrollFactor(0);
      debugText.setDepth(1000);
      this.scene.registry.set("debugText", debugText);
    }

    if (debugText) {
      debugText.setVisible(this.showDebug);
    }
  }

  createAnimations(): void {
    // Create player animations
    if (!this.scene.anims.exists("idle")) {
      this.scene.anims.create({
        key: "idle",
        frames: this.scene.anims.generateFrameNumbers("player", {
          start: 4,
          end: 4,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists("walk")) {
      this.scene.anims.create({
        key: "walk",
        frames: this.scene.anims.generateFrameNumbers("player", {
          start: 0,
          end: 8,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  handleInput(time: number, delta: number): void {
    // Handle horizontal movement with both arrow keys and WASD
    const isLeftPressed = this.cursors.left.isDown || this.keyA.isDown;
    const isRightPressed = this.cursors.right.isDown || this.keyD.isDown;

    // Check for jump input using JustDown to detect single presses
    const upArrowJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const wKeyJustDown = Phaser.Input.Keyboard.JustDown(this.keyW);
    const spaceJustDown = Phaser.Input.Keyboard.JustDown(this.spaceKey);
    const isJumpJustPressed = upArrowJustDown || wKeyJustDown || spaceJustDown;

    const isShiftPressed = this.shiftKey.isDown;

    // Handle shooting with improved logic
    const fireKeyPressed =
      this.fireButton.isDown ||
      this.scene.input.keyboard!.checkDown(
        this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL),
        0
      );

    if (fireKeyPressed && time > this.lastFired) {
      this.shoot();
      this.lastFired = time + this.fireRate;
    }

    // Handle dashing
    if (isShiftPressed && !this.isDashing && time > this.dashCooldown) {
      this.isDashing = true;
      this.dashCooldown = time + this.dashCooldownTime;

      // Apply dash velocity in the direction the player is facing
      const dashVelocity = this.facing === "right" ? 400 : -400;
      this.setVelocityX(dashVelocity);

      // Create a dash effect
      this.scene.tweens.add({
        targets: this,
        alpha: 0.7,
        duration: 100,
        yoyo: true,
        repeat: 1,
      });

      // End dash after duration
      this.scene.time.delayedCall(this.dashDuration, () => {
        this.isDashing = false;
      });
    }

    // Only handle regular movement if not dashing
    if (!this.isDashing) {
      if (isLeftPressed) {
        this.setVelocityX(-200);
        this.anims.play("walk", true);
        this.setFlipX(true);
        this.facing = "left";
      } else if (isRightPressed) {
        this.setVelocityX(200);
        this.anims.play("walk", true);
        this.setFlipX(false);
        this.facing = "right";
      } else {
        this.setVelocityX(0);
        this.anims.play("idle", true);
      }
    }

    // Handle jumping with both up arrow and W/Space
    if (isJumpJustPressed) {
      console.log(
        "Jump pressed! On ground:",
        this.body.touching.down,
        "Can double jump:",
        this.canDoubleJump
      );

      if (this.body.touching.down) {
        // First jump from the ground
        this.setVelocityY(-500);
        this.isJumping = true;
        this.canDoubleJump = true;
        console.log("First jump executed!");

        // Play jump sound (if available)
        if (this.scene.sound.get("jump")) {
          this.scene.sound.play("jump", { volume: 0.5 });
        }
      } else if (this.isJumping && this.canDoubleJump) {
        // Double jump in mid-air
        this.setVelocityY(-400);
        this.canDoubleJump = false;
        console.log("Double jump executed!");

        // Play double jump sound (if available)
        if (this.scene.sound.get("jump")) {
          this.scene.sound.play("jump", { volume: 0.3, rate: 1.2 });
        }
      }
    }

    // Reset jump state when landing
    if (this.body.touching.down) {
      if (this.isJumping) {
        console.log("Landed on ground, resetting jump state");
      }
      this.isJumping = false;
    }
  }

  shoot(): void {
    // Check if we have bullets left
    if (this.ammo <= 0) {
      // Play empty gun sound
      this.scene.sound.play("empty", { volume: 0.5 });
      return;
    }

    // Create bullet
    const bullet = this.bullets.create(
      this.x + (this.flipX ? -20 : 20),
      this.y - 4,
      "bullet"
    );

    if (bullet) {
      // Decrease bullet count
      this.ammo--;

      // Update UI
      this.scene.events.emit("bulletsChanged", this.ammo);

      const offsetX = this.facing === "right" ? 25 : -25;

      // Create muzzle flash
      const flash = this.scene.add.sprite(
        this.x + offsetX,
        this.y - 4,
        "muzzle-flash"
      );
      flash.setScale(0.5);
      flash.play("flash");
      flash.on("animationcomplete", () => {
        flash.destroy();
      });

      // Set bullet velocity based on player direction
      bullet.setVelocityX(this.flipX ? -600 : 600);
      bullet.body.setAllowGravity(false);

      // Play sound
      this.scene.sound.play("shoot", { volume: 0.5 });

      // If powered up, make bullet stronger
      if (this.isPoweredUp) {
        bullet.setData("damage", 2);
        bullet.setTint(0xff00ff);
        bullet.setScale(1.5);
      } else {
        bullet.setData("damage", 1);
      }
    }
  }

  update(time: number, delta: number): void {
    // Update gun position
    const gunOffsetX = this.facing === "right" ? 15 : -15;
    const gunOffsetY = -5; // Slightly above center
    this.gun.setPosition(this.x + gunOffsetX, this.y + gunOffsetY);
    this.gun.setFlipX(this.facing === "left");

    // Ensure gun is visible and has correct depth
    this.gun.setVisible(true);
    this.gun.setDepth(this.depth + 1);

    // Calculate FPS
    this.frameCount++;
    if (time - this.debugStartTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.debugStartTime = time;
    }

    // Debug text to show player state
    if (this.showDebug) {
      if (!this.scene.registry.get("debugText")) {
        const debugText = this.scene.add.text(10, 10, "", {
          font: "16px Arial",
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 10, y: 10 },
        });
        debugText.setScrollFactor(0);
        debugText.setDepth(1000);
        this.scene.registry.set("debugText", debugText);
      }

      const debugText = this.scene.registry.get("debugText");
      if (debugText) {
        const worldX = Math.round(this.x);
        const worldY = Math.round(this.y);
        const velocityX = Math.round(this.body.velocity.x);
        const velocityY = Math.round(this.body.velocity.y);
        const dashReady = time > this.dashCooldown ? "Yes" : "No";
        const dashCooldownRemaining = Math.max(
          0,
          Math.round((this.dashCooldown - time) / 1000)
        );

        debugText.setText(
          `FPS: ${this.fps}\n` +
            `Position: (${worldX}, ${worldY})\n` +
            `Velocity: (${velocityX}, ${velocityY})\n` +
            `On Ground: ${this.body.touching.down}\n` +
            `Is Jumping: ${this.isJumping}\n` +
            `Can Double Jump: ${this.canDoubleJump}\n` +
            `Is Dashing: ${this.isDashing}\n` +
            `Dash Ready: ${dashReady}${
              dashCooldownRemaining ? ` (${dashCooldownRemaining}s)` : ""
            }\n` +
            `Memory: ${Math.round(
              (window.performance as any).memory?.usedJSHeapSize / 1048576 || 0
            )}MB\n` +
            `\nPress F1 or Shift+D to toggle debug info`
        );
      }
    }

    // Ensure jump state is properly tracked
    if (this.body.touching.down) {
      // Only reset if we were previously in the air
      if (this.isJumping) {
        this.isJumping = false;
      }
    } else if (!this.isJumping && this.body.velocity.y < 0) {
      // If we're moving upward and not marked as jumping, we must be jumping
      this.isJumping = true;
    }
  }

  /**
   * Player takes damage
   * @param amount Amount of damage to take
   * @returns Whether the player died from this damage
   */
  public takeDamage(amount: number = 1): boolean {
    // Don't take damage if powered up or invincible
    if (this.isPoweredUp || this.isInvincible) return false;

    this.health = Math.max(0, this.health - amount);

    // Update UI
    this.scene.events.emit("healthChanged", this.health);

    // Flash red when hit
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });

    // Play hit sound if available
    if (this.scene.sound.get("player-hit")) {
      this.scene.sound.play("player-hit", { volume: 0.5 });
    }

    // Make player invincible for a short time
    this.isInvincible = true;

    // Visual feedback for invincibility
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.alpha = 1;
      },
    });

    // Remove invincibility after duration
    this.scene.time.delayedCall(this.invincibilityDuration, () => {
      this.isInvincible = false;
    });

    // Check if player died
    if (this.health <= 0) {
      this.die();
      return true;
    }

    return false;
  }

  /**
   * Handle player death
   */
  private die(): void {
    // Play death animation/sound
    if (this.scene.sound.get("player-death")) {
      this.scene.sound.play("player-death", { volume: 0.7 });
    }

    // Disable player input temporarily
    this.setActive(false);

    // Flash and fade
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // Reset player
        this.health = this.maxHealth;
        this.scene.events.emit("healthChanged", this.health);
        this.setActive(true);

        // Respawn at start position or checkpoint
        this.setPosition(100, 300);
      },
    });
  }

  /**
   * Add bullets to the player's inventory
   */
  public addBullets(amount: number): void {
    this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
    this.scene.events.emit("bulletsChanged", this.ammo);
  }

  public activatePowerUp(): void {
    // Set powered up state
    this.isPoweredUp = true;

    // Visual effect - tint the player
    this.setTint(0xff00ff);

    // Clear existing timer if there is one
    if (this.powerUpTimer) {
      this.powerUpTimer.remove();
    }

    // Set timer to end power-up
    this.powerUpTimer = this.scene.time.delayedCall(
      this.powerUpDuration,
      () => {
        this.isPoweredUp = false;
        this.clearTint();
      }
    );

    // Emit event for UI updates if needed
    this.scene.events.emit("powerUpActivated");
  }

  getBullets(): Phaser.Physics.Arcade.Group {
    return this.bullets;
  }
}
