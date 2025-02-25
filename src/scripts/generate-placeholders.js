function generateEnemySprite() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Create a spritesheet with 6 frames (4 for walking, 2 for hit)
  canvas.width = 32 * 6;
  canvas.height = 48;
  
  // Define colors
  const colors = {
    body: '#990000',
    armor: '#660000',
    eyes: '#ffff00',
    accent: '#ff3300',
    jetpack: '#333333',
    highlight: '#ff9900'
  };
  
  // Create 6 frames (4 for walking, 2 for hit)
  for (let frame = 0; frame < 6; frame++) {
    // Calculate x position for current frame
    const frameX = frame * 32;
    
    // Draw body
    ctx.fillStyle = colors.body;
    ctx.fillRect(frameX + 4, 8, 24, 32);
    
    // Draw armor plates
    ctx.fillStyle = colors.armor;
    ctx.fillRect(frameX + 4, 8, 24, 8);  // Helmet
    ctx.fillRect(frameX + 4, 24, 24, 8); // Chest plate
    
    // Draw jetpack/backpack
    ctx.fillStyle = colors.jetpack;
    ctx.fillRect(frameX + 2, 16, 4, 16);
    
    // Draw eyes
    ctx.fillStyle = colors.eyes;
    
    // For hit frames, make angry eyes
    if (frame >= 4) {
      ctx.fillRect(frameX + 10, 12, 4, 2); // Left eye
      ctx.fillRect(frameX + 18, 12, 4, 2); // Right eye
    } else {
      ctx.fillRect(frameX + 10, 12, 4, 4); // Left eye
      ctx.fillRect(frameX + 18, 12, 4, 4); // Right eye
    }
    
    // Draw accent lines
    ctx.fillStyle = colors.accent;
    ctx.fillRect(frameX + 4, 36, 24, 2); // Belt
    
    // Draw weapon
    ctx.fillStyle = colors.highlight;
    ctx.fillRect(frameX + 24, 20, 8, 4);
    
    // Animation for walking frames (0-3)
    if (frame < 4) {
      // Leg animation
      const legOffset = [0, 2, 0, -2][frame];
      ctx.fillStyle = colors.armor;
      ctx.fillRect(frameX + 8, 40 + legOffset, 6, 8);  // Left leg
      ctx.fillRect(frameX + 18, 40 - legOffset, 6, 8); // Right leg
      
      // Arm animation
      const armOffset = [0, 1, 0, -1][frame];
      ctx.fillRect(frameX + 2, 20 + armOffset, 4, 8);  // Left arm
      ctx.fillRect(frameX + 26, 20 - armOffset, 4, 8); // Right arm
    } else {
      // Hit animation frames (4-5)
      ctx.fillStyle = colors.armor;
      ctx.fillRect(frameX + 8, 40, 6, 8);  // Left leg
      ctx.fillRect(frameX + 18, 40, 6, 8); // Right leg
      ctx.fillRect(frameX + 2, 20, 4, 8);  // Left arm
      ctx.fillRect(frameX + 26, 20, 4, 8); // Right arm
      
      // Flash effect for hit
      if (frame === 4) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(frameX, 0, 32, 48);
      }
    }
  }
  
  return canvas;
}

// Export the main function
export function generatePlaceholders() {
  // Create canvas for player sprite
  const playerSprite = generatePlayerSprite();
  saveCanvasToFile(playerSprite, 'player.png');
  
  // Generate enemy sprite
  const enemySprite = generateEnemySprite();
  saveCanvasToFile(enemySprite, 'enemy.png');
  
  // Create canvas for platform
  const platformCanvas = generatePlatformSprite();
  saveCanvasToFile(platformCanvas, 'platform-sand.png');
  
  // Create canvas for bullet
  const bulletCanvas = generateBulletSprite();
  saveCanvasToFile(bulletCanvas, 'bullet.png');
  
  // Create canvas for gun
  const gunCanvas = generateGunSprite();
  saveCanvasToFile(gunCanvas, 'gun.png');
  
  // Create canvas for muzzle flash
  const muzzleFlashCanvas = generateMuzzleFlashSprite();
  saveCanvasToFile(muzzleFlashCanvas, 'muzzle-flash.png');
  
  // Create canvas for destructible object
  const destructibleCanvas = generateDestructibleSprite();
  saveCanvasToFile(destructibleCanvas, 'destructible.png');
  
  // Create canvas for explosion
  const explosionCanvas = generateExplosionSprite();
  saveCanvasToFile(explosionCanvas, 'explosion.png');
  
  // Create background images
  const skyCanvas = generateSkyBackground();
  saveCanvasToFile(skyCanvas, 'sky.png');
  
  const dunesFarCanvas = generateDunesFarBackground();
  saveCanvasToFile(dunesFarCanvas, 'dunes-far.png');
  
  const dunesNearCanvas = generateDunesNearBackground();
  saveCanvasToFile(dunesNearCanvas, 'dunes-near.png');
  
  const groundSandCanvas = generateGroundSandBackground();
  saveCanvasToFile(groundSandCanvas, 'ground-sand.png');
  
  console.log('Placeholder sprites generated successfully!');
} 