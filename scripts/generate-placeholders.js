import fs from 'fs';
import { createCanvas } from 'canvas';
import path from 'path';

const ASSETS_DIR = 'public/assets';
const BACKGROUNDS_DIR = `${ASSETS_DIR}/backgrounds`;
const SPRITES_DIR = `${ASSETS_DIR}/sprites`;

// Ensure directories exist
[ASSETS_DIR, BACKGROUNDS_DIR, SPRITES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate background images
function generateBackground(name, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create a vibrant sunset gradient background
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, '#1a0a2e'); // Deep purple at top
  skyGradient.addColorStop(0.3, '#5d1b74'); // Mid purple
  skyGradient.addColorStop(0.5, '#b13e53'); // Pinkish red
  skyGradient.addColorStop(0.7, '#ef7d57'); // Orange
  skyGradient.addColorStop(0.9, '#ffcd75'); // Light orange/yellow at horizon
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  // Add stars in the upper portion of the sky
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 150; i++) {
    const starSize = Math.random() * 2 + 1;
    const x = Math.random() * width;
    const y = Math.random() * height * 0.6; // Only in top 60% of sky
    const opacity = Math.random() * 0.8 + 0.2;
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, starSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Add a few shooting stars / meteors
  for (let i = 0; i < 3; i++) {
    const startX = Math.random() * width;
    const startY = Math.random() * height * 0.3;
    const length = 30 + Math.random() * 50;
    const angle = Math.PI / 4 + (Math.random() * Math.PI / 4);
    
    const meteorGradient = ctx.createLinearGradient(
      startX, startY,
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );
    
    meteorGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    meteorGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.strokeStyle = meteorGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Draw distant mountains silhouette
  ctx.fillStyle = '#382a60'; // Dark purple for distant mountains
  ctx.beginPath();
  ctx.moveTo(0, height * 0.65);
  
  // Create jagged mountain range
  let x = 0;
  while (x < width) {
    const peakHeight = Math.random() * height * 0.15 + height * 0.05;
    ctx.lineTo(x, height * 0.65 - peakHeight);
    x += Math.random() * 100 + 50;
    ctx.lineTo(x, height * 0.65);
    x += Math.random() * 100 + 50;
  }
  
  ctx.lineTo(width, height * 0.65);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  // Add some clouds
  ctx.fillStyle = 'rgba(255, 180, 180, 0.3)';
  for (let i = 0; i < 5; i++) {
    const cloudX = Math.random() * width;
    const cloudY = Math.random() * height * 0.4 + height * 0.1;
    const cloudWidth = Math.random() * 200 + 100;
    const cloudHeight = Math.random() * 40 + 20;
    
    drawCloud(ctx, cloudX, cloudY, cloudWidth, cloudHeight);
  }

  // Draw a large striped sun
  const sunX = width * 0.7;
  const sunY = height * 0.35;
  const sunRadius = width * 0.15;
  
  // Sun base
  ctx.fillStyle = '#ffcd75';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Sun stripes
  ctx.fillStyle = '#ef7d57';
  const stripeCount = 8;
  const stripeHeight = sunRadius * 2 / stripeCount;
  
  for (let i = 0; i < stripeCount; i += 2) {
    const y = sunY - sunRadius + i * stripeHeight;
    ctx.fillRect(sunX - sunRadius, y, sunRadius * 2, stripeHeight);
  }

  // Add a small moon
  const moonX = width * 0.2;
  const moonY = height * 0.2;
  const moonRadius = width * 0.05;
  
  // Moon glow
  const moonGlow = ctx.createRadialGradient(
    moonX, moonY, 0,
    moonX, moonY, moonRadius * 1.5
  );
  moonGlow.addColorStop(0, 'rgba(255, 231, 200, 0.3)');
  moonGlow.addColorStop(1, 'rgba(255, 231, 200, 0)');
  
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Moon body
  ctx.fillStyle = '#ffe7c8';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  // Save the sky as one image
  saveCanvas(canvas, `${BACKGROUNDS_DIR}/${name}`);

  // Only generate the other backgrounds if we're generating the sky
  if (name === 'sky') {
    generateDunes('dunes-far', width, height, 0.6, '#5d1b74', '#ef7d57');
    generateDunes('dunes-near', width, height, 0.4, '#b13e53', '#ffcd75');
    generateGroundSand(width, height);
  }
}

function drawCloud(ctx, x, y, width, height) {
  const numCircles = Math.floor(width / 40) + 2;
  const circleRadius = height / 1.5;
  
  ctx.beginPath();
  for (let i = 0; i < numCircles; i++) {
    const circleX = x + i * (width / numCircles);
    const circleY = y + Math.sin(i) * 5;
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
  }
  ctx.fill();
}

function generateDunes(name, width, height, heightFactor, colorTop, colorBottom) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Create gradient for dunes
  const duneGradient = ctx.createLinearGradient(0, height * (1 - heightFactor), 0, height);
  duneGradient.addColorStop(0, colorTop);
  duneGradient.addColorStop(1, colorBottom);
  
  ctx.fillStyle = duneGradient;
  
  // Draw dunes with smooth curves
  ctx.beginPath();
  ctx.moveTo(0, height);
  
  // Start at the bottom left
  ctx.lineTo(0, height * (1 - heightFactor / 2));
  
  // Create wavy dune pattern
  let x = 0;
  const waveCount = 6;
  const waveWidth = width / waveCount;
  
  for (let i = 0; i <= waveCount; i++) {
    const cpX1 = x + waveWidth / 3;
    const cpY1 = height * (1 - heightFactor) - (Math.random() * height * 0.1);
    
    const cpX2 = x + waveWidth * 2/3;
    const cpY2 = height * (1 - heightFactor) - (Math.random() * height * 0.1);
    
    const endX = x + waveWidth;
    const endY = height * (1 - heightFactor / 2) + (i % 2 === 0 ? height * 0.05 : 0);
    
    ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, endX, endY);
    x = endX;
  }
  
  // Complete the shape
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  
  // Add some texture/detail to dunes
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 20; i++) {
    const lineY = height * (1 - heightFactor / 2) + (height * heightFactor / 2) * (i / 20);
    const amplitude = 10 * (1 - i / 20); // Smaller waves as we go down
    
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    
    for (let x = 0; x <= width; x += 20) {
      const y = lineY + Math.sin(x / 50) * amplitude;
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  
  saveCanvas(canvas, `${BACKGROUNDS_DIR}/${name}`);
}

function generateGroundSand(width, height) {
  const canvas = createCanvas(width, height / 5);
  const ctx = canvas.getContext('2d');
  
  // Create gradient for ground
  const groundGradient = ctx.createLinearGradient(0, 0, 0, height / 5);
  groundGradient.addColorStop(0, '#ef7d57'); // Lighter sand at top
  groundGradient.addColorStop(1, '#b13e53'); // Darker sand at bottom
  
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, 0, width, height / 5);
  
  // Add texture to the sand
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * (height / 5);
    const radius = Math.random() * 5 + 2;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
    ctx.fill();
  }
  
  // Add some wave patterns
  for (let i = 0; i < 5; i++) {
    const y = (height / 5) * (i / 5) + 10;
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    
    for (let x = 0; x < width; x += 20) {
      ctx.lineTo(x, y + Math.sin(x / 30) * 3);
    }
    
    ctx.strokeStyle = 'rgba(255,150,100,0.2)';
    ctx.stroke();
  }
  
  saveCanvas(canvas, `${BACKGROUNDS_DIR}/ground-sand`);
}

