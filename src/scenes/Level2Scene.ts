import { DesertScene } from "./DesertScene";

export class Level2Scene extends DesertScene {
  constructor() {
    super({ key: "Level2Scene" });
    this.levelNumber = 2;
    this.difficulty = "hard";
  }

  create(): void {
    // Call parent create method (ensure all base properties are initialized)
    super.create();

    // Override title
    const width = this.cameras.main.width;
    const levelText = this.add
      .text(width - 20, 80, "LEVEL 2", {
        fontFamily: "Arial Black",
        fontSize: "24px",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);

    try {
      // Add more enemies for level 2
      this.addMoreEnemies();

      // Add more collectibles
      this.addMoreCollectibles();

      // Modify player starting position
      this.player.setPosition(100, 100);

      // Add a welcome message
      const welcomeText = this.add
        .text(width / 2, 100, "Welcome to Level 2!", {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100);

      // Fade out welcome message
      this.tweens.add({
        targets: welcomeText,
        alpha: 0,
        duration: 3000,
        delay: 2000,
        onComplete: () => welcomeText.destroy(),
      });
    } catch (error) {
      console.error("Error in Level2Scene.create:", error);
    }
  }

  private addMoreEnemies(): void {
    // Add additional enemies for level 2
    const enemyPositions = [
      { x: 800, y: 350, type: "basic" },
      { x: 1400, y: 200, type: "harkonnen" },
      { x: 2000, y: 50, type: "ornithopter" },
      { x: 2600, y: 150, type: "harkonnen" },
      { x: 3200, y: 300, type: "basic" },
      { x: 3700, y: 200, type: "ornithopter" },
      { x: 4200, y: 100, type: "sandworm" },
      { x: 4700, y: 150, type: "harkonnen" },
      { x: 5200, y: 250, type: "ornithopter" },
    ];

    // Import enemy classes safely
    try {
      // Get references to enemy classes
      const HarkonnenEnemy = require("../objects/HarkonnenEnemy").default;
      const OrnithopterEnemy = require("../objects/OrnithopterEnemy").default;
      const SandwormEnemy = require("../objects/SandwormEnemy").default;
      const Enemy = require("../objects/Enemy").default;

      enemyPositions.forEach((pos) => {
        let enemy;

        // Create the appropriate enemy type
        switch (pos.type) {
          case "harkonnen":
            enemy = new HarkonnenEnemy(this, pos.x, pos.y, 200, 80);
            break;
          case "ornithopter":
            enemy = new OrnithopterEnemy(this, pos.x, pos.y, 300, 100);
            break;
          case "sandworm":
            enemy = new SandwormEnemy(this, pos.x, pos.y, 400, 60);
            break;
          default:
            enemy = new Enemy(this, pos.x, pos.y, 200, 70);
        }

        // Make level 2 enemies stronger
        enemy.health = 5;
        enemy.setTint(0xff5500);

        this.enemies.add(enemy);
      });
    } catch (error) {
      console.error("Error creating enemies:", error);
    }
  }

  private addMoreCollectibles(): void {
    // Add more ammo pickups for level 2
    const ammoPositions = [
      { x: 700, y: 500 },
      { x: 1600, y: 300 },
      { x: 2500, y: 200 },
      { x: 3300, y: 300 },
      { x: 4100, y: 150 },
      { x: 4900, y: 100 },
      { x: 5600, y: 250 },
    ];

    ammoPositions.forEach((pos) => {
      try {
        const ammo = this.ammoPickups.create(pos.x, pos.y, "ammo");
        ammo.setData("type", "ammo");
        if (ammo.body) {
          ammo.body.setAllowGravity(false);
          ammo.body.setImmovable(true);
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
      } catch (error) {
        console.error("Error creating ammo:", error);
      }
    });
  }

  // Override the level exit check
  update(time: number, delta: number): void {
    try {
      super.update(time, delta);

      // Check if player has reached the end of the level
      if (this.player && this.player.x > 5800 && !this.levelComplete) {
        this.levelComplete = true;
        this.completeLevel();
      }
    } catch (error) {
      console.error("Error in Level2Scene.update:", error);
    }
  }

  // Override parent method for safety
  protected completeLevel(): void {
    try {
      // Stop player movement
      if (this.player) {
        this.player.setVelocity(0, 0);
      }

      // Calculate time elapsed
      const timeElapsed = this.time.now - this.startTime;

      // Launch level complete scene
      this.scene.launch("LevelCompleteScene", {
        levelNumber: this.levelNumber,
        score: this.registry.get("score") || 0,
        timeElapsed: timeElapsed,
      });

      // Pause this scene
      this.scene.pause();
    } catch (error) {
      console.error("Error completing level:", error);
      // Try to gracefully recover
      this.scene.start("MenuScene");
    }
  }
}
