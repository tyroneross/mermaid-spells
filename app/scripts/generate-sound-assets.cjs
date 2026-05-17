const fs = require("fs");
const path = require("path");

const sampleRate = 44100;
const maxAmplitude = 0.26;
const outputDir = path.join(__dirname, "..", "assets", "sounds");

const sounds = {
  "tap.wav": [
    { frequency: 523.25, start: 0, duration: 0.07, volume: 0.55 },
  ],
  "correct.wav": [
    { frequency: 659.25, start: 0, duration: 0.13, volume: 0.7 },
    { frequency: 880, start: 0.11, duration: 0.18, volume: 0.72 },
  ],
  "wrong.wav": [
    { frequency: 246.94, start: 0, duration: 0.15, volume: 0.45 },
    { frequency: 196, start: 0.13, duration: 0.2, volume: 0.42 },
  ],
  "celebration.wav": [
    { frequency: 523.25, start: 0, duration: 0.13, volume: 0.66 },
    { frequency: 659.25, start: 0.11, duration: 0.13, volume: 0.66 },
    { frequency: 783.99, start: 0.22, duration: 0.13, volume: 0.66 },
    { frequency: 1046.5, start: 0.33, duration: 0.23, volume: 0.7 },
  ],
};

function envelope(time, duration) {
  const attack = 0.012;
  const release = 0.035;
  if (time < attack) return time / attack;
  if (time > duration - release) return Math.max(0, (duration - time) / release);
  return 1;
}

function writeUInt32LE(buffer, value, offset) {
  buffer.writeUInt32LE(value, offset);
}

function writeUInt16LE(buffer, value, offset) {
  buffer.writeUInt16LE(value, offset);
}

function createWav(steps) {
  const totalSeconds = Math.max(...steps.map((step) => step.start + step.duration)) + 0.08;
  const totalSamples = Math.ceil(totalSeconds * sampleRate);
  const dataBytes = totalSamples * 2;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write("RIFF", 0);
  writeUInt32LE(buffer, 36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  writeUInt32LE(buffer, 16, 16);
  writeUInt16LE(buffer, 1, 20);
  writeUInt16LE(buffer, 1, 22);
  writeUInt32LE(buffer, sampleRate, 24);
  writeUInt32LE(buffer, sampleRate * 2, 28);
  writeUInt16LE(buffer, 2, 32);
  writeUInt16LE(buffer, 16, 34);
  buffer.write("data", 36);
  writeUInt32LE(buffer, dataBytes, 40);

  for (let i = 0; i < totalSamples; i += 1) {
    const absoluteTime = i / sampleRate;
    let sample = 0;

    for (const step of steps) {
      const localTime = absoluteTime - step.start;
      if (localTime < 0 || localTime > step.duration) continue;
      const tone = Math.sin(2 * Math.PI * step.frequency * localTime);
      sample += tone * envelope(localTime, step.duration) * step.volume;
    }

    const shaped = Math.tanh(sample) * maxAmplitude;
    buffer.writeInt16LE(Math.round(shaped * 32767), 44 + i * 2);
  }

  return buffer;
}

fs.mkdirSync(outputDir, { recursive: true });

for (const [filename, steps] of Object.entries(sounds)) {
  fs.writeFileSync(path.join(outputDir, filename), createWav(steps));
}

console.log(`Generated ${Object.keys(sounds).length} sound assets in ${outputDir}`);
