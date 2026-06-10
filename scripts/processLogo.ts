import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const inputPath = 'C:\\Users\\0020223515\\.gemini\\antigravity\\brain\\c3102ca1-91ef-4695-a36b-373ff90c1f83\\media__1781076605725.png';
const logoPath = path.join(process.cwd(), 'public', 'logo.png');
const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');

async function processImage() {
  try {
    // Logo: Resize to 128x128 or just keep it clean and square
    // It looks like the original image has a dark background. Let's just resize it for now.
    // Wait, the user said "clean it up". I might just extract the center or trim it, 
    // but sharp's trim can do that automatically if the background is solid.
    await sharp(inputPath)
      .trim({ threshold: 10 }) // Trims borders
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(logoPath);

    // Favicon (usually 32x32 ico or png, we can just save as 32x32 ico or png and rename to .ico)
    // Actually, sharp can output png, and browser supports png favicons if named favicon.ico or linked as png.
    // Let's just output 32x32 png
    await sharp(inputPath)
      .trim({ threshold: 10 })
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFormat('png')
      .toFile(faviconPath);

    console.log('Image processed successfully!');
  } catch (err) {
    console.error('Error processing image:', err);
  }
}

processImage();