function generatePlatformSprite() {
  const width = 100;
  const height = 32;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Base metal color
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, width, height);
  
  // Add tech patterns
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  
  // Grid pattern
  for (let x = 10; x < width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 5; y < height; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Add ventilation details
  for (let x = 15; x < width - 10; x += 30) {
    // Vent frame
    ctx.fillStyle = '#222222';
    ctx.fillRect(x, 5, 20, 22);
    
    // Vent slats
    ctx.fillStyle = '#444444';
    for (let y = 8; y < 24; y += 4) {
      ctx.fillRect(x + 2, y, 16, 2);
    }
  }
  
  // Edge highlights
  const edgeGradient = ctx.createLinearGradient(0, 0, 0, 5);
  edgeGradient.addColorStop(0, '#888888');
  edgeGradient.addColorStop(1, '#444444');
  ctx.fillStyle = edgeGradient;
  ctx.fillRect(0, 0, width, 3);
  
  fs.writeFileSync(`${SPRITES_DIR}/platform-sand.png`, canvas.toBuffer());
}

function generatePlayerSprite() {
  const frameWidth = 32;
  const frameHeight = 48;
  const frames = 9;
  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');

  // Sci-fi astronaut colors - updated to match reference image
  const colors = {
    suit: '#2a3c5a',       // Dark blue suit base
    helmet: '#1a2a40',     // Darker helmet
    visor: '#66ccff',      // Bright blue visor
    backpack: '#3a4c6a',   // Life support pack
    accent: '#ff5533',     // Orange-red accents
    tubes: '#8899aa',      // Silver tubes
    glow: '#66ccff',       // Tech glow
    highlight: '#ffffff',  // White highlights
    shadow: '#111827'      // Dark shadows
  };

  // Draw each frame
  for (let i = 0; i < frames; i++) {
    const x = i * frameWidth;
    const isIdle = i === 4;
    const walkOffset = Math.sin(i * Math.PI / 2) * 2;
    
    // Clear frame
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Draw astronaut with better proportions
    
    // Legs with tech armor - more detailed
    if (!isIdle) {
      // Left leg
      ctx.fillStyle = colors.suit;
      ctx.fillRect(x + 11, 30 + walkOffset, 5, 16);
      
      // Right leg
      ctx.fillRect(x + 16, 30 - walkOffset, 5, 16);
      
      // Leg armor accents
      ctx.fillStyle = colors.accent;
      ctx.fillRect(x + 11, 32 + walkOffset, 5, 2);
      ctx.fillRect(x + 16, 32 - walkOffset, 5, 2);
      
      // Boot details
      ctx.fillStyle = colors.shadow;
      ctx.fillRect(x + 11, 44 + walkOffset, 5, 2);
      ctx.fillRect(x + 16, 44 - walkOffset, 5, 2);
    } else {
      // Standing pose
      ctx.fillStyle = colors.suit;
      ctx.fillRect(x + 11, 30, 5, 16);
      ctx.fillRect(x + 16, 30, 5, 16);
      
      // Leg armor accents
      ctx.fillStyle = colors.accent;
      ctx.fillRect(x + 11, 32, 5, 2);
      ctx.fillRect(x + 16, 32, 5, 2);
      
      // Boot details
      ctx.fillStyle = colors.shadow;
      ctx.fillRect(x + 11, 44, 5, 2);
      ctx.fillRect(x + 16, 44, 5, 2);
    }
    
    // Torso - wider and more detailed
    ctx.fillStyle = colors.suit;
    ctx.fillRect(x + 9, 15, 14, 15);
    
    // Belt
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x + 9, 28, 14, 2);
    
    // Life support backpack - more detailed
    ctx.fillStyle = colors.backpack;
    ctx.fillRect(x + 7, 10, 18, 18);
    
    // Backpack details
    ctx.fillStyle = colors.shadow;
    ctx.fillRect(x + 9, 12, 14, 2);
    ctx.fillRect(x + 9, 16, 14, 1);
    ctx.fillRect(x + 9, 20, 14, 1);
    
    // Life support tubes
    ctx.strokeStyle = colors.tubes;
    ctx.lineWidth = 1.5;
    
    // Left tube
    ctx.beginPath();
    ctx.moveTo(x + 9, 14);
    ctx.lineTo(x + 7, 14);
    ctx.lineTo(x + 7, 22);
    ctx.lineTo(x + 9, 22);
    ctx.stroke();
    
    // Right tube
    ctx.beginPath();
    ctx.moveTo(x + 23, 14);
    ctx.lineTo(x + 25, 14);
    ctx.lineTo(x + 25, 22);
    ctx.lineTo(x + 23, 22);
    ctx.stroke();
    
    // Helmet - more rounded
    ctx.fillStyle = colors.helmet;
    ctx.beginPath();
    ctx.arc(x + 16, 8, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Helmet rim
    ctx.strokeStyle = colors.highlight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + 16, 8, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Visor with glow effect - larger and more detailed
    ctx.fillStyle = colors.visor;
    ctx.beginPath();
    ctx.ellipse(x + 16, 8, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Visor reflection
    ctx.fillStyle = colors.highlight;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(x + 14, 7, 2, 1, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Chest details
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x + 13, 18, 6, 8);
    
    // Tech lights on suit
    ctx.fillStyle = colors.glow;
    ctx.globalAlpha = 0.8;
    
    // Chest light
    ctx.beginPath();
    ctx.arc(x + 16, 20, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Arm lights
    ctx.beginPath();
    ctx.arc(x + 9, 24, 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + 23, 24, 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    
    // Arms - add arms that weren't in the original
    ctx.fillStyle = colors.suit;
    
    // Left arm
    ctx.fillRect(x + 6, 15, 3, 12);
    
    // Right arm
    ctx.fillRect(x + 23, 15, 3, 12);
    
    // Arm accents
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x + 6, 18, 3, 2);
    ctx.fillRect(x + 23, 18, 3, 2);
  }

  fs.writeFileSync(`${SPRITES_DIR}/player.png`, canvas.toBuffer());
}

function generateGunSprite() {
  const width = 24;
  const height = 12;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, width, height);
  
  // Gun body
  ctx.fillStyle = '#333333';
  ctx.fillRect(4, 3, 16, 6);
  
  // Gun barrel
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 4, 4, 4);
  
  // Gun handle
  ctx.fillStyle = '#444444';
  ctx.fillRect(16, 3, 4, 8);
  
  // Energy core
  ctx.fillStyle = '#66ccff';
  ctx.fillRect(10, 4, 4, 4);
  
  // Metallic highlights
  ctx.fillStyle = '#888888';
  ctx.fillRect(4, 3, 16, 1);
  ctx.fillRect(0, 4, 4, 1);
  
  fs.writeFileSync(`${SPRITES_DIR}/gun.png`, canvas.toBuffer());
}

