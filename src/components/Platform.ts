import { Scene, Physics } from "phaser";

export class Platform {
  private platforms: Physics.Arcade.StaticGroup;

  constructor(scene: Scene) {
    this.platforms = scene.physics.add.staticGroup();
    this.createPlatforms();
  }

  private createPlatforms(): void {
    // Main ground
    this.platforms.create(400, 568, "platform-sand").setScale(2).refreshBody();

    // Floating platforms
    const floatingPlatforms = [
      { x: 600, y: 400 },
      { x: 50, y: 250 },
      { x: 750, y: 220 },
    ];

    floatingPlatforms.forEach(({ x, y }) => {
      this.platforms.create(x, y, "platform-sand");
    });
  }

  getGroup(): Physics.Arcade.StaticGroup {
    return this.platforms;
  }
}
