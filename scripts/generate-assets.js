const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Ensure directories exist
const spritesDir = path.join(__dirname, '../public/assets/sprites');
if (!fs.existsSync(spritesDir)) {
  fs.mkdirSync(spritesDir, { recursive: true });
}

// Generate an ornithopter sprite (flying machine)
function generateOrnithopterSprite() {
  const frameWidth = 96;
  const frameHeight = 48;
  const framesCount = 4;
  
  const canvas = createCanvas(frameWidth * framesCount, frameHeight);
  const ctx = canvas.getContext('2d');
  
  // Base colors for Dune ornithopter
  const bodyColor = '#8B4513'; // Brown
  const wingColor = '#D2B48C'; // Tan
  const highlightColor = '#F5DEB3'; // Wheat
  const shadowColor = '#654321'; // Dark brown
  
  for (let frame = 0; frame < framesCount; frame++) {
    const x = frame * frameWidth;
    
    // Clear background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Draw body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(x + frameWidth/2, frameHeight/2, frameWidth/4, frameHeight/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw cockpit
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.ellipse(x + frameWidth/2 + 10, frameHeight/2, frameWidth/8, frameHeight/6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw wings with different positions based on frame
    ctx.fillStyle = wingColor;
    const wingAngle = Math.sin(frame * Math.PI/2) * 0.3;
    
    // Left wing
    ctx.save();
    ctx.translate(x + frameWidth/2, frameHeight/2);
    ctx.rotate(-Math.PI/4 - wingAngle);
    ctx.fillRect(-frameWidth/3, -2, frameWidth/2, 4);
    ctx.restore();
    
    // Right wing
    ctx.save();
    ctx.translate(x + frameWidth/2, frameHeight/2);
    ctx.rotate(Math.PI/4 + wingAngle);
    ctx.fillRect(-frameWidth/3, -2, frameWidth/2, 4);
    ctx.restore();
    
    // Draw tail
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.moveTo(x + frameWidth/2 - 15, frameHeight/2);
    ctx.lineTo(x + frameWidth/2 - 30, frameHeight/2 - 5);
    ctx.lineTo(x + frameWidth/2 - 30, frameHeight/2 + 5);
    ctx.closePath();
    ctx.fill();
    
    // Add detail lines
    ctx.strokeStyle = shadowColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + frameWidth/2 + 10, frameHeight/2 - 5);
    ctx.lineTo(x + frameWidth/2 + 20, frameHeight/2);
    ctx.lineTo(x + frameWidth/2 + 10, frameHeight/2 + 5);
    ctx.stroke();
  }
  
  // Save the sprite sheet
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(spritesDir, 'ornithopter.png'), buffer);
  console.log('Generated ornithopter.png');
}

// Generate a Harkonnen enemy sprite (soldier)
function generateHarkonnenSprite() {
  const frameWidth = 48;
  const frameHeight = 48;
  const framesCount = 4;
  
  const canvas = createCanvas(frameWidth * framesCount, frameHeight);
  const ctx = canvas.getContext('2d');
  
  // Harkonnen colors
  const uniformColor = '#800000'; // Dark red
  const skinColor = '#FFE4C4'; // Bisque
  const armorColor = '#696969'; // Dim gray
  
  for (let frame = 0; frame < framesCount; frame++) {
    const x = frame * frameWidth;
    
    // Clear background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Draw body with slight animation
    const bodyOffset = Math.sin(frame * Math.PI/2) * 2;
    
    // Draw legs
    ctx.fillStyle = uniformColor;
    // Left leg
    ctx.fillRect(x + frameWidth/2 - 7, frameHeight/2 + 5 + bodyOffset, 4, 15);
    // Right leg
    ctx.fillRect(x + frameWidth/2 + 3, frameHeight/2 + 5 - bodyOffset, 4, 15);
    
    // Draw body
    ctx.fillStyle = uniformColor;
    ctx.fillRect(x + frameWidth/2 - 8, frameHeight/2 - 10, 16, 20);
    
    // Draw armor
    ctx.fillStyle = armorColor;
    ctx.fillRect(x + frameWidth/2 - 9, frameHeight/2 - 5, 18, 10);
    
    // Draw head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(x + frameWidth/2, frameHeight/2 - 15, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw helmet
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.arc(x + frameWidth/2, frameHeight/2 - 17, 7, 0, Math.PI);
    ctx.fill();
    
    // Draw arms
    const armOffset = Math.sin(frame * Math.PI/2) * 3;
    
    ctx.fillStyle = uniformColor;
    // Left arm
    ctx.fillRect(x + frameWidth/2 - 12, frameHeight/2 - 5 + armOffset, 4, 10);
    // Right arm
    ctx.fillRect(x + frameWidth/2 + 8, frameHeight/2 - 5 - armOffset, 4, 10);
    
    // Draw weapon
    if (frame % 2 === 0) {
      ctx.fillStyle = '#000';
      ctx.fillRect(x + frameWidth/2 + 12, frameHeight/2 - 8, 8, 3);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(x + frameWidth/2 + 12, frameHeight/2 - 5, 8, 3);
    }
  }
  
  // Save the sprite sheet
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(spritesDir, 'harkonnen.png'), buffer);
  console.log('Generated harkonnen.png');
}

