import Phaser from "phaser";
import { IInputHandler } from "../interfaces/IInputHandler.ts";
import { InputSystem } from "../systems/InputSystem";

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

  // Touch controls state
  private touchControlsState: {
    left: boolean;
    right: boolean;
    jump: boolean;
    shoot: boolean;
    dash: boolean;
  } = {
    left: false,
    right: false,
    jump: false,
    shoot: false,
    dash: false,
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");

    // Add player to the scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body with better collision handling
    this.body.setGravityY(800);
    this.body.setSize(20, 40);
    this.body.setOffset(6, 8);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0);
    this.body.setMaxVelocity(500, 800);
    this.body.setDragX(1000);

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
    // Skip input handling if player is dead or off-screen
    if (!this.active || this.isDead || !this.body) return;

    // Safety check - reset position if somehow went off-screen
    const gameHeight = Number(this.scene.game.config.height);
    if (this.y > gameHeight) {
      this.setPosition(100, 100);
      this.setVelocity(0, 0);
      return;
    }

    // Process keyboard inputs - use existing cursors
    const leftPressed = this.cursors.left.isDown || this.keyA.isDown;
    const rightPressed = this.cursors.right.isDown || this.keyD.isDown;
    const jumpPressed =
      this.cursors.up.isDown || this.keyW.isDown || this.spaceKey.isDown;
    const dashPressed = this.shiftKey.isDown;
    const shootPressed = this.fireButton.isDown;

    // Get virtual control states from registry (for mobile)
    const virtualLeft = this.scene.registry.get("virtualLeft") || false;
    const virtualRight = this.scene.registry.get("virtualRight") || false;
    const virtualJump = this.scene.registry.get("virtualJump") || false;
    const virtualShoot = this.scene.registry.get("virtualShoot") || false;
    const virtualDash = this.scene.registry.get("virtualDash") || false;

    // Combine keyboard and touch inputs
    const left = leftPressed || virtualLeft || this.touchControlsState.left;
    const right = rightPressed || virtualRight || this.touchControlsState.right;
    const jump = jumpPressed || virtualJump || this.touchControlsState.jump;
    const dash = dashPressed || virtualDash || this.touchControlsState.dash;
    const shoot = shootPressed || virtualShoot || this.touchControlsState.shoot;

    // Moving left/right
    if (left) {
      this.move(-1);
    } else if (right) {
      this.move(1);
    } else {
      this.move(0);
    }

    // Check if player is on the ground to reset jump state
    if ((this.body.touching.down || this.body.blocked.down) && this.isJumping) {
      this.isJumping = false;
      this.canDoubleJump = false;
    }

    // Improved jump handling for mobile
    if (jump) {
      if (!this.justPressed) {
        this.justPressed = true;
        this.jump();
      }
    } else {
      this.justPressed = false;
      // Allow for variable jump height by cutting velocity if jump released
      if (this.body.velocity.y < 0) {
        this.body.velocity.y *= 0.9;
      }
    }

    // Dashing
    if (dash) {
      this.dash();
    }

    // Shooting
    if (shoot && time > this.lastFired) {
      this.shoot();
      this.lastFired = time + this.fireRate;
    }

    // Update player animation based on state
    this.updateAnimation();

    // Update gun position
    this.updateGun();
  }

  /**
   * Handles player movement
   * @param direction -1 for left, 1 for right, 0 for stop
   */
  move(direction: number): void {
    if (this.isDashing) return; // Don't interrupt dash

    if (direction === -1) {
      // Move left
      this.setVelocityX(-200);
      this.setFlipX(true);
      this.facing = "left";
    } else if (direction === 1) {
      // Move right
      this.setVelocityX(200);
      this.setFlipX(false);
      this.facing = "right";
    } else {
      // Stop
      this.setVelocityX(0);
    }
  }

  /**
   * Handles player jumping with double jump capability
   */
  jump(): void {
    // First jump from ground
    if (
      (this.body.touching.down || this.body.blocked.down) &&
      !this.isJumping
    ) {
      this.setVelocityY(-500);
      this.isJumping = true;
      this.canDoubleJump = true;

      // Play jump sound with better mobile handling
      if (this.scene.sound && this.scene.sound.get("jump")) {
        this.scene.sound.play("jump", { volume: 0.5 });
      }

      // Add slight screen shake for feedback
      if (this.scene.cameras && this.scene.cameras.main) {
        this.scene.cameras.main.shake(50, 0.002);
      }
    }
    // Double jump in mid-air if available
    else if (this.isJumping && this.canDoubleJump && !this.isDashing) {
      this.setVelocityY(-400);
      this.canDoubleJump = false;

      // Play double jump sound
      if (this.scene.sound && this.scene.sound.get("jump")) {
        this.scene.sound.play("jump", { volume: 0.3, rate: 1.2 });
      }

      // Visual feedback for double jump
      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: this,
          alpha: 0.7,
          duration: 100,
          yoyo: true,
          repeat: 1,
        });
      }
    }
  }

  /**
   * Handles player dashing ability
   */
  dash(): void {
    const currentTime = this.scene.time.now;

    if (!this.isDashing && currentTime > this.dashCooldown) {
      this.isDashing = true;
      this.dashCooldown = currentTime + this.dashCooldownTime;

      // Apply dash velocity in facing direction
      const dashVelocity = this.facing === "right" ? 400 : -400;
      this.setVelocityX(dashVelocity);

      // Visual effect for dash
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
  }

  /**
   * Updates player animation based on current state
   */
  updateAnimation(): void {
    if (!this.body) return;

    if (this.body.velocity.x !== 0) {
      this.anims.play("walk", true);
    } else {
      this.anims.play("idle", true);
    }
  }

  // Property for death state
  get isDead(): boolean {
    return this.health <= 0;
  }

  shoot(): void {
    // Check if we can shoot (bullets available and not in cooldown)
    if (this.ammo <= 0 || !this.canShoot) {
      // Play empty gun sound only if out of ammo
      if (this.ammo <= 0) {
        this.scene.sound.play("empty", { volume: 0.5 });
      }
      return;
    }

    // Set cooldown to prevent rapid firing
    this.canShoot = false;
    this.scene.time.delayedCall(this.fireRate, () => {
      this.canShoot = true;
    });

    // Create bullet
    const bullet = this.bullets.get(
      this.x + (this.flipX ? -20 : 20),
      this.y - 4,
      "bullet"
    );

    if (bullet) {
      // Enable the bullet physics body and make it active
      bullet.enableBody(
        true,
        this.x + (this.flipX ? -20 : 20),
        this.y - 4,
        true,
        true
      );

      // Decrease bullet count
      this.ammo--;

      // Update UI
      this.scene.events.emit("bulletsChanged", this.ammo);

      // Track ammo usage for stats
      this.scene.registry.values.ammoUsed =
        (this.scene.registry.values.ammoUsed || 0) + 1;

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

      // Set bullet lifespan to auto-destroy after 2 seconds
      bullet.setActive(true);
      bullet.setVisible(true);
      this.scene.time.delayedCall(2000, () => {
        if (bullet && bullet.body) {
          bullet.disableBody(true, true);
        }
      });

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
    // Safety check for physics body
    if (!this.body) return;

    // Reset position if somehow went off-screen
    const gameHeight = Number(this.scene.game.config.height);
    if (this.y > gameHeight) {
      this.setPosition(100, 100);
      this.setVelocity(0, 0);
      return;
    }

    // Update gun position
    const gunOffsetX = this.facing === "right" ? 15 : -15;
    const gunOffsetY = -5;
    this.gun.setPosition(this.x + gunOffsetX, this.y + gunOffsetY);
    this.gun.setFlipX(this.facing === "left");

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
            `On Ground: ${this.body.touching.down}\n`
        );
      }
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
    // Make sure the player can shoot after picking up ammo
    this.canShoot = true;
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

  /**
   * Set the state of a touch control
   * @param control The control to update
   * @param isActive Whether the control is active
   */
  public setTouchControlState(
    control: "left" | "right" | "jump" | "shoot" | "dash",
    isActive: boolean
  ): void {
    this.touchControlsState[control] = isActive;
  }

  private updateGun(): void {
    if (!this.gun) return;

    // Position the gun relative to the player, with responsive positioning
    const isMobile =
      this.scene.sys.game.device.os.android ||
      this.scene.sys.game.device.os.iOS ||
      this.scene.scale.width < 800;
    const offsetX =
      this.facing === "right" ? (isMobile ? 12 : 20) : isMobile ? -12 : -20;
    const offsetY = isMobile ? 6 : 0; // Add a slight vertical adjustment for mobile

    this.gun.setPosition(this.x + offsetX, this.y + offsetY);

    // Flip the gun based on player direction
    this.gun.setFlipX(this.facing === "left");
  }
}
