import { Scene } from "phaser";
import { IScene, ISystem } from "../types/game";

export class BaseScene extends Scene implements IScene {
  systems: Map<string, ISystem> = new Map();

  addSystem(key: string, system: ISystem): void {
    this.systems.set(key, system);
    system.init();
  }

  removeSystem(key: string): void {
    const system = this.systems.get(key);
    if (system) {
      system.destroy();
      this.systems.delete(key);
    }
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    this.systems.forEach((system) => system.update());
  }

  destroy(): void {
    this.systems.forEach((system) => system.destroy());
    this.systems.clear();
    super.destroy();
  }
}