// Generate a sandworm sprite
function generateSandwormSprite() {
  const frameWidth = 128;
  const frameHeight = 256;
  const framesCount = 8; // 4 for movement, 4 for burrow/emerge
  
  const canvas = createCanvas(frameWidth * framesCount, frameHeight);
  const ctx = canvas.getContext('2d');
  
  // Sandworm colors
  const bodyColor = '#A0522D'; // Sienna
  const segmentColor = '#8B4513'; // Saddle brown
  const mouthColor = '#FF4500'; // Orange red
  const detailColor = '#D2691E'; // Chocolate
  
  for (let frame = 0; frame < framesCount; frame++) {
    const x = frame * frameWidth;
    
    // Clear background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Different frames for movement vs burrow/emerge
    if (frame < 4) {
      // Movement frames
      // Draw body with undulating movement
      const waveOffset = Math.sin(frame * Math.PI/2) * 10;
      
      // Draw segments
      for (let i = 0; i < 12; i++) {
        const segmentY = frameHeight * 0.7 - i * 20;
        const segmentWidth = 60 + Math.sin(i * 0.5 + frame * 0.5) * 15;
        const segmentXOffset = Math.sin(i * 0.8 + frame * 0.5) * 30;
        
        ctx.fillStyle = i % 2 === 0 ? bodyColor : segmentColor;
        ctx.beginPath();
        ctx.ellipse(
          x + frameWidth/2 + segmentXOffset + waveOffset,
          segmentY,
          segmentWidth / 2,
          15,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Add segment details
        if (i % 2 === 0) {
          ctx.fillStyle = detailColor;
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(
              x + frameWidth/2 + segmentXOffset + waveOffset - 20 + j * 20,
              segmentY,
              3,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }
      
      // Draw head
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(
        x + frameWidth/2 + waveOffset,
        frameHeight * 0.7 - 12 * 20,
        40,
        25,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw mouth
      ctx.fillStyle = mouthColor;
      ctx.beginPath();
      ctx.arc(
        x + frameWidth/2 + waveOffset,
        frameHeight * 0.7 - 12 * 20 - 5,
        15,
        0,
        Math.PI
      );
      ctx.fill();
      
      // Draw eyes (small sensory organs)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x + frameWidth/2 + waveOffset - 15, frameHeight * 0.7 - 12 * 20 - 10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + frameWidth/2 + waveOffset + 15, frameHeight * 0.7 - 12 * 20 - 10, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Burrow/emerge frames (4-7)
      const burrowProgress = (frame - 4) / 3; // 0 to 1 for burrow sequence
      
      // Draw the worm partially submerged
      const visibleHeight = (1 - burrowProgress) * frameHeight * 0.6;
      
      // Draw sand mound
      ctx.fillStyle = '#DAA520'; // Goldenrod
      ctx.beginPath();
      ctx.ellipse(
        x + frameWidth/2,
        frameHeight * 0.7,
        70,
        20,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Draw visible segments
      const segmentCount = Math.max(1, Math.floor((1 - burrowProgress) * 8));
      for (let i = 0; i < segmentCount; i++) {
        const segmentY = frameHeight * 0.7 - i * 20;
        const segmentWidth = 60 - i * 5;
        
        ctx.fillStyle = i % 2 === 0 ? bodyColor : segmentColor;
        ctx.beginPath();
        ctx.ellipse(
          x + frameWidth/2,
          segmentY,
          segmentWidth / 2,
          15,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Add segment details
        if (i % 2 === 0) {
          ctx.fillStyle = detailColor;
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(
              x + frameWidth/2 - 20 + j * 20,
              segmentY,
              3,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }
      
      // Draw head if visible
      if (segmentCount >= 8) {
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(
          x + frameWidth/2,
          frameHeight * 0.7 - 8 * 20,
          40,
          25,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Draw mouth
        ctx.fillStyle = mouthColor;
        ctx.beginPath();
        ctx.arc(
          x + frameWidth/2,
          frameHeight * 0.7 - 8 * 20 - 5,
          15,
          0,
          Math.PI
        );
        ctx.fill();
      }
      
      // Draw sand particles for the burrow effect
      ctx.fillStyle = '#F4A460'; // Sandy brown
      for (let i = 0; i < 15; i++) {
        const particleSize = Math.random() * 6 + 2;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 60 + 20;
        
        ctx.beginPath();
        ctx.arc(
          x + frameWidth/2 + Math.cos(angle) * distance,
          frameHeight * 0.7 + Math.sin(angle) * distance * 0.3,
          particleSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
  
  // Save the sprite sheet
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(spritesDir, 'sandworm.png'), buffer);
  console.log('Generated sandworm.png');
}

// Generate placeholder for UI elements
function generateUiElements() {
  // Generate heart icon
  const heartCanvas = createCanvas(16, 16);
  const heartCtx = heartCanvas.getContext('2d');
  
  // Draw a red heart
  heartCtx.fillStyle = '#FF0000';
  heartCtx.beginPath();
  heartCtx.moveTo(8, 4);
  heartCtx.bezierCurveTo(8, 3, 7, 2, 5, 2);
  heartCtx.bezierCurveTo(3, 2, 2, 3, 2, 5);
  heartCtx.bezierCurveTo(2, 7, 3, 9, 8, 14);
  heartCtx.bezierCurveTo(13, 9, 14, 7, 14, 5);
  heartCtx.bezierCurveTo(14, 3, 13, 2, 11, 2);
  heartCtx.bezierCurveTo(9, 2, 8, 3, 8, 4);
  heartCtx.fill();
  
  // Save heart icon
  const heartBuffer = heartCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(spritesDir, 'ui-heart.png'), heartBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/assets/ui/heart.png'), heartBuffer);
  console.log('Generated heart icons');
  
  // Generate bullet icon
  const bulletCanvas = createCanvas(16, 16);
  const bulletCtx = bulletCanvas.getContext('2d');
  
  // Draw a yellow bullet
  bulletCtx.fillStyle = '#FFD700';
  bulletCtx.beginPath();
  bulletCtx.moveTo(4, 4);
  bulletCtx.lineTo(12, 4);
  bulletCtx.lineTo(12, 12);
  bulletCtx.lineTo(4, 12);
  bulletCtx.closePath();
  bulletCtx.fill();
  
  // Add details
  bulletCtx.fillStyle = '#DAA520';
  bulletCtx.beginPath();
  bulletCtx.moveTo(8, 4);
  bulletCtx.lineTo(12, 4);
  bulletCtx.lineTo(12, 12);
  bulletCtx.lineTo(8, 12);
  bulletCtx.closePath();
  bulletCtx.fill();
  
  // Save bullet icon
  const bulletBuffer = bulletCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(spritesDir, 'ui-bullet.png'), bulletBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/assets/ui/bullet.png'), bulletBuffer);
  console.log('Generated bullet icons');
  
  // Generate sand particle
  const particleCanvas = createCanvas(8, 8);
  const particleCtx = particleCanvas.getContext('2d');
  
  // Draw a sand particle
  particleCtx.fillStyle = '#DAA520';
  particleCtx.beginPath();
  particleCtx.arc(4, 4, 3, 0, Math.PI * 2);
  particleCtx.fill();
  
  // Save particle
  const particleBuffer = particleCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(spritesDir, 'sand-particle.png'), particleBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/assets/particles/sand-particle.png'), particleBuffer);
  console.log('Generated sand particles');
}

// Generate all assets
(async function() {
  console.log('Generating game assets...');
  generateOrnithopterSprite();
  generateHarkonnenSprite();
  generateSandwormSprite();
  generateUiElements();
  console.log('All assets generated successfully!');
})(); 