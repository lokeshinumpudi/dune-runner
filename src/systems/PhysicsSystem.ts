import { Physics } from "phaser";
import { ISystem, IScene, IPhysicsEntity, CollisionGroup } from "../types/game";

export class PhysicsSystem implements ISystem {
  private scene: IScene;
  private entities: Set<IPhysicsEntity>;
  private collisionGroups: Map<string, CollisionGroup>;

  constructor(scene: IScene) {
    this.scene = scene;
    this.entities = new Set();
    this.collisionGroups = new Map();
  }

  init(): void {}

  addEntity(entity: IPhysicsEntity): void {
    this.entities.add(entity);
  }

  removeEntity(entity: IPhysicsEntity): void {
    this.entities.delete(entity);
  }

  addCollisionGroup(key: string, group: CollisionGroup): void {
    this.collisionGroups.set(key, group);
  }

  getCollisionGroup(key: string): CollisionGroup | undefined {
    return this.collisionGroups.get(key);
  }

  addCollider(
    entity: IPhysicsEntity,
    groupKey: string,
    callback?: Physics.Arcade.ArcadePhysicsCallback
  ): void {
    const group = this.collisionGroups.get(groupKey);
    if (group) {
      this.scene.physics.add.collider(entity.getBody(), group, callback);
    }
  }

  update(): void {
    this.entities.forEach((entity) => entity.update());
  }

  destroy(): void {
    this.entities.clear();
    this.collisionGroups.clear();
  }
}
