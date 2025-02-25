import Phaser from "phaser";
import { Player } from "../objects/Player";
import { DestructibleObject } from "../objects/DestructibleObject";
import { InputSystem } from "../systems/InputSystem";
import Enemy from "../objects/Enemy";

export class DesertScene extends Phaser.Scene {
  protected player!: Player;
  protected platforms!: Phaser.Physics.Arcade.StaticGroup;
  protected movingPlatforms!: Phaser.Physics.Arcade.Group;
  protected destructibles!: Phaser.Physics.Arcade.StaticGroup;
  protected enemies!: Phaser.Physics.Arcade.Group;
  protected inputSystem!: InputSystem;
  protected sky!: Phaser.GameObjects.Image;
  protected dunesFar!: Phaser.GameObjects.TileSprite;
  protected dunesNear!: Phaser.GameObjects.TileSprite;
  protected scoreText!: Phaser.GameObjects.Text;
  protected healthBar!: Phaser.GameObjects.Graphics;
  protected bulletCounter!: Phaser.GameObjects.Text;
  protected collectibles!: Phaser.Physics.Arcade.Group;
  protected ammoPickups!: Phaser.Physics.Arcade.Group;
  protected levelExit!: Phaser.Physics.Arcade.Sprite;
  protected levelComplete: boolean = false;
  protected levelNumber: number = 1;
  protected difficulty: string = "normal";
  protected startTime: number = 0;
  protected enemiesDefeated: number = 0;
  protected ammoUsed: number = 0;

  constructor(config?: Phaser.Types.Scenes.SettingsConfig) {
    super(config || { key: "DesertScene" });
  }

