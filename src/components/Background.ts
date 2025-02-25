import { Scene, GameObjects } from "phaser";

export class Background {
  private layers: GameObjects.TileSprite[] = [];
  private readonly parallaxFactors = [0.1, 0.2];

  constructor(scene: Scene) {
    const { width, height } = scene.scale;

    // Static sky background
    scene.add.image(0, 0, "bg-sky").setOrigin(0, 0).setScrollFactor(0);

    // Parallax dune layers
    this.layers.push(
      scene.add
        .tileSprite(0, 0, width, height, "bg-dunes-far")
        .setOrigin(0, 0)
        .setScrollFactor(0)
    );

    this.layers.push(
      scene.add
        .tileSprite(0, 0, width, height, "bg-dunes-near")
        .setOrigin(0, 0)
        .setScrollFactor(0)
    );
  }

  update(playerX: number): void {
    this.layers.forEach((layer, index) => {
      layer.tilePositionX = playerX * this.parallaxFactors[index];
    });
  }
}
