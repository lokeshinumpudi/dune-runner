import fs from 'fs';

const SOUNDS_DIR = 'public/assets/sounds';

// Ensure directory exists
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

// Generate a procedural sound wave
function generateWavSound(filename, options = {}) {
  const {
    duration = 0.5,         // Duration in seconds
    sampleRate = 44100,     // Sample rate
    frequency = 440,        // Base frequency in Hz
    waveType = 'sine',      // 'sine', 'square', 'sawtooth', 'noise'
    volume = 0.5,           // Volume (0-1)
    attack = 0.01,          // Attack time in seconds
    decay = 0.1,            // Decay time in seconds
    sustain = 0.5,          // Sustain level (0-1)
    release = 0.1,          // Release time in seconds
    frequencySlide = 0,     // Frequency slide in Hz/s
    vibrato = 0,            // Vibrato depth in Hz
    vibratoSpeed = 0,       // Vibrato speed in Hz
    lowPass = 0,            // Low pass filter cutoff in Hz (0 = no filter)
    highPass = 0,           // High pass filter cutoff in Hz (0 = no filter)
    echo = 0,               // Echo delay in seconds (0 = no echo)
    echoFeedback = 0.3,     // Echo feedback (0-1)
    distortion = 0          // Distortion amount (0-1)
  } = options;

  // Calculate total samples
  const totalSamples = Math.floor(duration * sampleRate);
  
  // Create buffer for WAV data
  const dataSize = totalSamples * 2; // 16-bit samples = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);
  
  // Write WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);                // PCM format
  buffer.writeUInt16LE(1, 22);                // Mono channel
  buffer.writeUInt32LE(sampleRate, 24);       // Sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28);   // Byte rate (SampleRate * NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(2, 32);                // Block align (NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(16, 34);               // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Generate sound data
  const attackSamples = Math.floor(attack * sampleRate);
  const decaySamples = Math.floor(decay * sampleRate);
  const releaseSamples = Math.floor(release * sampleRate);
  
  // Create echo buffer if needed
  const echoDelaySamples = Math.floor(echo * sampleRate);
  const echoBuffer = echoDelaySamples > 0 ? new Float32Array(echoDelaySamples) : null;
  let echoIndex = 0;
  
  for (let i = 0; i < totalSamples; i++) {
    // Calculate envelope
    let envelope = 0;
    if (i < attackSamples) {
      // Attack phase
      envelope = i / attackSamples;
    } else if (i < attackSamples + decaySamples) {
      // Decay phase
      const decayProgress = (i - attackSamples) / decaySamples;
      envelope = 1 - (1 - sustain) * decayProgress;
    } else if (i < totalSamples - releaseSamples) {
      // Sustain phase
      envelope = sustain;
    } else {
      // Release phase
      const releaseProgress = (i - (totalSamples - releaseSamples)) / releaseSamples;
      envelope = sustain * (1 - releaseProgress);
    }
    
    // Calculate frequency with slide and vibrato
    const timeInSec = i / sampleRate;
    const slideAmount = frequencySlide * timeInSec;
    const vibratoAmount = vibrato * Math.sin(2 * Math.PI * vibratoSpeed * timeInSec);
    const currentFreq = frequency + slideAmount + vibratoAmount;
    
    // Generate basic waveform
    let sample = 0;
    const t = i / sampleRate;
    const phase = currentFreq * t * 2 * Math.PI;
    
    switch (waveType) {
      case 'sine':
        sample = Math.sin(phase);
        break;
      case 'square':
        sample = Math.sin(phase) >= 0 ? 1 : -1;
        break;
      case 'sawtooth':
        sample = 2 * (t * currentFreq - Math.floor(0.5 + t * currentFreq));
        break;
      case 'noise':
        sample = Math.random() * 2 - 1;
        break;
      case 'triangle':
        sample = 2 * Math.abs(2 * (t * currentFreq - Math.floor(t * currentFreq)) - 1) - 1;
        break;
    }
    
    // Apply envelope
    sample *= envelope * volume;
    
    // Apply distortion if needed
    if (distortion > 0) {
      sample *= (1 + distortion);
      if (sample > 1) sample = 1;
      if (sample < -1) sample = -1;
    }
    
    // Apply echo if needed
    if (echoBuffer) {
      const echoSample = echoBuffer[echoIndex];
      sample += echoSample * echoFeedback;
      echoBuffer[echoIndex] = sample;
      echoIndex = (echoIndex + 1) % echoDelaySamples;
    }
    
    // Convert to 16-bit PCM
    const sampleValue = Math.max(-1, Math.min(1, sample)) * 32767;
    buffer.writeInt16LE(Math.floor(sampleValue), 44 + i * 2);
  }
  
  // Save the file with .wav extension
  const wavFilename = filename.replace('.mp3', '.wav');
  fs.writeFileSync(`${SOUNDS_DIR}/${wavFilename}`, buffer);
  console.log(`Created sound: ${wavFilename}`);
}

// Generate game sound effects
function generateSounds() {
  // Laser shoot sound
  generateWavSound('shoot.mp3', {
    duration: 0.2,
    waveType: 'square',
    frequency: 880,
    frequencySlide: -1500,
    volume: 0.7,
    attack: 0.01,
    decay: 0.05,
    sustain: 0.5,
    release: 0.1,
    distortion: 0.2
  });
  
  // Hit sound
  generateWavSound('hit.mp3', {
    duration: 0.15,
    waveType: 'noise',
    frequency: 200,
    frequencySlide: -300,
    volume: 0.6,
    attack: 0.01,
    decay: 0.05,
    sustain: 0.3,
    release: 0.1,
    lowPass: 2000
  });
  
  // Explosion sound
  generateWavSound('explosion.mp3', {
    duration: 0.8,
    waveType: 'noise',
    frequency: 100,
    frequencySlide: -50,
    volume: 0.8,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.6,
    release: 0.5,
    lowPass: 1000,
    distortion: 0.3,
    echo: 0.1,
    echoFeedback: 0.4
  });
  
  // Jump sound
  generateWavSound('jump.mp3', {
    duration: 0.2,
    waveType: 'sine',
    frequency: 300,
    frequencySlide: 600,
    volume: 0.5,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.2,
    release: 0.1
  });
  
  // Coin pickup sound
  generateWavSound('coin.mp3', {
    duration: 0.3,
    waveType: 'sine',
    frequency: 880,
    frequencySlide: 200,
    volume: 0.6,
    attack: 0.01,
    decay: 0.05,
    sustain: 0.6,
    release: 0.2,
    vibrato: 20,
    vibratoSpeed: 10
  });
  
  // Ammo pickup sound
  generateWavSound('ammo.mp3', {
    duration: 0.25,
    waveType: 'square',
    frequency: 440,
    frequencySlide: 100,
    volume: 0.5,
    attack: 0.01,
    decay: 0.05,
    sustain: 0.4,
    release: 0.1,
    highPass: 200
  });
}

// Generate all sounds
generateSounds();

console.log('Sound effects created. Replace with real sound files in production if needed.'); 