import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoPath = path.resolve(__dirname, '../public/keyboard.mp4');
const outDir = path.resolve(__dirname, '../public/assets/frames');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Clean existing files
const existing = fs.readdirSync(outDir);
for (const file of existing) {
  fs.unlinkSync(path.join(outDir, file));
}

console.log('Using ffmpeg path:', ffmpegPath);
console.log('Video path:', videoPath);
console.log('Output dir:', outDir);

// Use -vcodec libwebp and -loop 0 or image sequence muxer
const args = [
  '-y',
  '-i', videoPath,
  '-vf', "fps=30,scale='min(1920,iw)':-2",
  '-c:v', 'libwebp',
  '-lossless', '0',
  '-compression_level', '4',
  '-q:v', '80',
  '-f', 'image2',
  path.join(outDir, 'frame_%04d.webp')
];

console.log('Executing:', ffmpegPath, args.join(' '));
const proc = spawn(ffmpegPath, args);

proc.stdout.on('data', (d) => console.log(d.toString()));
proc.stderr.on('data', (d) => console.error(d.toString()));

proc.on('close', (code) => {
  console.log(`ffmpeg process finished with code ${code}`);
  if (code === 0) {
    const files = fs.readdirSync(outDir).filter(f => f.endsWith('.webp'));
    console.log(`Successfully extracted ${files.length} frames.`);
    if (files.length > 0) {
      console.log(`Sample frame: ${files[0]}, Last frame: ${files[files.length - 1]}`);
      const stats = fs.statSync(path.join(outDir, files[0]));
      console.log(`Frame 0 size: ${(stats.size / 1024).toFixed(2)} KB`);
    }
  }
});