function generateBulletSprite() {
  const width = 8;
  const height = 4;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, width, height);
  
  // Energy bullet
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#66ccff');
  gradient.addColorStop(1, 'rgba(102, 204, 255, 0.3)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(4, 2, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Bright center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(3, 2, 1, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  
  fs.writeFileSync(`${SPRITES_DIR}/bullet.png`, canvas.toBuffer());
}

function generateMuzzleFlashSprite() {
  const frameWidth = 16;
  const frameHeight = 16;
  const frames = 3;
  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < frames; i++) {
    const x = i * frameWidth;
    const scale = 1 - (i * 0.3);
    
    // Clear frame
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Draw flash
    const gradient = ctx.createRadialGradient(
      x + frameWidth/2, frameHeight/2, 0,
      x + frameWidth/2, frameHeight/2, 8 * scale
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#66ccff');
    gradient.addColorStop(1, 'rgba(102, 204, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x + frameWidth/2, frameHeight/2, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  fs.writeFileSync(`${SPRITES_DIR}/muzzle-flash.png`, canvas.toBuffer());
}

function generateDestructibleObjectSprite() {
  const width = 32;
  const height = 32;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, width, height);
  
  // Base container
  ctx.fillStyle = '#555555';
  ctx.fillRect(2, 6, 28, 24);
  
  // Tech details
  ctx.fillStyle = '#333333';
  ctx.fillRect(4, 8, 24, 20);
  
  // Energy core
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.arc(width/2, height/2, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Metallic frame
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 6, 28, 24);
  
  // Warning stripes
  ctx.fillStyle = '#ffcc00';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(6, 10 + i * 8, 20, 2);
  }
  
  fs.writeFileSync(`${SPRITES_DIR}/destructible.png`, canvas.toBuffer());
}

