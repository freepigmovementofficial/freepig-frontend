import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '../src/assets');

async function optimizeImages() {
  const files = fs.readdirSync(assetsDir);
  let optimizedCount = 0;

  for (const file of files) {
    if (file.match(/\.(png|jpg|jpeg)$/i)) {
      const inputPath = path.join(assetsDir, file);
      const ext = path.extname(file);
      const basename = path.basename(file, ext);
      const outputPath = path.join(assetsDir, `${basename}.webp`);

      try {
        console.log(`Optimizing ${file}...`);
        await sharp(inputPath)
          .webp({ quality: 80 }) 
          .toFile(outputPath);
        
        console.log(`✅ Created ${basename}.webp`);
        optimizedCount++;
      } catch (err) {
        console.error(`❌ Error optimizing ${file}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 Optimization complete! Converted ${optimizedCount} images to WebP.`);
}

optimizeImages();
