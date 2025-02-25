# Game Assets

This directory contains all the assets used in the game.

## Directory Structure

- `backgrounds/` - Background images for the game scenes
- `sprites/` - Character, enemy, and object sprites
- `sounds/` - Sound effects and music
- `particles/` - Particle effect textures

## Asset Generation

Most assets are procedurally generated using the scripts in the `scripts/` directory:

- `scripts/generate-placeholders.js` - Generates sprite and background images
- `scripts/generate-sounds.js` - Generates sound effects

To regenerate all assets, run:

```bash
node scripts/generate-placeholders.js
node scripts/generate-sounds.js
```

## Asset Usage

Assets are loaded in the game scenes using Phaser's loader:

```typescript
// Example from DesertScene.ts
this.load.image("sky", "assets/backgrounds/sky.png");
this.load.spritesheet("player", "assets/sprites/player.png", {
  frameWidth: 32,
  frameHeight: 48,
});
this.load.audio("shoot", "assets/sounds/shoot.wav");
```

## Notes

- All paths are relative to the `public/` directory
- The `assets/` directory is copied to the build output during production builds
- Custom assets can be added directly to these directories, but be careful not to overwrite them when regenerating assets