  preload(): void {
    // Load background images
    this.load.image("sky", "assets/backgrounds/sky.png");
    this.load.image("dunes-far", "assets/backgrounds/dunes-far.png");
    this.load.image("dunes-near", "assets/backgrounds/dunes-near.png");
    this.load.image("ground-sand", "assets/backgrounds/ground-sand.png");

    // Load sprites
    this.load.image("platform-sand", "assets/sprites/platform-sand.png");
    this.load.spritesheet("player", "assets/sprites/player.png", {
      frameWidth: 32,
      frameHeight: 48,
    });

    // Load weapon assets
    this.load.image("gun", "assets/sprites/gun.png");
    this.load.image("bullet", "assets/sprites/bullet.png");
    this.load.spritesheet("muzzle-flash", "assets/sprites/muzzle-flash.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("destructible", "assets/sprites/destructible.png");
    this.load.spritesheet("explosion", "assets/sprites/explosion.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    // Load collectibles
    this.load.spritesheet("coin", "assets/sprites/coin.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("ammo", "assets/sprites/ammo.png");

    // Load new assets
    this.load.image("health-pack", "assets/sprites/health-pack.png");
    this.load.spritesheet("power-up", "assets/sprites/power-up.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    this.load.spritesheet(
      "puzzle-element",
      "assets/sprites/puzzle-element.png",
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.load.image("puzzle-door", "assets/sprites/puzzle-door.png");
    this.load.spritesheet("enemy", "assets/sprites/enemy.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Load sounds - updated to use MP3 files
    this.load.audio("shoot", "assets/sounds/shoot.mp3");
    this.load.audio("hit", "assets/sounds/hit.mp3");
    this.load.audio("explosion", "assets/sounds/explosion.mp3");
    this.load.audio("jump", "assets/sounds/jump.mp3");
    this.load.audio("coin", "assets/sounds/coin.mp3");
    this.load.audio("ammo", "assets/sounds/ammo.mp3");
    this.load.audio("player-hit", "assets/sounds/player-hit.mp3");
    this.load.audio("player-death", "assets/sounds/player-death.mp3");
    this.load.audio("empty", "assets/sounds/empty.mp3");
  }

  create(): void {
    // Stop menu music if it's playing
    if (this.sound.get("menu-music")) {
      this.sound.get("menu-music").stop();
    }

    // Initialize tracking variables
    this.startTime = this.time.now;
    this.enemiesDefeated = 0;
    this.ammoUsed = 0;
    this.registry.set("enemiesDefeated", 0);
    this.registry.set("ammoUsed", 0);
    this.levelComplete = false;

    // Set world bounds for scrolling - extended for larger level
    this.physics.world.setBounds(0, 0, 6000, 600);

    // Initialize score
    this.registry.set("score", 0);

    // Initialize platform groups
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group();

    // Create background layers
    this.createBackgrounds();

    // Create platforms
    this.createPlatforms();
    this.createMovingPlatforms();

    // Create animations
    this.createAnimations();

    // Create player - position higher up to be visible and on a platform
    this.player = new Player(this, 100, 100);

    // Create destructible objects
    this.destructibles = this.physics.add.staticGroup();
    this.createDestructibleObjects();

    // Create enemies
    this.enemies = this.physics.add.group();
    this.createEnemies();

    // Create collectibles
    this.collectibles = this.physics.add.group();
    this.ammoPickups = this.physics.add.group();
    this.createCollectibles();

    // Set up camera to follow player
    this.cameras.main.setBounds(0, 0, 6000, 600);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100);

    // Adjust camera to show more of the level below the player
    this.cameras.main.setFollowOffset(0, 100);

    // Set up collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.movingPlatforms);
    this.physics.add.collider(this.collectibles, this.platforms);
    this.physics.add.collider(this.collectibles, this.movingPlatforms);
    this.physics.add.collider(this.ammoPickups, this.platforms);
    this.physics.add.collider(this.ammoPickups, this.movingPlatforms);

    // Set up bullet collisions
    this.physics.add.overlap(
      this.player.bullets,
      this.destructibles,
      this
        .handleBulletCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Set up bullet-enemy collisions
    this.physics.add.overlap(
      this.player.getBullets(),
      this.enemies,
      this
        .handleBulletEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Set up player-enemy collisions
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this
        .handlePlayerEnemyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Set up collectible collisions
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this
        .handlePlayerCollectibleCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Set up ammo pickup collisions
    this.physics.add.overlap(
      this.player,
      this.ammoPickups,
      this
        .handleAmmoCollection as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Add input handler
    this.inputSystem = new InputSystem(this as any);
    this.inputSystem.addHandler(this.player);

    // Add instructions text
    this.createInstructions();

    // Create UI elements
    this.createScorecard();
    this.createHealthBar();
    this.createBulletCounter();

    // Listen for score changes
    this.events.on("scoreChanged", this.updateScorecard, this);
    this.events.on("healthChanged", this.updateHealthBar, this);
    this.events.on("bulletsChanged", this.updateBulletCounter, this);

    // Create level exit
    this.createLevelExit();

    // Initialize UI with current values
    this.updateHealthBar(this.player.health);
    this.updateBulletCounter(this.player.ammo);
  }

  private createInstructions(): void {
    const instructions = [
      "Controls (click to hide):",
      "← → or A/D: Move",
      "↑ W/SPACE: Jump (2x)",
      "SHIFT: Dash",
      "X/CTRL: Shoot",
    ];

    const textStyle = {
      font: "14px Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 2,
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: { x: 8, y: 4 },
    };

    // Create instruction text that follows the camera
    const instructionsText = this.add
      .text(10, 120, instructions, textStyle)
      .setScrollFactor(0)
      .setDepth(100);

    // Make text interactive
    instructionsText.setInteractive({ useHandCursor: true });

    // Add hover effect
    instructionsText.on("pointerover", () => {
      instructionsText.setAlpha(0.8);
    });

    instructionsText.on("pointerout", () => {
      instructionsText.setAlpha(1);
    });

    // Hide on click
    instructionsText.on("pointerdown", () => {
      this.tweens.add({
        targets: instructionsText,
        alpha: 0,
        duration: 200,
        onComplete: () => instructionsText.destroy(),
      });
    });
  }

  private createScorecard(): void {
    const scoreStyle = {
      font: "24px Arial",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    };

    this.scoreText = this.add
      .text(this.cameras.main.width - 20, 20, "SCORE: 0", scoreStyle)
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
  }

  private createHealthBar(): void {
    // Create health bar background
    this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(100);

    // Add health icon and label
    this.add
      .text(20, 20, "HEALTH:", {
        font: "18px Arial",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Draw initial health bar
    this.updateHealthBar(this.player.health);
  }

  private createBulletCounter(): void {
    const bulletIcon = this.add
      .image(20, 80, "ammo")
      .setScrollFactor(0)
      .setScale(1.5);

    this.bulletCounter = this.add
      .text(50, 80, `AMMO: ${this.player.ammo}/${this.player.maxAmmo}`, {
        font: "18px Arial",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setOrigin(0, 0.5);

    // Listen for bullet count changes
    this.events.on("bulletsChanged", (bullets: number) => {
      this.updateBulletCounter(bullets);
    });
  }

  private updateHealthBar(health: number): void {
    this.healthBar.clear();

    // Draw background (dark red)
    this.healthBar.fillStyle(0x660000);
    this.healthBar.fillRect(100, 20, 200, 20);

    // Calculate health percentage
    const healthPercent = health / this.player.maxHealth;

    // Draw health (bright green to red based on health)
    const healthColor = Phaser.Display.Color.GetColor(
      Math.floor(255 * (1 - healthPercent)),
      Math.floor(255 * healthPercent),
      0
    );

    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(100, 20, 200 * healthPercent, 20);

    // Draw border
    this.healthBar.lineStyle(2, 0xffffff);
    this.healthBar.strokeRect(100, 20, 200, 20);
  }

  private updateBulletCounter(bullets: number): void {
    this.bulletCounter.setText(`AMMO: ${bullets}/${this.player.maxAmmo}`);

    // Change color based on ammo count
    if (bullets === 0) {
      this.bulletCounter.setColor("#ff0000");
    } else if (bullets <= 5) {
      this.bulletCounter.setColor("#ffaa00");
    } else {
      this.bulletCounter.setColor("#ffffff");
    }
  }

  private updateScorecard(): void {
    const score = this.registry.get("score") as number;
    this.scoreText.setText(`SCORE: ${score}`);

    // Add a quick scale effect
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
    });
  }

  private createBackgrounds(): void {
    // Get the game dimensions
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create a seamless background with proper parallax layers

    // Sky - fixed background that fills the entire screen
    this.sky = this.add
      .image(0, 0, "sky")
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
      .setScrollFactor(0)
      .setDepth(-30);

    // Far dunes - slowest parallax
    this.dunesFar = this.add
      .tileSprite(0, height * 0.4, width, height * 0.6, "dunes-far")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-20);

    // Near dunes - medium parallax
    this.dunesNear = this.add
      .tileSprite(0, height * 0.6, width, height * 0.4, "dunes-near")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-10);

    // Ground layer - covers the very bottom of the screen
    this.add
      .tileSprite(0, height - 40, width, 40, "ground-sand")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-5);
  }

  private updateBackgrounds(): void {
    // Get camera position
    const camX = this.cameras.main.scrollX;

    // Apply different scroll speeds to create parallax effect
    // The further away the layer, the slower it moves

    // Far dunes move very slowly (distant background)
    this.dunesFar.tilePositionX = camX * 0.1;

    // Near dunes move at medium speed (middle ground)
    this.dunesNear.tilePositionX = camX * 0.3;

    // Ground moves at fastest speed (foreground)
    // Find the ground layer and update it
    const groundLayer = this.children.list.find(
      (child) =>
        child instanceof Phaser.GameObjects.TileSprite && child.depth === -5
    ) as Phaser.GameObjects.TileSprite;

    if (groundLayer) {
      groundLayer.tilePositionX = camX * 0.8;
    }
  }

  private createPlatforms(): void {
    // Create ground platforms with gaps
    let currentX = 0;
    const groundY = this.game.canvas.height - 40;
    const segmentWidth = 400;
    const gapWidth = 200; // Increased gap width for more challenge

    for (let i = 0; i < 15; i++) {
      // Create a ground segment
      const ground = this.platforms.create(
        currentX + segmentWidth / 2,
        groundY,
        "platform-sand"
      );
      ground.setScale(segmentWidth / 32, 2).refreshBody();
      ground.setImmovable(true);

      // Move to the next segment position (including gap)
      currentX += segmentWidth + (i % 3 === 2 ? gapWidth : 0);
    }

    // Create elevated platforms with better spacing
    const platformPositions = [
      // Starting area platforms
      { x: 300, y: 450, width: 120 },
      { x: 600, y: 400, width: 120 },

      // Challenge section platforms
      { x: 1300, y: 300, width: 120 },
      { x: 1700, y: 250, width: 120 },

      // Mid-level platforms
      { x: 2400, y: 200, width: 150 },
      { x: 2800, y: 200, width: 150 },

      // Advanced section platforms
      { x: 3200, y: 150, width: 120 },
      { x: 3600, y: 250, width: 120 },
      { x: 4000, y: 350, width: 120 },

      // Final approach
      { x: 4400, y: 300, width: 120 },
      { x: 5200, y: 200, width: 120 },

      // Secret areas
      { x: 5600, y: 150, width: 100 },
    ];

    // Create all platforms with proper spacing
    platformPositions.forEach((platform) => {
      const plat = this.platforms.create(
        platform.x,
        platform.y,
        "platform-sand"
      );
      plat.setScale(platform.width / 32, 0.5).refreshBody();
      plat.setImmovable(true);
    });
  }

  private createMovingPlatforms(): void {
    const movingPlatformConfigs = [
      // Vertical moving platforms
      {
        x: 800,
        y: 300,
        movement: { y: 150 }, // Move up/down by 150px
        duration: 3000,
        width: 100,
      },
      {
        x: 1500,
        y: 250,
        movement: { y: 100 },
        duration: 2500,
        width: 100,
      },
      {
        x: 2200,
        y: 200,
        movement: { y: 120 },
        duration: 2800,
        width: 100,
      },

      // Horizontal moving platforms
      {
        x: 2800,
        y: 300,
        movement: { x: 200 },
        duration: 4000,
        width: 120,
      },
      {
        x: 3500,
        y: 250,
        movement: { x: 150 },
        duration: 3500,
        width: 100,
      },

      // Diagonal moving platforms
      {
        x: 4200,
        y: 200,
        movement: { x: 100, y: 100 },
        duration: 3000,
        width: 100,
      },
      {
        x: 4800,
        y: 300,
        movement: { x: -100, y: -100 },
        duration: 3500,
        width: 100,
      },
    ];

    movingPlatformConfigs.forEach((config) => {
      const platform = this.movingPlatforms.create(
        config.x,
        config.y,
        "platform-sand"
      );

      platform.setScale(config.width / 32, 0.5);
      platform.refreshBody();
      platform.setImmovable(true);
      platform.body.setAllowGravity(false);

      // Add tint to distinguish moving platforms
      platform.setTint(0xffdd88);

      // Create movement tween
      this.tweens.add({
        targets: platform,
        x: config.movement.x ? platform.x + config.movement.x : platform.x,
        y: config.movement.y ? platform.y + config.movement.y : platform.y,
        duration: config.duration,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });

      // Add particle trail
      this.add.particles(0, 0, "sand-particle", {
        follow: platform,
        frequency: 100,
        scale: { start: 0.2, end: 0 },
        speed: 50,
        lifespan: 1000,
        alpha: { start: 0.5, end: 0 },
        tint: 0xffdd88,
        blendMode: "ADD",
      });
    });
  }

  private createAnimations(): void {
    // Player animations
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "player", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    // Muzzle flash animation
    this.anims.create({
      key: "flash",
      frames: this.anims.generateFrameNumbers("muzzle-flash", {
        start: 0,
        end: 2,
      }),
      frameRate: 20,
      repeat: 0,
    });

    // Explosion animation
    this.anims.create({
      key: "explosion",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 4,
      }),
      frameRate: 15,
      repeat: 0,
    });

    // Coin animation
    this.anims.create({
      key: "coin-spin",
      frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    // Power-up animation
    this.anims.create({
      key: "power-up-pulse",
      frames: this.anims.generateFrameNumbers("power-up", { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });

    // Puzzle element animation
    this.anims.create({
      key: "puzzle-pulse",
      frames: this.anims.generateFrameNumbers("puzzle-element", {
        start: 0,
        end: 3,
      }),
      frameRate: 6,
      repeat: -1,
    });

    // Enemy animations - using fewer frames to avoid errors
    this.anims.create({
      key: "enemy-idle",
      frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 0 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-move",
      frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "enemy-attack",
      frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 1 }),
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: "enemy-death",
      frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 1 }),
      frameRate: 12,
      repeat: 0,
    });
  }

  private createDestructibleObjects(): void {
    // Add destructible objects throughout the level
    const positions = [
      { x: 400, y: 500 },
      { x: 800, y: 400 },
      { x: 1200, y: 300 },
      { x: 1400, y: 50 },
      { x: 1800, y: 50 },
      { x: 2200, y: 100 },
      { x: 2600, y: 200 },
      { x: 3000, y: 300 },
      { x: 3400, y: 250 },
      { x: 3800, y: 150 },
      { x: 4200, y: 50 },
      { x: 4500, y: 50 },
    ];

    positions.forEach((pos) => {
      const destructible = new DestructibleObject(this, pos.x, pos.y);
      this.destructibles.add(destructible);
    });
  }

  private createEnemies(): void {
    // Add enemies throughout the level - adjusted for new platform positions
    const enemyPositions = [
      // Early game - sparse enemies
      { x: 700, y: 350 },
      { x: 1100, y: 300 },

      // First challenge section
      { x: 1600, y: 200 },
      { x: 2100, y: 150 },

      // Mid-level
      { x: 2600, y: 150 },
      { x: 3000, y: 150 },

      // Vertical challenge - more difficult
      { x: 3400, y: 100 },
      { x: 3800, y: 200 },
      { x: 4200, y: 300 },

      // Final approach - most challenging
      { x: 4600, y: 250 },
      { x: 5000, y: 200 },
      { x: 5400, y: 150 },
    ];

    enemyPositions.forEach((pos) => {
      const enemy = new Enemy(this, pos.x, pos.y);
      enemy.setPlayer(this.player);
      this.enemies.add(enemy);
    });

    // Set up collision between enemies and platforms
    this.physics.add.collider(this.enemies, this.platforms);
  }

  private handlePlayerEnemyCollision(
    player: Phaser.GameObjects.GameObject,
    enemy: Phaser.GameObjects.GameObject
  ): void {
    // Cast to proper types
    const p = player as Player;
    const e = enemy as Enemy;

    // Check if player is jumping on enemy from above
    if (p.body.touching.down && e.body.touching.up) {
      // Player jumped on enemy
      e.takeDamage(1);
      p.setVelocityY(-300); // Bounce off enemy
    } else {
      // Enemy hit player
      p.takeDamage(1);
    }
  }

  private handleBulletEnemyCollision(
    bullet: Phaser.GameObjects.GameObject,
    enemy: Phaser.GameObjects.GameObject
  ): void {
    // Cast to proper types
    const b = bullet as Phaser.Physics.Arcade.Sprite;
    const e = enemy as Enemy;

    // Destroy bullet
    b.destroy();

    // Damage enemy
    const enemyDefeated = e.takeDamage(1);

    // Add score if enemy was defeated
    if (enemyDefeated) {
      this.registry.values.score += 100;
      this.events.emit("scoreChanged");

      // Track enemies defeated
      this.enemiesDefeated++;
      this.registry.set("enemiesDefeated", this.enemiesDefeated);
    }

    // Track ammo used
    this.ammoUsed++;
    this.registry.set("ammoUsed", this.ammoUsed);
  }

  private handleBulletCollision(
    bullet:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    destructible:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ): void {
    // Disable bullet
    (bullet as Phaser.Physics.Arcade.Sprite).disableBody(true, true);

    // Create impact effect
    const impact = this.add.sprite(
      (bullet as Phaser.Physics.Arcade.Sprite).x,
      (bullet as Phaser.Physics.Arcade.Sprite).y,
      "muzzle-flash"
    );
    impact.setScale(0.8);
    impact.play("flash");
    impact.on("animationcomplete", function () {
      impact.destroy();
    });

    // Damage destructible object if it's a DestructibleObject
    if (destructible instanceof DestructibleObject) {
      destructible.hit();
    }

    // Add points when destructible is hit
    const registry = this.registry.values as Record<string, number>;
    registry.score += 10;
    this.events.emit("scoreChanged");
  }

  private handlePlayerCollectibleCollision(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    collectible: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    const collectibleSprite = collectible as Phaser.Physics.Arcade.Sprite;
    const collectibleType = collectibleSprite.getData("type");

    switch (collectibleType) {
      case "coin":
        // Increment score
        const currentScore = this.registry.get("score");
        this.registry.set("score", currentScore + 10);
        this.events.emit("scoreChanged");

        // Play sound
        this.sound.play("coin", { volume: 0.5 });
        break;

      case "health":
        // Increase player health
        if (this.player.health < this.player.maxHealth) {
          this.player.health += 1;
          this.events.emit("healthChanged");
        }

        // Play sound
        this.sound.play("ammo", { volume: 0.5 });
        break;

      case "power-up":
        // Give player a power-up (e.g., temporary invincibility or damage boost)
        this.player.activatePowerUp();

        // Play sound
        this.sound.play("ammo", { volume: 0.7 });
        break;

      case "puzzle":
        // Unlock corresponding door
        const puzzleId = collectibleSprite.getData("puzzleId");
        this.unlockPuzzleDoor(puzzleId);

        // Play sound
        this.sound.play("coin", { volume: 0.7 });
        break;
    }

    // Destroy the collectible
    collectibleSprite.destroy();
  }

  private unlockPuzzleDoor(puzzleId: number): void {
    // Find the door with matching puzzleId
    this.destructibles.getChildren().forEach((child) => {
      const door = child as Phaser.Physics.Arcade.Sprite;

      if (
        door.getData("type") === "door" &&
        door.getData("puzzleId") === puzzleId
      ) {
        // Unlock the door
        door.setData("unlocked", true);

        // Visual feedback
        this.tweens.add({
          targets: door,
          alpha: 0,
          y: door.y - 50,
          duration: 1000,
          ease: "Power2",
          onComplete: () => {
            door.destroy();
          },
        });

        // Add particles for effect
        const particles = this.add.particles(0, 0, "puzzle-element", {
          x: door.x,
          y: door.y,
          speed: { min: 50, max: 100 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.4, end: 0 },
          lifespan: 1000,
          quantity: 20,
          blendMode: "ADD",
        });

        // Stop emitter after a short time
        this.time.delayedCall(1000, () => {
          particles.destroy();
        });
      }
    });
  }

  private handleAmmoCollection(
    player: Phaser.GameObjects.GameObject,
    ammo: Phaser.GameObjects.GameObject
  ): void {
    // Cast to sprite
    const ammoSprite = ammo as Phaser.Physics.Arcade.Sprite;

    // Play collect sound
    this.sound.play("ammo", { volume: 0.5 });

    // Add ammo
    this.player.addBullets(5);

    // Create floating text
    const ammoText = this.add.text(ammoSprite.x, ammoSprite.y - 20, "+5 AMMO", {
      font: "16px Arial",
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // Animate and remove the text
    this.tweens.add({
      targets: ammoText,
      y: ammoText.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => ammoText.destroy(),
    });

    // Destroy the ammo pickup
    ammoSprite.destroy();
  }

  private createCollectibles(): void {
    // Create coins throughout the level - adjusted for new platform positions
    const coinPositions = [
      // Starting area coins
      { x: 300, y: 400 },
      { x: 600, y: 350 },
      { x: 900, y: 300 },

      // Challenge section coins
      { x: 1300, y: 250 },
      { x: 1700, y: 200 },
      { x: 2000, y: 150 },

      // Rest area coins
      { x: 2400, y: 150 },
      { x: 2800, y: 150 },

      // Vertical challenge coins
      { x: 3200, y: 100 },
      { x: 3600, y: 200 },
      { x: 4000, y: 300 },

      // Final approach coins
      { x: 4400, y: 250 },
      { x: 4800, y: 200 },
      { x: 5200, y: 150 },

      // Secret area coins
      { x: 5600, y: 100 },
    ];

    // Create coins
    coinPositions.forEach((pos) => {
      const coin = this.collectibles.create(pos.x, pos.y, "coin");
      coin.play("coin-spin");
      coin.setData("type", "coin");
      coin.body.setAllowGravity(false);
      coin.body.setImmovable(true);
    });

    // Create ammo pickups - strategically placed
    const ammoPositions = [
      { x: 800, y: 450 }, // Early game
      { x: 1500, y: 300 }, // Before first challenge
      { x: 2200, y: 200 }, // Mid-level
      { x: 3000, y: 250 }, // Before vertical challenge
      { x: 3800, y: 350 }, // After vertical challenge
      { x: 4600, y: 250 }, // Final approach
      { x: 5400, y: 150 }, // Secret area
    ];

    ammoPositions.forEach((pos) => {
      const ammo = this.ammoPickups.create(pos.x, pos.y, "ammo");
      ammo.setData("type", "ammo");
      ammo.body.setAllowGravity(false);
      ammo.body.setImmovable(true);

      // Add floating animation
      this.tweens.add({
        targets: ammo,
        y: pos.y - 10,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    // Create health packs - placed at critical points
    const healthPositions = [
      { x: 1800, y: 200 }, // After first challenge
      { x: 3400, y: 250 }, // During vertical challenge
      { x: 5000, y: 200 }, // Near end
    ];

    healthPositions.forEach((pos) => {
      const healthPack = this.collectibles.create(pos.x, pos.y, "health-pack");
      healthPack.setData("type", "health");
      healthPack.body.setAllowGravity(false);
      healthPack.body.setImmovable(true);

      // Add pulsing animation
      this.tweens.add({
        targets: healthPack,
        scale: 1.2,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private createPuzzleElements(): void {
    // Create puzzle elements and doors - adjusted heights to match new platform positions
    const puzzleSetups = [
      {
        element: { x: 1700, y: 150 },
        door: { x: 1900, y: 250 },
      },
      {
        element: { x: 3300, y: 250 },
        door: { x: 3500, y: 300 },
      },
      {
        element: { x: 4900, y: 200 },
        door: { x: 5100, y: 300 },
      },
    ];

    puzzleSetups.forEach((setup, index) => {
      // Create puzzle element
      const element = this.collectibles.create(
        setup.element.x,
        setup.element.y,
        "puzzle-element"
      );
      element.play("puzzle-pulse");
      element.setData("type", "puzzle");
      element.setData("puzzleId", index);

      // Add physics properties
      element.body.setAllowGravity(false);
      element.body.setImmovable(true);

      // Create door that will be unlocked by this element
      const door = this.destructibles.create(
        setup.door.x,
        setup.door.y,
        "puzzle-door"
      );
      door.setData("type", "door");
      door.setData("puzzleId", index);
      door.setData("unlocked", false);

      // Make door static and immovable - fixed to work with static bodies
      // Static bodies don't have allowGravity property
      door.refreshBody();
    });
  }

  private createLevelExit(): void {
    // Create a level exit at the end of the level
    this.levelExit = this.physics.add.sprite(5800, 400, "puzzle-door");
    this.levelExit.setScale(2);

    // Use the physics body directly
    const body = this.levelExit.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);

    // Add a glow effect
    this.tweens.add({
      targets: this.levelExit,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Add particles around the exit
    const particles = this.add.particles(0, 0, "sand-particle", {
      x: this.levelExit.x,
      y: this.levelExit.y,
      speed: { min: 20, max: 50 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      lifespan: 2000,
      quantity: 1,
      frequency: 200,
      blendMode: "ADD",
      tint: 0xffff00,
    });

    // Add collision with player
    this.physics.add.overlap(
      this.player,
      this.levelExit,
      this.handleLevelExit,
      undefined,
      this
    );
  }

  private handleLevelExit(): void {
    if (this.levelComplete) return;

    this.levelComplete = true;
    this.completeLevel();
  }

  protected completeLevel(): void {
    // Stop player movement
    this.player.setVelocity(0, 0);

    // Calculate time elapsed
    const timeElapsed = this.time.now - this.startTime;

    // Update registry with final stats
    this.registry.set("enemiesDefeated", this.enemiesDefeated);
    this.registry.set("ammoUsed", this.ammoUsed);

    // Launch level complete scene
    this.scene.launch("LevelCompleteScene", {
      levelNumber: this.levelNumber,
      score: this.registry.get("score"),
      timeElapsed: timeElapsed,
    });

    // Pause this scene
    this.scene.pause();
  }

  update(time: number, delta: number): void {
    // Update input system
    this.inputSystem.update(time, delta);

    // Update player
    this.player.update(time, delta);

    // Update background parallax
    this.updateBackgrounds();

    // Update enemies
    this.enemies.getChildren().forEach((enemy) => {
      (enemy as Enemy).update(time, delta);
    });

    // Check if player fell out of bounds
    if (this.player.y > this.physics.world.bounds.height) {
      // Reset player to a safe position
      this.player.setPosition(100, 100);
      this.player.setVelocity(0, 0);

      // Deduct points for falling
      const registry = this.registry.values as Record<string, number>;
      if (registry.score > 100) {
        registry.score -= 100;
      } else {
        registry.score = 0;
      }
      this.events.emit("scoreChanged");
    }

    // Check if player has reached the end of the level
    if (this.player.x > 5800 && !this.levelComplete) {
      this.levelComplete = true;
      this.completeLevel();
    }

    // Update moving platforms' collisions
    this.movingPlatforms.children.iterate((platform: any) => {
      if (platform.body.touching.up && this.player.body.touching.down) {
        // Make player move with platform
        this.player.x += platform.body.deltaX();
        this.player.y += platform.body.deltaY();
      }
    });
  }
}
