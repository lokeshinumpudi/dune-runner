import { Scene, Physics, GameObjects, Input } from "phaser";
import {
  IPhysicsEntity,
  IAnimatedEntity,
  InputConfig,
  IInputHandler,
} from "../types/game";

export class Player
  extends GameObjects.Sprite
  implements IPhysicsEntity, IAnimatedEntity, IInputHandler
{
  public declare body: Physics.Arcade.Body;
  private inputConfig: InputConfig;

  // Movement state
  private canDoubleJump = false;
  private isDoubleJumping = false;
  private jumpReleased = true;
  private dashAvailable = true;
  private isDashing = false;

  // Constants
  private readonly SPEED = 160;
  private readonly JUMP_FORCE = -400;
  private readonly DOUBLE_JUMP_FORCE = -350;
  private readonly DASH_VELOCITY = 400;
  private readonly DASH_DURATION = 200;
  private readonly DASH_COOLDOWN = 1000;

  constructor(scene: Scene, x: number, y: number, inputConfig: InputConfig) {
    super(scene, x, y, "player", 4); // Start with the 'turn' frame
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.inputConfig = inputConfig;

    // Setup physics body
    this.body.setGravityY(300);
    this.body.setBounce(0.2);
    this.body.setCollideWorldBounds(true);

    // Setup dash input handler
    this.inputConfig.dash.on("down", this.handleDash, this);
  }

  private handleDash(): void {
    if (!this.dashAvailable || this.isDashing) return;

    this.isDashing = true;
    this.dashAvailable = false;

    const direction = this.flipX ? -1 : 1;
    this.body.setVelocityX(this.DASH_VELOCITY * direction);

    this.scene.time.delayedCall(this.DASH_DURATION, () => {
      this.isDashing = false;
    });

    this.scene.time.delayedCall(this.DASH_COOLDOWN, () => {
      this.dashAvailable = true;
    });
  }

  handleInput(): void {
    const isOnGround = this.body.blocked.down || this.body.touching.down;

    // Reset double jump when landing
    if (isOnGround) {
      this.isDoubleJumping = false;
      this.canDoubleJump = true;
    }

    // Handle horizontal movement
    if (!this.isDashing) {
      if (this.inputConfig.left.isDown) {
        this.body.setVelocityX(-this.SPEED);
        this.playAnimation("left");
        this.setFlipX(true);
      } else if (this.inputConfig.right.isDown) {
        this.body.setVelocityX(this.SPEED);
        this.playAnimation("right");
        this.setFlipX(false);
      } else {
        this.body.setVelocityX(0);
        this.playAnimation("turn");
      }
    }

    // Handle jumping
    if (this.inputConfig.jump.isDown && this.jumpReleased) {
      this.jumpReleased = false;
      if (isOnGround) {
        this.body.setVelocityY(this.JUMP_FORCE);
        this.canDoubleJump = true;
      } else if (this.canDoubleJump && !this.isDoubleJumping) {
        this.body.setVelocityY(this.DOUBLE_JUMP_FORCE);
        this.isDoubleJumping = true;
        this.canDoubleJump = false;
      }
    }

    if (this.inputConfig.jump.isUp) {
      this.jumpReleased = true;
    }
  }

  update(): void {
    // No need for input handling here anymore as it's moved to handleInput
  }

  playAnimation(key: string, ignoreIfPlaying: boolean = true): void {
    this.play(key, ignoreIfPlaying);
  }

  getBody(): Physics.Arcade.Body {
    return this.body;
  }

  destroy(): void {
    this.inputConfig.dash.off("down", this.handleDash, this);
    super.destroy();
  }
}
