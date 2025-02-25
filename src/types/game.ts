import { Scene, Types, Physics, GameObjects } from "phaser";

export interface IGameEntity {
  update(): void;
  destroy(): void;
}

export interface IPhysicsEntity extends IGameEntity {
  getBody(): Physics.Arcade.Body | Physics.Arcade.StaticBody;
}

export interface IAnimatedEntity extends IGameEntity {
  playAnimation(key: string, ignoreIfPlaying?: boolean): void;
}

export interface IInputHandler {
  handleInput(): void;
}

export interface ISystem {
  init(): void;
  update(): void;
  destroy(): void;
}

export interface IScene extends Scene {
  systems: Map<string, ISystem>;
  addSystem(key: string, system: ISystem): void;
  removeSystem(key: string): void;
}

export type Vector2 = { x: number; y: number };

export type CollisionGroup = Physics.Arcade.StaticGroup | Physics.Arcade.Group;

export interface IDebugOptions {
  showPhysics: boolean;
  showVelocity: boolean;
  showFPS: boolean;
  showColliders: boolean;
}

export type InputConfig = {
  jump: Types.Input.Keyboard.Key;
  left: Types.Input.Keyboard.Key;
  right: Types.Input.Keyboard.Key;
  dash: Types.Input.Keyboard.Key;
  debug: Types.Input.Keyboard.Key;
};
