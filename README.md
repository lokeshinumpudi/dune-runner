# Dune Platformer

A sci-fi platformer game set in a desert environment, built with Phaser 3 and TypeScript.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd dune-platformer

# Install dependencies
npm install
# or
yarn
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The game will be available at http://localhost:5173

## Asset Management

All game assets are stored in the `public/assets` directory and are loaded from there at runtime. Many assets are procedurally generated using scripts.

### Asset Scripts

```bash
# List all assets
npm run assets:list

# Generate all assets
npm run assets:generate

# Clean all assets
npm run assets:clean

# Regenerate all assets (clean + generate)
npm run assets:regenerate
```

## Building for Production

```bash
# Build for production
npm run build
# or
yarn build

# Preview the production build
npm run preview
# or
yarn preview
```

## Project Structure

- `public/` - Static assets and HTML entry point
  - `assets/` - Game assets (sprites, sounds, backgrounds, etc.)
- `src/` - Source code
  - `objects/` - Game object classes (Player, Enemy, etc.)
  - `scenes/` - Phaser scene classes
  - `systems/` - Game systems (Input, Physics, etc.)
  - `interfaces/` - TypeScript interfaces
- `scripts/` - Asset generation and management scripts

## License

This project is licensed under the MIT License - see the LICENSE file for details.
