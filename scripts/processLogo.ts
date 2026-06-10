import sharp from 'sharp';
import path from 'path';

const inputPath = 'C:\\Users\\0020223515\\.gemini\\antigravity\\brain\\c3102ca1-91ef-4695-a36b-373ff90c1f83\\media__1781076605725.png';
const logoPath = path.join(process.cwd(), 'public', 'logo.png');
const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');

async function processImage() {
  try {
    // Red square bounding box: x=367, y=137, w=290, h=285
    // Make it a perfect square: 290x290
    
    await sharp(inputPath)
      .extract({ left: 367, top: 135, width: 290, height: 290 })
      .resize(128, 128)
      .toFile(logoPath);

    await sharp(inputPath)
      .extract({ left: 367, top: 135, width: 290, height: 290 })
      .resize(32, 32)
      .toFormat('png')
      .toFile(faviconPath);

    console.log('Image processed successfully!');
  } catch (err) {
    console.error('Error processing image:', err);
  }
}

processImage();
