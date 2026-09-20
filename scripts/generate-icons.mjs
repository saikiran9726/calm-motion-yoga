import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const svgSource = path.join(rootDir, 'public', 'pwa-512x512.svg');

async function generateIcons() {
  if (!fs.existsSync(svgSource)) {
    console.error('SVG source not found:', svgSource);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgSource);

  const targets = [
    { name: 'pwa-192x192.png', width: 192, height: 192 },
    { name: 'pwa-512x512.png', width: 512, height: 512 },
    { name: 'apple-touch-icon.png', width: 180, height: 180 },
  ];

  for (const target of targets) {
    const dest = path.join(rootDir, 'public', target.name);
    await sharp(svgBuffer)
      .resize(target.width, target.height)
      .png()
      .toFile(dest);
    const stats = fs.statSync(dest);
    console.log(`✓ Generated ${target.name} (${target.width}x${target.height}, ${stats.size} bytes)`);
  }
}

generateIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
