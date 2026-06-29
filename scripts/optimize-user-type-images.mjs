import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, 'assets/user-type-sources');
const outDir = path.resolve(__dirname, '../public/images/user-types');

const jobs = [
  ['user-type-landlords-source.png', 'landlords.webp'],
  ['user-type-developers-source.png', 'developers.webp'],
  ['user-type-agents-source.png', 'agents.webp'],
  ['user-type-buyers-source.png', 'buyers.webp'],
];

await mkdir(outDir, { recursive: true });

for (const [srcName, outName] of jobs) {
  const src = path.join(assetsDir, srcName);
  const dest = path.join(outDir, outName);
  await sharp(src)
    .resize(960, 600, { fit: 'cover', position: 'centre' })
    .webp({ quality: 78, effort: 6 })
    .toFile(dest);
  const stats = await sharp(dest).metadata();
  const fs = await import('fs/promises');
  const { size } = await fs.stat(dest);
  console.log(`${outName}: ${Math.round(size / 1024)} KB (${stats.width}x${stats.height})`);
}
