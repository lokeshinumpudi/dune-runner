import fs from 'fs';
import { exec } from 'child_process';

// Ensure the sounds directory exists
const soundsDir = 'public/assets/sounds';
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

// Function to generate a simple audio file using ffmpeg
function generateAudio(name, command, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`Generating ${name}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating ${name}: ${error.message}`);
        reject(error);
        return;
      }
      console.log(`Generated ${name} successfully`);
      resolve();
    });
  });
}

// Generate all required audio files
async function generateAllAudio() {
  try {
    // Menu music - gentle ambient tones with softer frequencies and amplitude
    await generateAudio(
      'menu-music',
      `ffmpeg -f lavfi -i "aevalsrc=0.2*sin(2*PI*320*t)+0.15*sin(2*PI*380*t)+0.1*sin(2*PI*420*t):d=5" "${soundsDir}/menu-music.mp3" -y`,
      `${soundsDir}/menu-music.mp3`
    );

    // Button click - short, crisp sound with quick decay
    await generateAudio(
      'button-click',
      `ffmpeg -f lavfi -i "aevalsrc=0.8*sin(2*PI*880*t)*exp(-10*t):d=0.1" "${soundsDir}/button-click.mp3" -y`,
      `${soundsDir}/button-click.mp3`
    );

    // Level complete - triumphant ascending tone
    await generateAudio(
      'level-complete',
      `ffmpeg -f lavfi -i "aevalsrc=0.5*sin(2*PI*(440+220*t)*t):d=1" "${soundsDir}/level-complete.mp3" -y`,
      `${soundsDir}/level-complete.mp3`
    );

    // Shoot sound - sharp, quick sound with high frequency
    await generateAudio(
      'shoot',
      `ffmpeg -f lavfi -i "aevalsrc=0.8*sin(2*PI*1760*t)*exp(-20*t):d=0.1" "${soundsDir}/shoot.mp3" -y`,
      `${soundsDir}/shoot.mp3`
    );
    
    // Jump sound - upward sweep effect
    await generateAudio(
      'jump',
      `ffmpeg -f lavfi -i "aevalsrc=0.5*sin(2*PI*(440+440*t)*t):d=0.2" "${soundsDir}/jump.mp3" -y`,
      `${soundsDir}/jump.mp3`
    );
    
    // Hit sound - impact sound with low frequency
    await generateAudio(
      'hit',
      `ffmpeg -f lavfi -i "aevalsrc=0.7*sin(2*PI*220*t)*exp(-10*t):d=0.15" "${soundsDir}/hit.mp3" -y`,
      `${soundsDir}/hit.mp3`
    );
    
    // Player hit sound - more dramatic impact
    await generateAudio(
      'player-hit',
      `ffmpeg -f lavfi -i "aevalsrc=0.8*sin(2*PI*220*t)*exp(-5*t):d=0.3" "${soundsDir}/player-hit.mp3" -y`,
      `${soundsDir}/player-hit.mp3`
    );
    
    // Explosion sound - low rumble with decay
    await generateAudio(
      'explosion',
      `ffmpeg -f lavfi -i "aevalsrc=0.9*sin(2*PI*80*t)*exp(-2*t):d=0.5" "${soundsDir}/explosion.mp3" -y`,
      `${soundsDir}/explosion.mp3`
    );
    
    // Coin pickup sound - bright, cheerful sound with rising pitch
    await generateAudio(
      'coin',
      `ffmpeg -f lavfi -i "aevalsrc=0.5*sin(2*PI*(880+440*t)*t):d=0.2" "${soundsDir}/coin.mp3" -y`,
      `${soundsDir}/coin.mp3`
    );
    
    // Ammo pickup sound - metallic sound
    await generateAudio(
      'ammo',
      `ffmpeg -f lavfi -i "aevalsrc=0.6*sin(2*PI*660*t)+0.3*sin(2*PI*880*t):d=0.2" "${soundsDir}/ammo.mp3" -y`,
      `${soundsDir}/ammo.mp3`
    );
    
    // Empty gun sound - click with no power
    await generateAudio(
      'empty',
      `ffmpeg -f lavfi -i "aevalsrc=0.4*sin(2*PI*220*t)*exp(-30*t):d=0.05" "${soundsDir}/empty.mp3" -y`,
      `${soundsDir}/empty.mp3`
    );
    
    // Player death sound - dramatic descending tone
    await generateAudio(
      'player-death',
      `ffmpeg -f lavfi -i "aevalsrc=0.8*sin(2*PI*(220-110*t)*t):d=0.5" "${soundsDir}/player-death.mp3" -y`,
      `${soundsDir}/player-death.mp3`
    );

    console.log('All audio assets generated successfully!');
  } catch (error) {
    console.error('Error generating audio assets:', error);
  }
}

// Create empty audio files for all required sounds (fallback if ffmpeg fails)
async function createEmptyAudioFiles() {
  try {
    const sounds = [
      'menu-music',
      'button-click',
      'level-complete',
      'shoot',
      'jump',
      'hit',
      'player-hit',
      'explosion',
      'coin',
      'ammo',
      'empty',
      'player-death'
    ];
    
    // Create a simple 1-second silent audio file
    const silenceCommand = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 "${soundsDir}/silence.mp3" -y`;
    
    await new Promise((resolve, reject) => {
      exec(silenceCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating silence: ${error.message}`);
          reject(error);
          return;
        }
        console.log(`Generated silence successfully`);
        resolve();
      });
    });
    
    // Copy the silence file to all required sound files
    for (const sound of sounds) {
      const copyCommand = `cp "${soundsDir}/silence.mp3" "${soundsDir}/${sound}.mp3"`;
      await new Promise((resolve, reject) => {
        exec(copyCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error copying to ${sound}: ${error.message}`);
            reject(error);
            return;
          }
          console.log(`Created ${sound}.mp3 successfully`);
          resolve();
        });
      });
    }
    
    // Remove the silence file
    fs.unlinkSync(`${soundsDir}/silence.mp3`);
    
    console.log('All audio files created successfully!');
  } catch (error) {
    console.error('Error creating audio files:', error);
  }
}

// Try to generate proper audio files, fall back to empty files if that fails
async function main() {
  try {
    await generateAllAudio();
  } catch (error) {
    console.error('Error generating audio with ffmpeg, falling back to empty files:', error);
    await createEmptyAudioFiles();
  }
}

// Run the generation
main(); 