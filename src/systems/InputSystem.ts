import { Input } from "phaser";
import { ISystem, InputConfig, IScene } from "../types/game";
import { IInputHandler } from "../interfaces/IInputHandler";

export class InputSystem implements ISystem {
  private scene: IScene;
  private inputConfig: InputConfig;
  private inputHandlers: Set<{ handleInput: () => void }>;
  private handlers: IInputHandler[] = [];

  constructor(scene: IScene) {
    this.scene = scene;
    this.inputHandlers = new Set();
    this.inputConfig = {
      jump: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.SPACE),
      left: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.LEFT),
      right: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.RIGHT),
      dash: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.SHIFT),
      debug: scene.input.keyboard!.addKey(Input.Keyboard.KeyCodes.BACKTICK),
    };
  }

  init(): void {}

  addInputHandler(handler: { handleInput: () => void }): void {
    this.inputHandlers.add(handler);
  }

  removeInputHandler(handler: { handleInput: () => void }): void {
    this.inputHandlers.delete(handler);
  }

  getInput(): InputConfig {
    return this.inputConfig;
  }

  update(time: number = 0, delta: number = 0): void {
    // Process legacy input handlers
    this.inputHandlers.forEach((handler) => handler.handleInput());

    // Process typed input handlers
    this.handlers.forEach((handler) => {
      handler.handleInput(time, delta);
    });
  }

  destroy(): void {
    Object.values(this.inputConfig).forEach((key) => key.destroy());
    this.inputHandlers.clear();
  }

  addHandler(handler: IInputHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handler: IInputHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index !== -1) {
      this.handlers.splice(index, 1);
    }
  }
}
