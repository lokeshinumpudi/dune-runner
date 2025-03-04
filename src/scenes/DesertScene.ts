import Phaser from "phaser";
import { Player } from "../objects/Player";
import { DestructibleObject } from "../objects/DestructibleObject";
import InputSystem from "../systems/InputSystem";
import Enemy from "../objects/Enemy";
import HarkonnenEnemy from "../objects/HarkonnenEnemy";
import OrnithopterEnemy from "../objects/OrnithopterEnemy";
import SandwormEnemy from "../objects/SandwormEnemy";

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
  protected touchControls!: {
    left: Phaser.GameObjects.Container;
    right: Phaser.GameObjects.Container;
    jump: Phaser.GameObjects.Container;
    shoot: Phaser.GameObjects.Container;
    dash: Phaser.GameObjects.Container;
  };
  protected isMobile: boolean = false;
  protected instructionsText!: Phaser.GameObjects.Text;

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
    this.load.image("sand-particle", "assets/sprites/sand-particle.png");
    this.load.image(
      "platform-collapsing",
      "assets/sprites/platform-collapsing.png"
    );
    this.load.spritesheet("sandworm", "assets/sprites/sandworm.png", {
      frameWidth: 128,
      frameHeight: 256,
    });
    this.load.spritesheet("harkonnen", "assets/sprites/harkonnen.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet("ornithopter", "assets/sprites/ornithopter.png", {
      frameWidth: 96,
      frameHeight: 48,
    });
    this.load.image("spice", "assets/sprites/spice.png");

    // Load sounds with error handling
    const audioFiles = [
      "shoot",
      "hit",
      "explosion",
      "jump",
      "coin",
      "ammo",
      "player-hit",
      "player-death",
      "empty",
      "sandworm",
      "platform-collapse",
      "spice-collect",
    ];

    audioFiles.forEach((key) => {
      this.load.audio(key, `assets/sounds/${key}.mp3`).on("loaderror", () => {
        console.warn(`Audio file ${key}.mp3 not found`);
      });
    });
  }

  create(): void {
    // Check if we're on mobile first thing
    this.isMobile =
      this.sys.game.device.input.touch && !this.sys.game.device.os.desktop;

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

    // Get game dimensions
    const width = this.scale.width;
    const height = this.scale.height;

    // Set world bounds for scrolling - scale with game width
    const worldWidth = Math.max(width * 8, 8000); // At least 8000 or 8x screen width
    const worldHeight = height;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

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

    // Calculate safe spawn position (20% from left, 80% from top)
    const spawnX = width * 0.2;
    const spawnY = height * 0.8;

    // Create player with proper spawn position
    this.player = new Player(this, spawnX, spawnY);

    // Fix player physics body with proper scaling
    const playerScale = height / 720; // Base scale on 720p height
    this.player.setScale(Math.min(1, playerScale));
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setBounce(0);
    this.player.body.setMaxVelocity(500 * playerScale, 800 * playerScale);
    this.player.body.setDragX(1000 * playerScale);

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

    // Set up camera to follow player with responsive bounds
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Adjust camera deadzone based on screen size
    const deadzoneWidth = width * 0.3;
    const deadzoneHeight = height * 0.3;
    this.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);

    // Adjust camera offset based on screen height
    const offsetY = height * 0.2;
    this.cameras.main.setFollowOffset(0, offsetY);

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

    // Create touch controls if on mobile
    if (this.isMobile) {
      this.createTouchControls();
    }
  }

  private createInstructions(): void {
    if (this.isMobile) {
      return;
    }
    const instructions = [
      "Controls (tap to hide):",
      "WASD/Arrows - Move",
      "SPACE - Jump",
      "SHIFT - Dash",
      "CLICK - Shoot",
    ];

    // Create instructions text that's always visible
    this.instructionsText = this.add
      .text(10, 10, instructions.join("\n"), {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    // Make instructions interactive
    this.instructionsText.setInteractive();
    this.instructionsText.on("pointerdown", () => {
      this.instructionsText.setVisible(!this.instructionsText.visible);
    });
  }

  private createScorecard(): void {
    // Position score at top right, ensuring it's always visible
    this.scoreText = this.add
      .text(this.scale.width - 20, 20, "SCORE: 0", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(1000);
  }

  private createHealthBar(): void {
    // Position health bar at top left, ensuring it's always visible
    this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(1000);

    // Update initial health display
    this.updateHealthBar(100);
  }

  private createBulletCounter(): void {
    // Position bullet counter below health bar, ensuring it's always visible
    this.bulletCounter = this.add
      .text(20, 60, "AMMO: 20/30", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  private updateHealthBar(health: number): void {
    this.healthBar.clear();

    // Adjust health bar size for mobile
    const barWidth = this.isMobile ? 250 : 200;
    const barHeight = this.isMobile ? 25 : 20;
    const barX = this.isMobile ? 120 : 100;

    // Draw background (dark red)
    this.healthBar.fillStyle(0x660000);
    this.healthBar.fillRect(barX, 20, barWidth, barHeight);

    // Calculate health percentage
    const healthPercent = health / this.player.maxHealth;

    // Draw health (bright green to red based on health)
    const healthColor = Phaser.Display.Color.GetColor(
      Math.floor(255 * (1 - healthPercent)),
      Math.floor(255 * healthPercent),
      0
    );

    this.healthBar.fillStyle(healthColor);
    this.healthBar.fillRect(barX, 20, barWidth * healthPercent, barHeight);

    // Draw border
    this.healthBar.lineStyle(2, 0xffffff);
    this.healthBar.strokeRect(barX, 20, barWidth, barHeight);
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

  private createPlatforms(): void {
    // Create ground platforms with gaps
    let currentX = 0;
    // Adjust ground level to be closer to bottom of screen for better mobile usage
    const groundY = this.game.canvas.height * 0.95; // Changed from 0.9 to 0.95 to use more bottom space
    const segmentWidth = 400;
    const gapWidth = 150;

    // Create ground segments
    for (let i = 0; i < 25; i++) {
      // Create a ground segment
      const ground = this.platforms.create(
        currentX + segmentWidth / 2,
        groundY,
        "platform-sand"
      );
      ground.setScale(segmentWidth / 32, 2).refreshBody();
      ground.setImmovable(true);

      // Add more predictable gaps for better gameplay
      const isGap = i % 4 === 3; // More regular gap pattern
      const gapSize = gapWidth;

      // Move to next segment
      currentX += segmentWidth + (isGap ? gapSize : 0);
    }

    // Adjust elevated platform positions relative to new ground level
    const platformPositions = [
      // Starting area platforms - adjusted heights for better mobile usage
      { x: 300, y: groundY - 120, width: 120 }, // First jump platform (lowered)
      { x: 600, y: groundY - 160, width: 120 }, // Second jump platform (lowered)
      { x: 900, y: groundY - 200, width: 100 }, // Third jump platform (lowered)

      // Rest of the platforms adjusted relative to groundY
      { x: 1300, y: groundY - 240, width: 120 }, // All platforms lowered by 60 units
      { x: 1500, y: groundY - 180, width: 80 },
      { x: 1700, y: groundY - 260, width: 120 },
      { x: 2000, y: groundY - 200, width: 100 },
      { x: 2300, y: groundY - 160, width: 120 },
      { x: 2600, y: groundY - 240, width: 100 },
      { x: 2900, y: groundY - 180, width: 120 },
      { x: 3200, y: groundY - 210, width: 100 },
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

      // Ensure platform collision body is solid
      plat.body.checkCollision.down = true;
      plat.body.checkCollision.up = true;
      plat.body.checkCollision.left = true;
      plat.body.checkCollision.right = true;
    });
  }

  private createMovingPlatforms(): void {
    const movingPlatformData = [
      // First area moving platforms
      {
        x: 1100,
        y: 320,
        width: 100,
        distance: 200,
        speed: 100,
        vertical: false,
      },

      // Mid section vertical moving platforms - reduced speeds and improved accessibility
      // Stepping platform to help reach vertical platforms
      {
        x: 2400,
        y: 380,
        width: 100,
        distance: 0,
        speed: 0,
        vertical: false,
        stepping: true,
      },
      // First vertical platform - wider and slower
      {
        x: 2500,
        y: 340, // Higher starting position to be reachable
        width: 120, // Wider platform
        distance: 150,
        speed: 30, // Even slower
        vertical: true,
      },
      // Stepping platform between vertical sections
      {
        x: 2700,
        y: 250,
        width: 80,
        distance: 0,
        speed: 0,
        vertical: false,
        stepping: true,
      },
      // Second vertical platform - wider and slower
      {
        x: 2900,
        y: 300, // Higher starting position
        width: 120, // Wider platform
        distance: 200,
        speed: 35, // Even slower
        vertical: true,
      },

      // Horizontal moving platforms for difficult jumps
      {
        x: 3300,
        y: 180,
        width: 60,
        distance: 250,
        speed: 150,
        vertical: false,
      },
      {
        x: 3700,
        y: 250,
        width: 60,
        distance: 300,
        speed: 120,
        vertical: false,
      },

      // Complex moving platforms in late game
      {
        x: 4900,
        y: 250,
        width: 80,
        distance: 180,
        speed: 100,
        vertical: false,
      },
      // Stepping platform before vertical section
      {
        x: 5400,
        y: 350,
        width: 80,
        distance: 0,
        speed: 0,
        vertical: false,
        stepping: true,
      },
      // Improved vertical platform with staggered design
      {
        x: 5500,
        y: 320,
        width: 120, // Wider platform
        distance: 200,
        speed: 30, // Even slower for better control
        vertical: true,
      },
      {
        x: 6000,
        y: 350,
        width: 100,
        distance: 150,
        speed: 130,
        vertical: false,
      },
      // Stepping platform before vertical section
      {
        x: 6300,
        y: 320,
        width: 80,
        distance: 0,
        speed: 0,
        vertical: false,
        stepping: true,
      },
      // Improved vertical platform
      {
        x: 6400,
        y: 280,
        width: 100, // Wider platform
        distance: 120,
        speed: 25, // Very slow for better control
        vertical: true,
      },
      {
        x: 7300,
        y: 320,
        width: 120,
        distance: 250,
        speed: 160,
        vertical: false,
      },

      // Vertical ascension challenge - completely redesigned with stepping stones and slower speeds
      // First section: Starting point
      {
        x: 7900,
        y: 400,
        width: 80,
        distance: 0,
        speed: 0,
        vertical: false,
        stepping: true,
      },
      // First vertical platform
      {
        x: 8000,
        y: 400,
        width: 120, // Wider platform
        distance: 300,
        speed: 30, // Much slower
        vertical: true,
      },
      // Stepping platform for next vertical
      {
        x: 8150,
        y: 300,
        width: 80,
        distance: 0,
        speed: 0,
        vertical: false,
        stepping: true,
      },
      // Second vertical platform
      {
        x: 8300,
        y: 300,
        width: 120, // Wider
        distance: 400,
        speed: 35, // Slower
        vertical: true,
      },
      // Stepping platform for next vertical
      {
        x: 8450,
        y: 150,
        width: 80,
        distance: 0,
        speed: 0,
        vertical: false,
        stepping: true,
      },
      // Third vertical platform
      {
        x: 8600,
        y: 200,
        width: 120, // Wider
        distance: 500,
        speed: 40, // Slower
        vertical: true,
      },
      // Landing platform at top of vertical section
      {
        x: 8750,
        y: 100,
        width: 120,
        distance: 0,
        speed: 0,
        vertical: false,
        stepping: true,
      },

      // Collapsing platforms section
      { x: 9000, y: 150, width: 100, distance: 0, speed: 0, collapsing: true },
      { x: 9300, y: 200, width: 100, distance: 0, speed: 0, collapsing: true },
      { x: 9600, y: 250, width: 100, distance: 0, speed: 0, collapsing: true },

      // Sand dune surfing platforms
      {
        x: 10000,
        y: 300,
        width: 120,
        distance: 600,
        speed: 200,
        sandSurfing: true,
      },
      {
        x: 10500,
        y: 400,
        width: 120,
        distance: 800,
        speed: 250,
        sandSurfing: true,
      },

      // Vertical platforms with horizontal movement for challenging jumps (moved to end game)
      {
        x: 11000,
        y: 300,
        width: 100,
        distance: 200,
        speed: 100,
        vertical: true,
        horizontalDistance: 200,
        horizontalSpeed: 80,
      },
      {
        x: 11400,
        y: 250,
        width: 100,
        distance: 300,
        speed: 120,
        vertical: true,
        horizontalDistance: 300,
        horizontalSpeed: 100,
      },
    ];

    // Create all moving platforms
    movingPlatformData.forEach((data) => {
      const platform = this.movingPlatforms.create(
        data.x,
        data.y,
        data.stepping ? "platform-sand" : "platform-sand"
      );

      platform.setScale(data.width / 32, 0.5).refreshBody();
      platform.setImmovable(true);

      // Add visual distinction for stepping platforms
      if (data.stepping) {
        platform.setTint(0xffcc66); // Give stepping platforms a golden tint
      }

      // Store platform properties for movement
      platform.setData("startPosition", { x: data.x, y: data.y });
      platform.setData("distance", data.distance);
      platform.setData("speed", data.speed);
      platform.setData("vertical", data.vertical);
      platform.setData("direction", 1);
      platform.setData("collapsing", data.collapsing || false);
      platform.setData("sandSurfing", data.sandSurfing || false);
      platform.setData("stepping", data.stepping || false);
      platform.setData("collapseTimer", 0);
      platform.setData("horizontalDistance", data.horizontalDistance || 0);
      platform.setData("horizontalSpeed", data.horizontalSpeed || 0);
      platform.setData("horizontalDirection", 1);

      // Set friction for better player movement
      platform.body.friction.x = 1;
      platform.body.friction.y = 0;
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

    // Update sandworm animations
    this.anims.create({
      key: "sandworm-move",
      frames: this.anims.generateFrameNumbers("sandworm", {
        frames: [0, 1, 2, 3, 2, 1], // Sequence for undulating movement
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "sandworm-burrow",
      frames: this.anims.generateFrameNumbers("sandworm", {
        frames: [4, 5, 6, 7], // Sequence for burrowing
      }),
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: "sandworm-emerge",
      frames: this.anims.generateFrameNumbers("sandworm", {
        frames: [7, 6, 5, 4], // Reverse sequence for emerging
      }),
      frameRate: 12,
      repeat: 0,
    });

    // Create harkonnen animations
    this.anims.create({
      key: "harkonnen-move",
      frames: this.anims.generateFrameNumbers("harkonnen", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Create ornithopter animations
    this.anims.create({
      key: "ornithopter-move",
      frames: this.anims.generateFrameNumbers("ornithopter", {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: -1,
    });
  }

  private createDestructibleObjects(): void {
    // Create destructible objects that block the path or hide secrets
    const destructiblePositions = [
      // Blocking access to ammo
      { x: 500, y: 480, health: 1 },

      // Blocking a shortcut
      { x: 1800, y: 250, health: 2 },

      // Blocking secret areas
      { x: 2400, y: 80, health: 3 },
      { x: 3900, y: 80, health: 3 },

      // Puzzle elements
      { x: 6000, y: 380, health: 2 },
      { x: 6200, y: 380, health: 2 },
      { x: 6400, y: 380, health: 2 },

      // Combat challenges
      { x: 4300, y: 320, health: 1 },
      { x: 4400, y: 320, health: 1 },
      { x: 4500, y: 320, health: 1 },

      // Final challenge
      { x: 7600, y: 380, health: 3 },
      { x: 7650, y: 380, health: 3 },
      { x: 7700, y: 380, health: 3 },
    ];

    // Create all destructible objects
    destructiblePositions.forEach((pos) => {
      const destructible = this.destructibles.create(
        pos.x,
        pos.y,
        "destructible"
      );
      destructible.setData("health", pos.health || 1);
      destructible.setImmovable(true);
      destructible.refreshBody();

      // Color based on health/strength
      if (pos.health === 2) {
        destructible.setTint(0xffaa00);
      } else if (pos.health === 3) {
        destructible.setTint(0xff4400);
      }
    });
  }

  private createEnemies(): void {
    // Create enemies throughout the level with different patterns
    const enemyPositions = [
      // Early enemies
      { x: 800, y: 400, patrol: 200, speed: 50, type: "basic" },
      { x: 1200, y: 400, patrol: 150, speed: 60, type: "basic" },

      // Platform enemies
      { x: 1700, y: 200, patrol: 100, speed: 70, type: "basic" },
      { x: 2800, y: 150, patrol: 150, speed: 80, type: "basic" },

      // Combat arena enemies
      { x: 4300, y: 300, patrol: 250, speed: 100, type: "harkonnen" },
      { x: 4700, y: 250, patrol: 150, speed: 90, type: "harkonnen" },

      // Advanced enemies
      { x: 5500, y: 300, patrol: 200, speed: 120, type: "harkonnen" },
      { x: 6300, y: 300, patrol: 180, speed: 110, type: "harkonnen" },
      { x: 6700, y: 200, patrol: 150, speed: 130, type: "ornithopter" },

      // Vertical challenge enemies
      { x: 8000, y: 300, patrol: 300, speed: 150, type: "ornithopter" },
      { x: 8500, y: 200, patrol: 400, speed: 170, type: "ornithopter" },
      { x: 9000, y: 100, patrol: 500, speed: 190, type: "sandworm" },

      // Final challenge enemies
      { x: 10000, y: 200, patrol: 600, speed: 200, type: "sandworm" },
      { x: 10500, y: 300, patrol: 700, speed: 220, type: "sandworm" },
    ];

    // Create all enemies
    enemyPositions.forEach((pos) => {
      let enemy;
      switch (pos.type) {
        case "harkonnen":
          enemy = new HarkonnenEnemy(this, pos.x, pos.y, pos.patrol, pos.speed);
          break;
        case "ornithopter":
          enemy = new OrnithopterEnemy(
            this,
            pos.x,
            pos.y,
            pos.patrol,
            pos.speed
          );
          break;
        case "sandworm":
          enemy = new SandwormEnemy(this, pos.x, pos.y, pos.patrol, pos.speed);
          break;
        default:
          enemy = new Enemy(this, pos.x, pos.y, pos.patrol, pos.speed);
      }
      this.enemies.add(enemy);
    });
  }

  private handlePlayerEnemyCollision(
    player: Phaser.GameObjects.GameObject,
    enemy: Phaser.GameObjects.GameObject
  ): void {
    // Cast to proper types
    const p = player as Player;
    const e = enemy as Enemy;

    // Check if both bodies exist
    if (!p.body || !e.body) return;

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
    if (!bullet || !enemy) return;

    const e = enemy as Enemy;
    if (e && e.body && typeof e.takeDamage === "function") {
      e.takeDamage(1);
      this.enemiesDefeated++;
    }

    const b = bullet as Phaser.Physics.Arcade.Sprite;
    if (b && b.body) {
      b.destroy();
      this.ammoUsed++;
    }
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

        // Play sound safely
        this.playSoundWithFallback("coin", { volume: 0.5 });
        break;

      case "health":
        // Only heal if not at max health
        if (this.player.health < this.player.maxHealth) {
          const healAmount = collectibleSprite.getData("value") || 1;
          this.player.health = Math.min(
            this.player.maxHealth,
            this.player.health + healAmount
          );
          this.events.emit("healthChanged", this.player.health);

          // Play sound safely
          this.playSoundWithFallback("ammo", { volume: 0.5 });

          // Create floating text
          const healthText = this.add.text(
            collectibleSprite.x,
            collectibleSprite.y - 20,
            `+${healAmount} HP`,
            {
              font: "16px Arial",
              color: "#00ff00",
              stroke: "#000000",
              strokeThickness: 3,
            }
          );

          // Animate and remove the text
          this.tweens.add({
            targets: healthText,
            y: healthText.y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => healthText.destroy(),
          });
        }
        break;

      case "power-up":
        // Give player a power-up (e.g., temporary invincibility or damage boost)
        this.player.activatePowerUp();

        // Play sound safely
        this.playSoundWithFallback("ammo", { volume: 0.7 });
        break;

      case "puzzle":
        // Unlock corresponding door
        const puzzleId = collectibleSprite.getData("puzzleId");
        this.unlockPuzzleDoor(puzzleId);

        // Play sound safely
        this.playSoundWithFallback("coin", { volume: 0.7 });
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

    // Play collect sound safely
    this.playSoundWithFallback("ammo", { volume: 0.5 });

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
    // Create more coins throughout the level with interesting patterns
    const coinPositions = [
      // Starting area coins
      { x: 200, y: 400 },
      { x: 300, y: 380 },
      { x: 400, y: 400 },

      // Platform coins
      { x: 600, y: 350 },
      { x: 650, y: 350 },
      { x: 700, y: 350 },

      // Coins that form a "jump here" arrow
      { x: 1000, y: 400 },
      { x: 1000, y: 350 },
      { x: 1000, y: 300 },
      { x: 1000, y: 250 },
      { x: 1050, y: 300 },
      { x: 950, y: 300 },

      // Platform jumps with rewards
      { x: 1300, y: 250 },
      { x: 1400, y: 250 },
      { x: 1500, y: 300 },
      { x: 1600, y: 300 },
      { x: 1700, y: 200 },
      { x: 1800, y: 200 },

      // Vertical climb coins
      { x: 2200, y: 350 },
      { x: 2250, y: 270 },
      { x: 2300, y: 190 },
      { x: 2350, y: 110 },

      // Bridge coins over dangerous area
      { x: 2500, y: 250 },
      { x: 2600, y: 250 },
      { x: 2700, y: 150 },
      { x: 2800, y: 150 },
      { x: 2900, y: 150 },
      { x: 3000, y: 150 },
      { x: 3100, y: 150 },

      // Precision jumping challenge
      { x: 3400, y: 100 },
      { x: 3600, y: 200 },
      { x: 3800, y: 300 },
      { x: 4000, y: 200 },

      // Combat arena rewards
      { x: 4300, y: 300 },
      { x: 4400, y: 300 },
      { x: 4500, y: 300 },
      { x: 4600, y: 250 },
      { x: 4700, y: 250 },
      { x: 4800, y: 250 },

      // Precision jumping rewards
      { x: 5000, y: 150 },
      { x: 5200, y: 200 },
      { x: 5400, y: 250 },
      { x: 5600, y: 300 },
      { x: 5800, y: 250 },

      // Puzzle area rewards
      { x: 6100, y: 350 },
      { x: 6300, y: 300 },
      { x: 6500, y: 250 },
      { x: 6700, y: 200 },
      { x: 6900, y: 150 },

      // Final approach spiral pattern
      { x: 7100, y: 300 },
      { x: 7150, y: 270 },
      { x: 7200, y: 240 },
      { x: 7250, y: 210 },
      { x: 7300, y: 180 },
      { x: 7350, y: 210 },
      { x: 7400, y: 240 },
      { x: 7450, y: 270 },
      { x: 7500, y: 300 },

      // Secret areas
      { x: 7000, y: 100 },
      { x: 6200, y: 50 },
      { x: 5300, y: 50 },
      { x: 3900, y: 50 },
      { x: 2400, y: 50 },
    ];

    // Create all coins
    coinPositions.forEach((pos) => {
      const coin = this.collectibles.create(pos.x, pos.y, "coin");
      coin.setData("type", "coin");
      coin.setData("value", 10);
      coin.body.setAllowGravity(false);
    });

    // Set up ammo pickups throughout the level
    const ammoPositions = [
      { x: 500, y: 450 },
      { x: 1200, y: 350 },
      { x: 2000, y: 200 },
      { x: 2600, y: 300 },
      { x: 3200, y: 150 },
      { x: 3800, y: 100 },
      { x: 4500, y: 250 },
      { x: 5300, y: 150 },
      { x: 6000, y: 300 },
      { x: 6800, y: 150 },
      { x: 7500, y: 350 },
    ];

    // Create all ammo pickups
    ammoPositions.forEach((pos) => {
      const ammo = this.ammoPickups.create(pos.x, pos.y, "ammo");
      ammo.setData("type", "ammo");
      if (ammo.body) {
        ammo.body.allowGravity = false;
        ammo.body.immovable = true;
      }

      // Add floating animation
      this.tweens.add({
        targets: ammo,
        y: pos.y - 5,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    // Create health pickups in challenging areas
    const healthPositions = [
      { x: 2300, y: 450 },
      { x: 4000, y: 400 },
      { x: 5500, y: 250 },
      { x: 7000, y: 350 },
    ];

    // Create all health pickups
    healthPositions.forEach((pos) => {
      const health = this.collectibles.create(pos.x, pos.y, "health-pack");
      health.setData("type", "health");
      health.setData("value", 2);
      health.body.setAllowGravity(false);
      health.body.setImmovable(true);
    });

    // Create power-ups in strategic locations
    const powerUpPositions = [
      { x: 3500, y: 100 },
      { x: 6200, y: 150 },
    ];

    // Create all power-ups
    powerUpPositions.forEach((pos) => {
      const powerUp = this.collectibles.create(pos.x, pos.y, "power-up");
      powerUp.setData("type", "power-up");
      powerUp.body.setAllowGravity(false);
      powerUp.body.setImmovable(true);

      // Add a pulsing effect to make power-ups more visible
      this.tweens.add({
        targets: powerUp,
        scale: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    });

    // Add spice collectibles in challenging locations
    const spicePositions = [
      { x: 8200, y: 150 },
      { x: 8800, y: 100 },
      { x: 9500, y: 200 },
      { x: 10200, y: 250 },
      { x: 10800, y: 300 },
    ];

    spicePositions.forEach((pos) => {
      const spice = this.collectibles.create(pos.x, pos.y, "spice");
      spice.setData("type", "spice");
      spice.setData("value", 50);
      spice.body.setAllowGravity(false);

      // Add floating and glowing effect
      this.tweens.add({
        targets: spice,
        y: pos.y - 10,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.tweens.add({
        targets: spice,
        alpha: 0.7,
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
    this.levelExit = this.physics.add.sprite(7800, 470, "exit");
    this.levelExit.setScale(2);
    this.levelExit.setImmovable(true);
    if (this.levelExit.body) {
      (this.levelExit.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    }

    // Visual indicator for the exit
    const light = this.add.pointlight(7800, 470, 0xffffff, 100, 0.5);
    this.tweens.add({
      targets: light,
      intensity: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
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

  protected createTouchControls(): void {
    // Check if touch controls already exist
    if (this.touchControls) {
      // Just update positions if needed
      this.updateTouchControlPositions();
      return;
    }

    const width = this.scale.width;
    const height = this.scale.height;
    const isLandscape = width > height;

    // Calculate button sizes based on screen dimensions
    const minSize = Math.min(width, height);
    const buttonSize = isLandscape ? minSize * 0.15 : minSize * 0.2;
    const buttonAlpha = 0.4;

    // Calculate positions relative to screen dimensions
    const padding = buttonSize * 0.3;
    const baseY = height - padding - buttonSize;

    // Left side controls (movement)
    const leftX = padding + buttonSize;
    const rightX = padding + buttonSize * 2.5;

    // Right side controls (actions)
    const jumpX = width - padding - buttonSize * 2.5;
    const shootX = width - padding - buttonSize;
    const dashX = width - padding - buttonSize * 1.75;
    const dashY = baseY - buttonSize * 1.2;

    // Create buttons with improved visual feedback and larger touch areas
    const createButton = (
      x: number,
      y: number,
      color: number
    ): Phaser.GameObjects.Container => {
      const circle = this.add.circle(0, 0, buttonSize / 2, color, buttonAlpha);
      const hitArea = this.add.circle(0, 0, buttonSize / 1.5, color, 0);
      const container = this.add
        .container(x, y, [hitArea, circle])
        .setScrollFactor(0)
        .setDepth(100)
        .setSize(buttonSize * 1.5, buttonSize * 1.5)
        .setInteractive({ useHandCursor: true });

      // Add visual indicator
      const icon = this.add.circle(0, 0, buttonSize / 6, 0xffffff, 0.3);
      container.add(icon);

      return container;
    };

    // Create controls with proper spacing and visual indicators
    this.touchControls = {
      left: createButton(leftX, baseY, 0x0044ff) as any,
      right: createButton(rightX, baseY, 0x0044ff) as any,
      jump: createButton(jumpX, baseY, 0x00ff44) as any,
      shoot: createButton(shootX, baseY, 0xff4444) as any,
      dash: createButton(dashX, dashY, 0xffff44) as any,
    };

    // Set up touch handlers
    this.setupTouchControlHandlers();
  }

  private updateTouchControlPositions(): void {
    if (!this.touchControls) return;

    const width = this.scale.width;
    const height = this.scale.height;
    const isLandscape = width > height;
    const minSize = Math.min(width, height);
    const buttonSize = isLandscape ? minSize * 0.15 : minSize * 0.2;
    const padding = buttonSize * 0.3;
    const baseY = height - padding - buttonSize;

    // Update positions
    const leftX = padding + buttonSize;
    const rightX = padding + buttonSize * 2.5;
    const jumpX = width - padding - buttonSize * 2.5;
    const shootX = width - padding - buttonSize;
    const dashX = width - padding - buttonSize * 1.75;
    const dashY = baseY - buttonSize * 1.2;

    // Update each control position
    this.touchControls.left.setPosition(leftX, baseY);
    this.touchControls.right.setPosition(rightX, baseY);
    this.touchControls.jump.setPosition(jumpX, baseY);
    this.touchControls.shoot.setPosition(shootX, baseY);
    this.touchControls.dash.setPosition(dashX, dashY);
  }

  private setupTouchControlHandlers(): void {
    const handleTouch = (
      button: Phaser.GameObjects.Container,
      control: string,
      isDown: boolean
    ) => {
      const circle = button.list[1] as Phaser.GameObjects.Arc;
      const icon = button.list[2] as Phaser.GameObjects.Arc;

      if (isDown) {
        // Visual feedback
        this.tweens.add({
          targets: [circle, icon],
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 50,
        });
        circle.setAlpha(0.8);

        // Update control state
        this.registry.set(`virtual${control}`, true);
        this.player.setTouchControlState(control.toLowerCase() as any, true);
      } else {
        // Reset visual state
        this.tweens.add({
          targets: [circle, icon],
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
        circle.setAlpha(0.4);

        // Reset control state
        this.registry.set(`virtual${control}`, false);
        this.player.setTouchControlState(control.toLowerCase() as any, false);
      }
    };

    // Set up each control
    Object.entries(this.touchControls).forEach(([key, button]) => {
      const control = key.charAt(0).toUpperCase() + key.slice(1);

      button.on("pointerdown", () => handleTouch(button, control, true));
      button.on("pointerup", () => handleTouch(button, control, false));
      button.on("pointerout", () => handleTouch(button, control, false));
    });
  }

  // Helper method for safe audio playback
  private playSoundWithFallback(
    key: string,
    config?: Phaser.Types.Sound.SoundConfig
  ): void {
    try {
      if (this.sound.get(key)) {
        this.sound.play(key, config);
      }
    } catch (error) {
      console.warn(`Error playing sound ${key}:`, error);
    }
  }

  update(time: number, delta: number): void {
    // Update player and enemies
    this.player.update(time, delta);

    // Update each enemy
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      enemy.update(time, delta);
    });

    // Update moving platforms
    this.updateMovingPlatforms(delta);

    // Update inputSystem
    this.inputSystem.update(time, delta);

    // Update background parallax
    this.updateBackgrounds(delta);
  }

  // Update moving platforms and their collision effects
  protected updateMovingPlatforms(delta: number): void {
    this.movingPlatforms
      .getChildren()
      .forEach((platform: Phaser.GameObjects.GameObject) => {
        const p = platform as Phaser.Physics.Arcade.Sprite;
        if (!p.body) return;

        const startPos = p.getData("startPosition");
        const distance = p.getData("distance");
        const speed = p.getData("speed");
        const vertical = p.getData("vertical");
        const direction = p.getData("direction");
        const horizontalDistance = p.getData("horizontalDistance");
        const horizontalSpeed = p.getData("horizontalSpeed");
        const horizontalDirection = p.getData("horizontalDirection");

        if (
          !startPos ||
          typeof distance !== "number" ||
          typeof speed !== "number"
        )
          return;

        // Store previous position
        const prevX = p.x;
        const prevY = p.y;

        // Calculate movement
        const velocity = speed * direction;
        const horizontalVelocity = horizontalSpeed
          ? horizontalSpeed * horizontalDirection
          : 0;

        // Apply vertical movement
        if (vertical) {
          // Apply slower movement for vertical platforms
          const smoothFactor = 0.8; // Reduce jerkiness
          p.y += velocity * (delta / 1000) * smoothFactor;

          // Check vertical boundaries
          if (p.y > startPos.y + distance || p.y < startPos.y - distance) {
            p.setData("direction", -direction);

            // If at boundary point, fix position to avoid overshooting
            if (p.y > startPos.y + distance) {
              p.y = startPos.y + distance;
            } else if (p.y < startPos.y - distance) {
              p.y = startPos.y - distance;
            }

            // Slow down at the edges to prevent player from being thrown off
            p.setData("pauseTime", 300); // Short pause at endpoints
          }

          // Apply pause at endpoints
          const pauseTime = p.getData("pauseTime");
          if (pauseTime && pauseTime > 0) {
            p.setData("pauseTime", pauseTime - delta);
            return; // Skip rest of update while paused
          }
        }

        // Apply horizontal movement if platform has horizontal movement
        if (horizontalDistance) {
          p.x += horizontalVelocity * (delta / 1000);

          // Check horizontal boundaries
          if (
            p.x > startPos.x + horizontalDistance ||
            p.x < startPos.x - horizontalDistance
          ) {
            p.setData("horizontalDirection", -horizontalDirection);
          }
        } else if (!vertical) {
          // Regular horizontal movement for non-vertical platforms
          p.x += velocity * (delta / 1000);

          if (p.x > startPos.x + distance || p.x < startPos.x - distance) {
            p.setData("direction", -direction);
          }
        }

        // Update physics body
        p.body.updateFromGameObject();

        // Check if player is standing on this platform
        const isPlayerOnPlatform =
          this.player.body.touching.down && p.body.touching.up;

        // Check if player is clinging to sides (for vertical platforms)
        const isPlayerClingingToSides =
          vertical &&
          ((this.player.body.touching.left && p.body.touching.right) ||
            (this.player.body.touching.right && p.body.touching.left));

        // Move player with platform if they're standing on it
        if (isPlayerOnPlatform) {
          // For all platforms, move player horizontally with platform
          if (horizontalDistance || !vertical) {
            const dx = p.x - prevX;
            this.player.x += dx;
          }

          // For vertical platforms only
          if (vertical) {
            const dy = p.y - prevY;

            // If platform is moving down, move player down with it
            if (dy > 0) {
              this.player.y += dy;
              // Ensure player stays firmly on platform
              this.player.setVelocityY(Math.max(0, velocity));
            }

            // If platform is moving up, move player up with it
            if (dy < 0) {
              this.player.y += dy;
              // Apply slight upward velocity to help player stick
              this.player.setVelocityY(velocity * 0.9);

              // Prevent oscillation by locking player to platform
              const platformTop = p.body.position.y;
              const playerBottom =
                this.player.body.position.y + this.player.body.height;
              if (Math.abs(playerBottom - platformTop) < 10) {
                this.player.body.position.y =
                  platformTop - this.player.body.height;
              }
            }
          }
        }
        // Handle player clinging to sides of vertical platforms
        else if (isPlayerClingingToSides) {
          // Allow player to cling to sides and move with platform
          const dy = p.y - prevY;
          this.player.y += dy;
        }
      });
  }

  // Update background elements with parallax effect
  protected updateBackgrounds(delta: number): void {
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
}
