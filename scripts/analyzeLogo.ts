import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'C:\\Users\\0020223515\\.gemini\\antigravity\\brain\\c3102ca1-91ef-4695-a36b-373ff90c1f83\\media__1781076605725.png';

async function analyze() {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  
  // Find background color (top-left pixel)
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  console.log(`Background color: RGB(${bgR}, ${bgG}, ${bgB}), Image size: ${info.width}x${info.height}`);

  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      if (diff > 50) { // Threshold for non-background
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Bounding box: x=${minX}, y=${minY}, w=${maxX - minX + 1}, h=${maxY - minY + 1}`);
  
  // Let's also find the bounding box for the red square (r > 150, g < 100, b < 100)
  let rMinX = info.width, rMinY = info.height, rMaxX = 0, rMaxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      if (r > 150 && g < 100 && b < 100) {
        if (x < rMinX) rMinX = x;
        if (y < rMinY) rMinY = y;
        if (x > rMaxX) rMaxX = x;
        if (y > rMaxY) rMaxY = y;
      }
    }
  }
  console.log(`Red square bounding box: x=${rMinX}, y=${rMinY}, w=${rMaxX - rMinX + 1}, h=${rMaxY - rMinY + 1}`);

}

analyze().catch(console.error);
