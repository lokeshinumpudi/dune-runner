import Phaser from "phaser";

export class DestructibleObject extends Phaser.Physics.Arcade.Sprite {
  private health: number = 2;
  private isDestroyed: boolean = false;

  // Override body property with more specific type
  declare body: Phaser.Physics.Arcade.StaticBody;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "destructible");

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body

    // Set up physics body
    this.body.setSize(28, 24);
    this.body.setOffset(2, 6);

    // Add pulsing animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0.8,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }

  hit(): void {
    if (this.isDestroyed) return;

    this.health--;

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
    });

    // Play hit sound
    this.scene.sound.play("hit", { volume: 0.3 });

    // Check if destroyed
    if (this.health <= 0) {
      this.destroy();
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Create explosion
    const explosion = this.scene.add.sprite(this.x, this.y, "explosion");
    explosion.setScale(1.2);
    explosion.play("explosion");
    explosion.on("animationcomplete", function () {
      explosion.destroy();
    });

    // Play explosion sound
    this.scene.sound.play("explosion", { volume: 0.5 });

    // Disable physics body
    this.body.enable = false;

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        super.destroy();
      },
    });
  }
}