function generateExplosionSprite() {
  const frameWidth = 64;
  const frameHeight = 64;
  const frames = 5;
  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < frames; i++) {
    const x = i * frameWidth;
    const scale = (i + 1) / frames;
    const alpha = 1 - (i / (frames - 0.5));
    
    // Clear frame
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Draw explosion
    const gradient = ctx.createRadialGradient(
      x + frameWidth/2, frameHeight/2, 0,
      x + frameWidth/2, frameHeight/2, 30 * scale
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.2, '#ffcc00');
    gradient.addColorStop(0.6, '#ff3300');
    gradient.addColorStop(1, 'rgba(255, 51, 0, 0)');
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + frameWidth/2, frameHeight/2, 30 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Add debris particles
    if (i > 0) {
      ctx.fillStyle = '#ffcc00';
      for (let j = 0; j < 10; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 25 * scale;
        const particleX = x + frameWidth/2 + Math.cos(angle) * distance;
        const particleY = frameHeight/2 + Math.sin(angle) * distance;
        const size = Math.random() * 3 + 1;
        
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillRect(particleX, particleY, size, size);
      }
    }
    
    ctx.globalAlpha = 1;
  }
  
  fs.writeFileSync(`${SPRITES_DIR}/explosion.png`, canvas.toBuffer());
}

