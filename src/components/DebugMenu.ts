import { Scene, GameObjects } from "phaser";

interface DebugOptions {
  showPhysics: boolean;
  showVelocity: boolean;
  showFPS: boolean;
}

export class DebugMenu {
  private scene: Scene;
  private container: GameObjects.Container;
  private debugGraphics: GameObjects.Graphics;
  private options: DebugOptions = {
    showPhysics: false,
    showVelocity: false,
    showFPS: false,
  };
  private fpsText?: GameObjects.Text;
  private visible = false;

  constructor(scene: Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.debugGraphics = scene.add.graphics();

    this.container.setDepth(100);
    this.container.setScrollFactor(0);
    this.container.setVisible(this.visible);

    this.debugGraphics.setScrollFactor(0);
    this.debugGraphics.setDepth(100);

    this.createMenu();
    this.setupToggleKey();
  }

  private createMenu(): void {
    const padding = 10;
    const startX = this.scene.scale.width - 160;
    const startY = padding;

    // Background
    const menuBg = this.scene.add.rectangle(
      startX - padding,
      startY,
      150,
      120,
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
    const options: Array<{ key: keyof DebugOptions; label: string }> = [
      { key: "showPhysics", label: "Show Physics" },
      { key: "showVelocity", label: "Show Velocity" },
      { key: "showFPS", label: "Show FPS" },
    ];

    options.forEach((option, index) => {
      const y = startY + 30 + index * 25;
      this.createCheckbox(startX, y, option);
    });
  }

  private createCheckbox(
    x: number,
    y: number,
    option: { key: keyof DebugOptions; label: string }
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

  private setupToggleKey(): void {
    this.scene.input.keyboard
      .addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK)
      .on("down", () => {
        this.visible = !this.visible;
        this.container.setVisible(this.visible);
      });
  }

  update(player: Phaser.Physics.Arcade.Sprite): void {
    this.debugGraphics.clear();

    if (this.options.showVelocity) {
      const body = player.body as Phaser.Physics.Arcade.Body;
      this.debugGraphics.lineStyle(2, 0x00ff00);
      this.debugGraphics.beginPath();
      this.debugGraphics.moveTo(player.x, player.y);
      this.debugGraphics.lineTo(
        player.x + body.velocity.x / 10,
        player.y + body.velocity.y / 10
      );
      this.debugGraphics.strokePath();
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
}
