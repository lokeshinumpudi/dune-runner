import { DesertScene } from "./DesertScene";

export class Level2Scene extends DesertScene {
  constructor() {
    super({ key: "Level2Scene" });
    this.levelNumber = 2;
    this.difficulty = "hard";
  }

  create(): void {
    // Call parent create method
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
  }

  private addMoreEnemies(): void {
    // Add additional enemies for level 2
    const enemyPositions = [
      { x: 800, y: 350 },
      { x: 1400, y: 200 },
      { x: 2000, y: 50 },
      { x: 2600, y: 150 },
      { x: 3200, y: 300 },
      { x: 3700, y: 200 },
      { x: 4200, y: 100 },
      { x: 4700, y: 150 },
      { x: 5200, y: 250 },
    ];

    enemyPositions.forEach((pos) => {
      const enemy = new (this.enemies.getChildren()[0].constructor as any)(
        this,
        pos.x,
        pos.y
      );
      enemy.setPlayer(this.player);

      // Make level 2 enemies stronger
      enemy.health = 5;
      enemy.moveSpeed = 120;
      enemy.setTint(0xff5500);

      this.enemies.add(enemy);
    });
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
      const ammo = this.ammoPickups.create(pos.x, pos.y, "ammo");
      ammo.setData("type", "ammo");
      ammo.body.setAllowGravity(false);
      ammo.body.setImmovable(true);

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
  }

  // Override the level exit check
  update(time: number, delta: number): void {
    super.update(time, delta);

    // Check if player has reached the end of the level
    if (this.player.x > 5800 && !this.levelComplete) {
      this.levelComplete = true;
      this.completeLevel();
    }
  }

  private completeLevel(): void {
    // Stop player movement
    this.player.setVelocity(0, 0);

    // Calculate time elapsed
    const timeElapsed = this.time.now;

    // Launch level complete scene
    this.scene.launch("LevelCompleteScene", {
      levelNumber: this.levelNumber,
      score: this.registry.get("score"),
      timeElapsed: timeElapsed,
    });

    // Pause this scene
    this.scene.pause();
  }
}