function generateAmmoSprite() {
  const width = 16;  // Smaller size
  const height = 8;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, width, height);
  
  // Ammo casing
  ctx.fillStyle = '#D4AF37'; // Gold/brass color
  ctx.beginPath();
  ctx.moveTo(2, 1);
  ctx.lineTo(12, 1);
  ctx.lineTo(14, 4);
  ctx.lineTo(12, 7);
  ctx.lineTo(2, 7);
  ctx.closePath();
  ctx.fill();
  
  // Bullet tip
  ctx.fillStyle = '#C0C0C0'; // Silver color
  ctx.beginPath();
  ctx.moveTo(12, 1);
  ctx.lineTo(16, 2);
  ctx.lineTo(16, 6);
  ctx.lineTo(12, 7);
  ctx.lineTo(14, 4);
  ctx.closePath();
  ctx.fill();
  
  // Metallic highlights
  ctx.strokeStyle = '#FFFFFF';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(3, 2);
  ctx.lineTo(11, 2);
  ctx.stroke();
  
  // Bullet base detail
  ctx.fillStyle = '#8B4513'; // Brown
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(2, 4, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Energy glow effect for sci-fi feel
  ctx.fillStyle = '#66ccff';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(8, 4, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  fs.writeFileSync(`${SPRITES_DIR}/ammo.png`, canvas.toBuffer());
}

function generateCoinSprite() {
  const frameWidth = 16;
  const frameHeight = 16;
  const frames = 8; // Animation frames for rotation
  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < frames; i++) {
    const x = i * frameWidth;
    const framePhase = i / frames; // 0 to 1 for full rotation
    
    // Clear frame
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Calculate width based on rotation (simulate 3D by changing width)
    const widthScale = Math.abs(Math.sin(framePhase * Math.PI));
    const coinWidth = 12 * widthScale + 2; // Never completely flat
    
    // Coin base
    const gradient = ctx.createLinearGradient(x + (frameWidth - coinWidth) / 2, 2, x + (frameWidth - coinWidth) / 2 + coinWidth, 14);
    gradient.addColorStop(0, '#FFD700'); // Gold
    gradient.addColorStop(0.5, '#FFF8DC'); // Light gold/cream
    gradient.addColorStop(1, '#DAA520'); // Golden rod
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      x + frameWidth / 2, 
      frameHeight / 2, 
      coinWidth / 2, 
      6, // Height stays constant
      0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Edge highlight
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(
      x + frameWidth / 2, 
      frameHeight / 2, 
      coinWidth / 2 - 1, 
      5, 
      0, 0, Math.PI * 2
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Coin detail/symbol - changes based on rotation phase
    if (widthScale > 0.4) {
      ctx.fillStyle = '#B8860B'; // Dark golden
      
      // Draw a simple star or symbol
      const symbolSize = widthScale * 4;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (j * 2 * Math.PI / 5) - Math.PI / 2;
        const x1 = x + frameWidth / 2 + Math.cos(angle) * symbolSize;
        const y1 = frameHeight / 2 + Math.sin(angle) * symbolSize;
        if (j === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // Shine effect
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(
      x + frameWidth / 2 - 2, 
      frameHeight / 2 - 2, 
      coinWidth / 4, 
      2, 
      Math.PI / 4, 0, Math.PI * 2
    );
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  fs.writeFileSync(`${SPRITES_DIR}/coin.png`, canvas.toBuffer());
}

function generatePuzzleElementSprite() {
  const frameWidth = 32;
  const frameHeight = 32;
  const frames = 4; // Animation frames
  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < frames; i++) {
    const x = i * frameWidth;
    const animPhase = i / frames; // 0 to 1 for animation
    
    // Clear frame
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Base panel
    ctx.fillStyle = '#333344';
    ctx.fillRect(x + 2, 2, 28, 28);
    
    // Panel border
    ctx.strokeStyle = '#8899aa';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, 2, 28, 28);
    
    // Tech details - circuit pattern
    ctx.strokeStyle = '#66ccff';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(x + 6, 8 + j * 8);
      ctx.lineTo(x + 26, 8 + j * 8);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.moveTo(x + 8 + j * 8, 6);
      ctx.lineTo(x + 8 + j * 8, 26);
      ctx.stroke();
    }
    
    // Interactive element - glowing center that pulses
    const glowSize = 6 + Math.sin(animPhase * Math.PI * 2) * 2;
    const gradient = ctx.createRadialGradient(
      x + frameWidth/2, frameHeight/2, 0,
      x + frameWidth/2, frameHeight/2, glowSize
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#66ccff');
    gradient.addColorStop(1, 'rgba(102, 204, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x + frameWidth/2, frameHeight/2, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Connection points
    const connectors = [
      {x: frameWidth/2, y: 2},       // Top
      {x: frameWidth/2, y: 30},      // Bottom
      {x: 2, y: frameHeight/2},      // Left
      {x: 30, y: frameHeight/2}      // Right
    ];
    
    connectors.forEach(conn => {
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(x + conn.x, conn.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  fs.writeFileSync(`${SPRITES_DIR}/puzzle-element.png`, canvas.toBuffer());
}

function generatePuzzleDoorSprite() {
  const width = 32;
  const height = 64;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, width, height);
  
  // Door base
  ctx.fillStyle = '#444455';
  ctx.fillRect(2, 2, 28, 60);
  
  // Door frame
  ctx.strokeStyle = '#8899aa';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 28, 60);
  
  // Door details
  ctx.fillStyle = '#333344';
  ctx.fillRect(6, 6, 20, 52);
  
  // Door panels
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#555566';
    ctx.fillRect(8, 10 + i * 18, 16, 14);
    
    // Panel details
    ctx.strokeStyle = '#66ccff';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 12 + i * 18, 12, 10);
  }
  
  // Lock indicator
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.arc(width/2, 8, 3, 0, Math.PI * 2);
  ctx.fill();
  
  fs.writeFileSync(`${SPRITES_DIR}/puzzle-door.png`, canvas.toBuffer());
}

function generatePowerUpSprite() {
  const frameWidth = 24;
  const frameHeight = 24;
  const frames = 6; // Animation frames
  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < frames; i++) {
    const x = i * frameWidth;
    const animPhase = i / frames; // 0 to 1 for animation
    const rotation = animPhase * Math.PI * 2;
    
    // Clear frame
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Save context for rotation
    ctx.save();
    ctx.translate(x + frameWidth/2, frameHeight/2);
    ctx.rotate(rotation);
    
    // Power-up base - energy crystal
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#ff66cc');
    gradient.addColorStop(0.7, '#9933ff');
    gradient.addColorStop(1, '#3311aa');
    
    ctx.fillStyle = gradient;
    
    // Draw crystal shape
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(7, -5);
    ctx.lineTo(7, 5);
    ctx.lineTo(0, 10);
    ctx.lineTo(-7, 5);
    ctx.lineTo(-7, -5);
    ctx.closePath();
    ctx.fill();
    
    // Crystal highlights
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.lineTo(0, -8);
    ctx.lineTo(5, -3);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Restore context
    ctx.restore();
    
    // Outer glow effect
    const outerGlow = ctx.createRadialGradient(
      x + frameWidth/2, frameHeight/2, 8,
      x + frameWidth/2, frameHeight/2, 12
    );
    outerGlow.addColorStop(0, 'rgba(153, 51, 255, 0.5)');
    outerGlow.addColorStop(1, 'rgba(153, 51, 255, 0)');
    
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(x + frameWidth/2, frameHeight/2, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Particles
    ctx.fillStyle = '#ffffff';
    for (let j = 0; j < 5; j++) {
      const particleAngle = (j / 5) * Math.PI * 2 + rotation;
      const distance = 10 + Math.sin(animPhase * Math.PI * 2 + j) * 2;
      const particleX = x + frameWidth/2 + Math.cos(particleAngle) * distance;
      const particleY = frameHeight/2 + Math.sin(particleAngle) * distance;
      const size = 1 + Math.random();
      
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(particleX, particleY, size/2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  
  fs.writeFileSync(`${SPRITES_DIR}/power-up.png`, canvas.toBuffer());
}

function generateHealthPackSprite() {
  const width = 16;
  const height = 16;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, width, height);
  
  // Health pack base
  ctx.fillStyle = '#eeeeee';
  ctx.fillRect(2, 2, 12, 12);
  
  // Border
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, 12, 12);
  
  // Red cross
  ctx.fillStyle = '#ff3333';
  
  // Horizontal bar
  ctx.fillRect(4, 7, 8, 2);
  
  // Vertical bar
  ctx.fillRect(7, 4, 2, 8);
  
  // Highlight
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.5;
  ctx.fillRect(3, 3, 10, 1);
  ctx.globalAlpha = 1;
  
  fs.writeFileSync(`${SPRITES_DIR}/health-pack.png`, canvas.toBuffer());
}

function generateEnemySprite() {
  const frameWidth = 32;
  const frameHeight = 32;
  const frames = 6; // Animation frames
  const canvas = createCanvas(frameWidth * frames, frameHeight);
  const ctx = canvas.getContext('2d');
  
  for (let i = 0; i < frames; i++) {
    const x = i * frameWidth;
    const animPhase = i / frames; // 0 to 1 for animation
    const hoverOffset = Math.sin(animPhase * Math.PI * 2) * 2;
    
    // Clear frame
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(x, 0, frameWidth, frameHeight);
    
    // Draw hover drone enemy
    
    // Main body - hovering up and down
    ctx.fillStyle = '#660000';
    ctx.beginPath();
    ctx.ellipse(
      x + frameWidth/2, 
      frameHeight/2 + hoverOffset, 
      10, 6, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Top dome
    ctx.fillStyle = '#880000';
    ctx.beginPath();
    ctx.arc(
      x + frameWidth/2, 
      frameHeight/2 + hoverOffset - 2, 
      8, 0, Math.PI, true
    );
    ctx.fill();
    
    // Eye/scanner
    const eyeAngle = Math.sin(animPhase * Math.PI * 4) * 0.3;
    const eyeX = x + frameWidth/2 + Math.cos(eyeAngle) * 5;
    const eyeY = frameHeight/2 + hoverOffset - 2;
    
    // Eye socket
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye glow
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(eyeX - 0.5, eyeY - 0.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Bottom thrusters
    ctx.fillStyle = '#333333';
    
    // Left thruster
    ctx.beginPath();
    ctx.ellipse(
      x + frameWidth/2 - 6, 
      frameHeight/2 + hoverOffset + 4, 
      3, 2, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Right thruster
    ctx.beginPath();
    ctx.ellipse(
      x + frameWidth/2 + 6, 
      frameHeight/2 + hoverOffset + 4, 
      3, 2, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Thruster glow
    const thrusterPhase = (animPhase + 0.5) % 1; // Offset for pulsing
    const thrusterSize = 2 + Math.sin(thrusterPhase * Math.PI * 4) * 1;
    
    // Left thruster flame
    const leftGradient = ctx.createRadialGradient(
      x + frameWidth/2 - 6, frameHeight/2 + hoverOffset + 6, 0,
      x + frameWidth/2 - 6, frameHeight/2 + hoverOffset + 6, thrusterSize
    );
    leftGradient.addColorStop(0, '#ffffff');
    leftGradient.addColorStop(0.3, '#ffcc00');
    leftGradient.addColorStop(1, 'rgba(255, 102, 0, 0)');
    
    ctx.fillStyle = leftGradient;
    ctx.beginPath();
    ctx.ellipse(
      x + frameWidth/2 - 6, 
      frameHeight/2 + hoverOffset + 6, 
      thrusterSize, thrusterSize * 1.5, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Right thruster flame
    const rightGradient = ctx.createRadialGradient(
      x + frameWidth/2 + 6, frameHeight/2 + hoverOffset + 6, 0,
      x + frameWidth/2 + 6, frameHeight/2 + hoverOffset + 6, thrusterSize
    );
    rightGradient.addColorStop(0, '#ffffff');
    rightGradient.addColorStop(0.3, '#ffcc00');
    rightGradient.addColorStop(1, 'rgba(255, 102, 0, 0)');
    
    ctx.fillStyle = rightGradient;
    ctx.beginPath();
    ctx.ellipse(
      x + frameWidth/2 + 6, 
      frameHeight/2 + hoverOffset + 6, 
      thrusterSize, thrusterSize * 1.5, 0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Antenna
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + frameWidth/2, frameHeight/2 + hoverOffset - 8);
    ctx.lineTo(x + frameWidth/2, frameHeight/2 + hoverOffset - 12);
    ctx.stroke();
    
    // Antenna tip
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(
      x + frameWidth/2, 
      frameHeight/2 + hoverOffset - 12, 
      1, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Metal details
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(
      x + frameWidth/2, 
      frameHeight/2 + hoverOffset, 
      10, 0, Math.PI * 2
    );
    ctx.stroke();
  }
  
  fs.writeFileSync(`${SPRITES_DIR}/enemy.png`, canvas.toBuffer());
}

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
  saveCanvas(canvas, `${SPRITES_DIR}/ornithopter`);
}

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
  saveCanvas(canvas, `${SPRITES_DIR}/harkonnen`);
}

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
  saveCanvas(canvas, `${SPRITES_DIR}/sandworm`);
}

function generateUIElements() {
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
  saveCanvas(heartCanvas, `${SPRITES_DIR}/ui-heart`);
  
  // Make directory for UI if it doesn't exist
  const uiDir = path.join(ASSETS_DIR, 'ui');
  if (!fs.existsSync(uiDir)) {
    fs.mkdirSync(uiDir, { recursive: true });
  }
  
  saveCanvas(heartCanvas, `${ASSETS_DIR}/ui/heart`);
  
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
  saveCanvas(bulletCanvas, `${SPRITES_DIR}/ui-bullet`);
  saveCanvas(bulletCanvas, `${ASSETS_DIR}/ui/bullet`);
  
  // Generate sand particle
  const particleCanvas = createCanvas(8, 8);
  const particleCtx = particleCanvas.getContext('2d');
  
  // Draw a sand particle
  particleCtx.fillStyle = '#DAA520';
  particleCtx.beginPath();
  particleCtx.arc(4, 4, 3, 0, Math.PI * 2);
  particleCtx.fill();
  
  // Save particle
  saveCanvas(particleCanvas, `${SPRITES_DIR}/sand-particle`);
  
  // Make directory for particles if it doesn't exist
  const particlesDir = path.join(ASSETS_DIR, 'particles');
  if (!fs.existsSync(particlesDir)) {
    fs.mkdirSync(particlesDir, { recursive: true });
  }
  
  saveCanvas(particleCanvas, `${ASSETS_DIR}/particles/sand-particle`);
}

// Generate all assets
function generateSprites() {
  generatePlayerSprite();
  generatePlatformSprite();
  generateGunSprite();
  generateBulletSprite();
  generateMuzzleFlashSprite();
  generateDestructibleObjectSprite();
  generateExplosionSprite();
  generateAmmoSprite();
  generateCoinSprite();
  generatePuzzleElementSprite();
  generatePuzzleDoorSprite();
  generatePowerUpSprite();
  generateHealthPackSprite();
  generateEnemySprite();
  
  // Add our new sprite generators
  generateOrnithopterSprite();
  generateHarkonnenSprite();
  generateSandwormSprite();
  generateUIElements();
}

// Generate backgrounds
generateBackground('sky', 800, 600);
// The dunes and ground are generated from within the sky generation

// Generate sprites
generateSprites();

// Helper function to save canvas to file
function saveCanvas(canvas, filePath) {
  fs.writeFileSync(`${filePath}.png`, canvas.toBuffer());
  console.log(`Generated: ${filePath}.png`);
} 