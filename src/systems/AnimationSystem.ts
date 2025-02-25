import { ISystem, IScene, IAnimatedEntity } from "../types/game";

export class AnimationSystem implements ISystem {
  private scene: IScene;
  private entities: Set<IAnimatedEntity>;

  constructor(scene: IScene) {
    this.scene = scene;
    this.entities = new Set();
  }

  init(): void {
    // Create player animations
    this.createPlayerAnimations();
  }

  addEntity(entity: IAnimatedEntity): void {
    this.entities.add(entity);
  }

  removeEntity(entity: IAnimatedEntity): void {
    this.entities.delete(entity);
  }

  private createPlayerAnimations(): void {
    if (!this.scene.anims.exists("left")) {
      this.scene.anims.create({
        key: "left",
        frames: this.scene.anims.generateFrameNumbers("player", {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists("turn")) {
      this.scene.anims.create({
        key: "turn",
        frames: [{ key: "player", frame: 4 }],
        frameRate: 20,
      });
    }

    if (!this.scene.anims.exists("right")) {
      this.scene.anims.create({
        key: "right",
        frames: this.scene.anims.generateFrameNumbers("player", {
          start: 5,
          end: 8,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  update(): void {
    this.entities.forEach((entity) => entity.update());
  }

  destroy(): void {
    this.entities.clear();
  }
}
