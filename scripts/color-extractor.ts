import sharp from 'sharp';
import { hexToRgb, deltaE } from '../src/lib/colorUtils';

/**
 * Converts RGB array to Hex string
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * High-quality color extraction using K-Means++ in CIELAB color space.
 * 
 * 1. Resizes image to speed up processing (max 100x100)
 * 2. Ignores transparent or semi-transparent pixels (Alpha < 250)
 * 3. Uses K-Means++ initialization to find distinct visual colors
 * 4. Clusters pixels using perceptual deltaE distance
 * 5. Ensures percentages sum exactly to 100%
 */
export async function extractColorsFromImage(
  imagePath: string,
  k: number = 5
): Promise<{ dominantColor: string, palette: { color: string, ratio: number }[] }> {
  
  // 1. Load image and extract raw RGBA pixels (downsampled for speed)
  const { data, info } = await sharp(imagePath)
    .resize(100, 100, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: { hex: string, rgb: [number, number, number] }[] = [];
  const uniqueHexToRgb = new Map<string, [number, number, number]>();

  // 2. Filter opaque pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Ignore transparent and semi-transparent pixels (anti-aliasing)
    // Splatoon gear images often have slight black halos around transparent edges,
    // so we strictly require high alpha.
    if (a >= 250) {
      const hex = rgbToHex(r, g, b);
      pixels.push({ hex, rgb: [r, g, b] });
      if (!uniqueHexToRgb.has(hex)) {
        uniqueHexToRgb.set(hex, [r, g, b]);
      }
    }
  }

  if (pixels.length === 0) {
    throw new Error('No opaque pixels found in image');
  }

  // 3. K-Means++ Initialization
  const centroids: string[] = [];
  
  // Pick first centroid randomly from unique colors to avoid picking the same background pixel repeatedly
  const uniqueHexes = Array.from(uniqueHexToRgb.keys());
  centroids.push(uniqueHexes[Math.floor(Math.random() * uniqueHexes.length)]);

  for (let i = 1; i < k; i++) {
    const distances = uniqueHexes.map(hex => {
      let minDistance = Infinity;
      for (const centroid of centroids) {
        const d = deltaE(hex, centroid);
        if (d < minDistance) minDistance = d;
      }
      return minDistance * minDistance; // D(x)^2
    });

    const sumDistances = distances.reduce((a, b) => a + b, 0);
    if (sumDistances === 0) {
      // All colors are identical to existing centroids
      break; 
    }

    let r = Math.random() * sumDistances;
    for (let j = 0; j < uniqueHexes.length; j++) {
      r -= distances[j];
      if (r <= 0) {
        centroids.push(uniqueHexes[j]);
        break;
      }
    }
  }

  // 4. K-Means Clustering
  const maxIterations = 20;
  let assignments = new Int32Array(pixels.length);
  let currentCentroids = [...centroids];

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    let changed = false;
    for (let i = 0; i < pixels.length; i++) {
      const px = pixels[i];
      let minDist = Infinity;
      let bestCentroidIndex = 0;
      
      for (let c = 0; c < currentCentroids.length; c++) {
        const d = deltaE(px.hex, currentCentroids[c]);
        if (d < minDist) {
          minDist = d;
          bestCentroidIndex = c;
        }
      }
      
      if (assignments[i] !== bestCentroidIndex) {
        assignments[i] = bestCentroidIndex;
        changed = true;
      }
    }

    if (!changed) break;

    // Recalculate centroids
    const newCentroidRGB = Array(currentCentroids.length).fill(0).map(() => [0, 0, 0, 0]); // r, g, b, count
    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i];
      const rgb = pixels[i].rgb;
      newCentroidRGB[c][0] += rgb[0];
      newCentroidRGB[c][1] += rgb[1];
      newCentroidRGB[c][2] += rgb[2];
      newCentroidRGB[c][3]++; // count
    }

    currentCentroids = newCentroidRGB.map(sum => {
      if (sum[3] === 0) return currentCentroids[newCentroidRGB.indexOf(sum)]; // Handle empty cluster
      const r = sum[0] / sum[3];
      const g = sum[1] / sum[3];
      const b = sum[2] / sum[3];
      return rgbToHex(r, g, b);
    });
  }

  // 5. Calculate percentages and format output
  const clusterCounts = Array(currentCentroids.length).fill(0);
  for (let i = 0; i < pixels.length; i++) {
    clusterCounts[assignments[i]]++;
  }

  let palette = currentCentroids.map((color, index) => ({
    color,
    count: clusterCounts[index]
  }))
  .filter(p => p.count > 0)
  .sort((a, b) => b.count - a.count); // Descending by count

  const totalPixels = pixels.length;
  let runningRatio = 0;
  
  const finalPalette = palette.map((p, i) => {
    // Exact ratio calculation ensuring sum is exactly 1.00
    if (i === palette.length - 1) {
      return { color: p.color, ratio: Math.round((1.00 - runningRatio) * 100) / 100 };
    }
    const ratio = Math.round((p.count / totalPixels) * 100) / 100;
    runningRatio += ratio;
    return { color: p.color, ratio };
  }).filter(p => p.ratio > 0);

  // If runningRatio exceeded 1.00 due to rounding, fix it by adjusting the largest cluster
  const totalRatio = finalPalette.reduce((sum, p) => sum + p.ratio, 0);
  if (Math.abs(1.00 - totalRatio) > 0.001 && finalPalette.length > 0) {
    const diff = 1.00 - totalRatio;
    finalPalette[0].ratio = Math.round((finalPalette[0].ratio + diff) * 100) / 100;
  }

  // Double check any negative ratios that might have occurred from the diff math (rare but possible)
  finalPalette.forEach(p => {
    if (p.ratio <= 0) p.ratio = 0.01;
  });
  
  // Re-verify sum is 1.00 after safety checks
  const safetySum = finalPalette.reduce((sum, p) => sum + p.ratio, 0);
  if (Math.abs(1.00 - safetySum) > 0.001 && finalPalette.length > 1) {
      finalPalette[0].ratio = Math.round((finalPalette[0].ratio + (1.00 - safetySum)) * 100) / 100;
  }

  return {
    dominantColor: finalPalette.length > 0 ? finalPalette[0].color : '#FFFFFF',
    palette: finalPalette
  };
}
