import Phaser from "phaser";
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { DesertScene } from "./scenes/DesertScene";
import { Level2Scene } from "./scenes/Level2Scene";
import { LevelCompleteScene } from "./scenes/LevelCompleteScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { CreditsScene } from "./scenes/CreditsScene";
import { OptionsScene } from "./scenes/OptionsScene";

// Function to determine game dimensions based on device
function getGameDimensions() {
  // Base dimensions - 16:9 aspect ratio
  const baseWidth = 1280;
  const baseHeight = 720;

  // Get current screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Calculate dimensions maintaining aspect ratio
  let width = baseWidth;
  let height = baseHeight;

  // Scale down if screen is smaller than base dimensions
  if (screenWidth < baseWidth || screenHeight < baseHeight) {
    const scaleWidth = screenWidth / baseWidth;
    const scaleHeight = screenHeight / baseHeight;
    const scale = Math.min(scaleWidth, scaleHeight);

    width = Math.floor(baseWidth * scale);
    height = Math.floor(baseHeight * scale);
  }

  return { width, height };
}

const dimensions = getGameDimensions();

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: dimensions.width,
  height: dimensions.height,
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: dimensions.width,
    height: dimensions.height,
    min: {
      width: 480,
      height: 270,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    activePointers: 4,
    gamepad: false,
  },
  pixelArt: true,
  roundPixels: true,
  scene: [
    PreloadScene,
    MenuScene,
    DesertScene,
    Level2Scene,
    LevelCompleteScene,
    GameOverScene,
    CreditsScene,
    OptionsScene,
  ],
  callbacks: {
    postBoot: (game) => {
      if (typeof window !== "undefined") {
        // Handle orientation changes
        window.addEventListener("orientationchange", () => {
          setTimeout(() => {
            const newDimensions = getGameDimensions();
            game.scale.resize(newDimensions.width, newDimensions.height);
            game.scale.refresh();
          }, 200);
        });

        // Handle window resizing
        let resizeTimeout: number;
        window.addEventListener("resize", () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            const newDimensions = getGameDimensions();
            game.scale.resize(newDimensions.width, newDimensions.height);
            game.scale.refresh();
          }, 200);
        });
      }
    },
  },
};

// Create the game instance
new Phaser.Game(config);
