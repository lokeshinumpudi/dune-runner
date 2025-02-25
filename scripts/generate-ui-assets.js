import fs from 'fs';
import { createCanvas } from 'canvas';

// Ensure UI directory exists
const UI_DIR = 'public/assets/ui';
if (!fs.existsSync(UI_DIR)) {
  fs.mkdirSync(UI_DIR, { recursive: true });
}

// Generate button
function generateButton() {
  const canvas = createCanvas(200, 50);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, 50);
  gradient.addColorStop(0, '#444444');
  gradient.addColorStop(0.5, '#333333');
  gradient.addColorStop(1, '#222222');
  
  // Draw rounded rectangle
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, 200, 50, 10, true);
  
  // Add border
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  roundRect(ctx, 0, 0, 200, 50, 10, false, true);
  
  // Add highlight
  const highlightGradient = ctx.createLinearGradient(0, 0, 0, 15);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = highlightGradient;
  roundRect(ctx, 2, 2, 196, 15, 8, true);
  
  saveCanvas(canvas, `${UI_DIR}/button.png`);
}

// Generate checkbox (unchecked)
function generateCheckbox() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');
  
  // Draw outer box
  ctx.fillStyle = '#333333';
  roundRect(ctx, 0, 0, 32, 32, 5, true);
  
  // Add border
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  roundRect(ctx, 0, 0, 32, 32, 5, false, true);
  
  // Add inner shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  roundRect(ctx, 4, 4, 24, 24, 3, true);
  
  saveCanvas(canvas, `${UI_DIR}/checkbox.png`);
}

// Generate checkbox (checked)
function generateCheckboxChecked() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');
  
  // Draw outer box
  ctx.fillStyle = '#333333';
  roundRect(ctx, 0, 0, 32, 32, 5, true);
  
  // Add border
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  roundRect(ctx, 0, 0, 32, 32, 5, false, true);
  
  // Add checkmark
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(8, 16);
  ctx.lineTo(14, 22);
  ctx.lineTo(24, 8);
  ctx.stroke();
  
  saveCanvas(canvas, `${UI_DIR}/checkbox-checked.png`);
}

// Generate logo
function generateLogo() {
  const canvas = createCanvas(400, 200);
  const ctx = canvas.getContext('2d');
  
  // Draw text shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DUNE RUNNER', 205, 105);
  
  // Draw text
  const gradient = ctx.createLinearGradient(0, 50, 0, 150);
  gradient.addColorStop(0, '#ffd700'); // Gold
  gradient.addColorStop(1, '#ff8c00'); // Dark Orange
  
  ctx.fillStyle = gradient;
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DUNE RUNNER', 200, 100);
  
  // Add stroke
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeText('DUNE RUNNER', 200, 100);
  
  saveCanvas(canvas, `${UI_DIR}/logo.png`);
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  
  if (fill) {
    ctx.fill();
  }
  
  if (stroke) {
    ctx.stroke();
  }
}

// Helper function to save canvas to file
function saveCanvas(canvas, filePath) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filePath}`);
}

// Generate all UI assets
generateButton();
generateCheckbox();
generateCheckboxChecked();
generateLogo();

console.log('UI assets generation complete!');

 