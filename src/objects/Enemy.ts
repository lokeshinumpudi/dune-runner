import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected health: number = 1;
  protected startX: number;
  protected patrol: number;
  protected speed: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrol: number,
    speed: number
  ) {
    super(scene, x, y, "enemy");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.startX = x;
    this.patrol = patrol;
    this.speed = speed;

    // Set up physics
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0);
  }

  update(time: number, delta: number): void {
    // Basic patrol movement
    this.x += this.speed * (delta / 1000);

    // Keep within patrol bounds
    if (this.x > this.startX + this.patrol) {
      this.x = this.startX + this.patrol;
      this.speed = -Math.abs(this.speed);
    } else if (this.x < this.startX - this.patrol) {
      this.x = this.startX - this.patrol;
      this.speed = Math.abs(this.speed);
    }

    // Flip sprite based on direction
    this.flipX = this.speed < 0;
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }
}
