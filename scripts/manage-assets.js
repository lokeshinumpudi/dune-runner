import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Asset directories
const ASSETS_DIR = 'public/assets';
const BACKGROUNDS_DIR = `${ASSETS_DIR}/backgrounds`;
const SPRITES_DIR = `${ASSETS_DIR}/sprites`;
const SOUNDS_DIR = `${ASSETS_DIR}/sounds`;
const PARTICLES_DIR = `${ASSETS_DIR}/particles`;

// Ensure directories exist
[ASSETS_DIR, BACKGROUNDS_DIR, SPRITES_DIR, SOUNDS_DIR, PARTICLES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Clean assets (remove all files in the assets directory)
async function cleanAssets() {
  console.log('Cleaning assets...');
  
  // Don't delete the README.md file
  const directories = [BACKGROUNDS_DIR, SPRITES_DIR, SOUNDS_DIR, PARTICLES_DIR];
  
  for (const dir of directories) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file !== 'README.md') {
        fs.unlinkSync(path.join(dir, file));
      }
    }
  }
  
  console.log('Assets cleaned.');
}

// Generate assets
async function generateAssets() {
  console.log('Generating assets...');
  
  try {
    // Run the placeholder generator
    console.log('Generating sprites and backgrounds...');
    await execAsync('node scripts/generate-placeholders.js');
    
    // Run the improved audio generator instead of the old sound generator
    console.log('Generating audio assets with ffmpeg...');
    await execAsync('node scripts/generate-audio-assets.js');
    
    console.log('Assets generated successfully.');
  } catch (error) {
    console.error('Error generating assets:', error);
  }
}

// List all assets
function listAssets() {
  console.log('Listing assets:');
  
  const directories = [BACKGROUNDS_DIR, SPRITES_DIR, SOUNDS_DIR, PARTICLES_DIR];
  
  for (const dir of directories) {
    const dirName = path.basename(dir);
    const files = fs.readdirSync(dir);
    
    console.log(`\n${dirName}/ (${files.length} files):`);
    files.forEach(file => {
      if (file !== 'README.md') {
        const stats = fs.statSync(path.join(dir, file));
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`  - ${file} (${sizeKB} KB)`);
      }
    });
  }
}

// Main function
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'clean':
      await cleanAssets();
      break;
    case 'generate':
      await generateAssets();
      break;
    case 'regenerate':
      await cleanAssets();
      await generateAssets();
      break;
    case 'list':
      listAssets();
      break;
    default:
      console.log(`
Asset Management Utility

Usage:
  node scripts/manage-assets.js [command]

Commands:
  clean       - Remove all generated assets
  generate    - Generate all assets
  regenerate  - Clean and regenerate all assets
  list        - List all assets
`);
  }
}

main().catch(console.error); 