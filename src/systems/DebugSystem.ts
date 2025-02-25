import { GameObjects } from "phaser";
import { ISystem, IScene, IDebugOptions, IPhysicsEntity } from "../types/game";

export class DebugSystem implements ISystem {
  private scene: IScene;
  private container: GameObjects.Container;
  private debugGraphics: GameObjects.Graphics;
  private options: IDebugOptions = {
    showPhysics: false,
    showVelocity: false,
    showFPS: false,
    showColliders: false,
  };
  private fpsText?: GameObjects.Text;
  private visible = false;
  private trackedEntities: Set<IPhysicsEntity> = new Set();

  constructor(scene: IScene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.debugGraphics = scene.add.graphics();

    this.container.setDepth(100);
    this.container.setScrollFactor(0);
    this.container.setVisible(this.visible);

    this.debugGraphics.setScrollFactor(0);
    this.debugGraphics.setDepth(100);
  }

  init(): void {
    this.createDebugMenu();
  }

  addEntity(entity: IPhysicsEntity): void {
    this.trackedEntities.add(entity);
  }

  removeEntity(entity: IPhysicsEntity): void {
    this.trackedEntities.delete(entity);
  }

  private createDebugMenu(): void {
    const padding = 10;
    const startX = this.scene.scale.width - 160;
    const startY = padding;

    // Background
    const menuBg = this.scene.add.rectangle(
      startX - padding,
      startY,
      150,
      140,
      0x000000,
      0.7
    );
    menuBg.setOrigin(0, 0);

    // Title
    const title = this.scene.add.text(
      startX,
      startY,
      "🛠 Debug Menu (` to toggle)",
      {
        fontSize: "16px",
        fontFamily: "monospace",
        color: "#ffffff",
      }
    );

    this.container.add([menuBg, title]);

    // Debug options
    const options = [
      { key: "showPhysics", label: "Show Physics" },
      { key: "showVelocity", label: "Show Velocity" },
      { key: "showFPS", label: "Show FPS" },
      { key: "showColliders", label: "Show Colliders" },
    ] as const;

    options.forEach((option, index) => {
      const y = startY + 30 + index * 25;
      this.createCheckbox(startX, y, option);
    });
  }

  private createCheckbox(
    x: number,
    y: number,
    option: { key: keyof IDebugOptions; label: string }
  ): void {
    const checkboxBg = this.scene.add.rectangle(x, y, 15, 15, 0xffffff, 1);
    checkboxBg.setOrigin(0, 0);
    checkboxBg.setInteractive();

    const checkMark = this.scene.add
      .text(x - 2, y - 4, "✓", {
        fontSize: "16px",
        fontFamily: "monospace",
        color: "#000000",
      })
      .setVisible(this.options[option.key]);

    const label = this.scene.add.text(x + 25, y, option.label, {
      fontSize: "14px",
      fontFamily: "monospace",
      color: "#ffffff",
    });

    this.container.add([checkboxBg, checkMark, label]);

    checkboxBg.on("pointerdown", () => {
      this.options[option.key] = !this.options[option.key];
      checkMark.setVisible(this.options[option.key]);

      if (option.key === "showPhysics") {
        this.scene.physics.world.drawDebug = this.options.showPhysics;
        if (this.options.showPhysics) {
          this.scene.physics.world.createDebugGraphic();
        } else {
          this.scene.physics.world.debugGraphic.clear();
        }
      }
    });
  }

  toggleVisibility(): void {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
  }

  update(): void {
    this.debugGraphics.clear();

    if (this.options.showVelocity) {
      this.trackedEntities.forEach((entity) => {
        const body = entity.getBody() as Phaser.Physics.Arcade.Body;
        if (body.velocity) {
          this.debugGraphics.lineStyle(2, 0x00ff00);
          this.debugGraphics.beginPath();
          this.debugGraphics.moveTo(body.x, body.y);
          this.debugGraphics.lineTo(
            body.x + body.velocity.x / 10,
            body.y + body.velocity.y / 10
          );
          this.debugGraphics.strokePath();
        }
      });
    }

    if (this.options.showFPS) {
      if (!this.fpsText) {
        this.fpsText = this.scene.add
          .text(10, this.scene.scale.height - 30, "", {
            fontSize: "14px",
            fontFamily: "monospace",
            color: "#00ff00",
            backgroundColor: "#000000aa",
          })
          .setScrollFactor(0)
          .setDepth(100);
      }
      this.fpsText.setText(
        `FPS: ${Math.round(this.scene.game.loop.actualFps)}`
      );
      this.fpsText.setVisible(true);
    } else if (this.fpsText) {
      this.fpsText.setVisible(false);
    }
  }

  destroy(): void {
    this.container.destroy();
    this.debugGraphics.destroy();
    this.fpsText?.destroy();
    this.trackedEntities.clear();
  }
}
