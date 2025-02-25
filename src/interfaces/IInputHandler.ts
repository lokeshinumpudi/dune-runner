/**
 * Interface for objects that can handle input in the game.
 * This is used by the InputSystem to manage multiple input handlers.
 */
export interface IInputHandler {
  /**
   * Handle input for this object.
   * @param time The current time.
   * @param delta The time delta since the last update.
   */
  handleInput(time: number, delta: number): void;
}
