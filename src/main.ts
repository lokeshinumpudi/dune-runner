import { Game } from "phaser";
import { GameConfig } from "./config/GameConfig";
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { OptionsScene } from "./scenes/OptionsScene";
import { CreditsScene } from "./scenes/CreditsScene";
import { DesertScene } from "./scenes/DesertScene";
import { Level2Scene } from "./scenes/Level2Scene";
import { LevelCompleteScene } from "./scenes/LevelCompleteScene";

const game = new Game({
  ...GameConfig,
  scene: [
    PreloadScene,
    MenuScene,
    OptionsScene,
    CreditsScene,
    DesertScene,
    Level2Scene,
    LevelCompleteScene,
  ],
});

// Handle window resize
window.addEventListener("resize", () => {
  game.scale.refresh();
});
