import { Scene } from "phaser";

export class GameScene extends Scene {
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Temporary colored rectangles for testing
    this.load.image(
      "ground",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAICAYAAAAbQR+gAAAAEklEQVR4AWMgGIyGwGgIjIYAADLYAQUWxZq+AAAAAElFTkSuQmCC"
    );
    this.load.image(
      "player",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFElEQVR4AWMgBqD7T4yhGIQUEAsA8XAC+SxdM7QAAAAASUVORK5CYII="
    );
  }

  create() {
    // Create platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();
    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");

    // Create player
    this.player = this.physics.add.sprite(100, 450, "player");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Add collision
    this.physics.add.collider(this.player, this.platforms);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update() {
    if (!this.cursors || !this.player) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.player.body!.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}
