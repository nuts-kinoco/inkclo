import fs from 'fs';
import path from 'path';
import Vibrant from 'node-vibrant';
import { deltaE } from '../src/lib/colorUtils';

const TEMP_DATA_PATH = path.join(process.cwd(), 'scripts', 'temp-gears.json');
const FINAL_DATA_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'gears.json');

const BASIC_COLORS = [
  { id: 'color:black', hex: '#000000' },
  { id: 'color:white', hex: '#FFFFFF' },
  { id: 'color:red', hex: '#FF0000' },
  { id: 'color:blue', hex: '#0000FF' },
  { id: 'color:green', hex: '#00FF00' },
  { id: 'color:yellow', hex: '#FFFF00' },
  { id: 'color:orange', hex: '#FFA500' },
  { id: 'color:purple', hex: '#800080' },
  { id: 'color:pink', hex: '#FFC0CB' },
  { id: 'color:brown', hex: '#A52A2A' }
];

async function extractColors() {
  if (!fs.existsSync(TEMP_DATA_PATH)) {
    console.error('temp-gears.json not found. Run scrape.ts first.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(TEMP_DATA_PATH, 'utf-8'));
  const gears = data.gears;

  for (const gear of gears) {
    const imagePath = path.join(process.cwd(), 'public', gear.imagePath);
    if (!fs.existsSync(imagePath)) {
      console.warn(`Image missing for ${gear.name}`);
      continue;
    }

    try {
      console.log(`Extracting colors for ${gear.name}...`);
      const palette = await Vibrant.from(imagePath).getPalette();
      
      const swatches = [
        palette.Vibrant,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.Muted,
        palette.DarkMuted,
        palette.LightMuted
      ].filter(Boolean); // remove nulls

      // Sort by population
      swatches.sort((a, b) => (b?.population || 0) - (a?.population || 0));

      const totalPopulation = swatches.reduce((sum, s) => sum + (s?.population || 0), 0);

      const colorPalette = swatches.slice(0, 5).map(s => ({
        color: s!.hex,
        ratio: Math.round(((s!.population || 0) / totalPopulation) * 100) / 100
      }));

      gear.palette = colorPalette;
      gear.dominantColor = colorPalette.length > 0 ? colorPalette[0].color : '#FFFFFF';

      // Auto-generate tags based on Delta E
      const tags = new Set<string>();
      for (const p of colorPalette) {
        // Find closest basic color
        let minDistance = 999;
        let closestColorId = '';
        
        for (const basic of BASIC_COLORS) {
          const distance = deltaE(p.color, basic.hex);
          if (distance < minDistance) {
            minDistance = distance;
            closestColorId = basic.id;
          }
        }

        // If distance is reasonable (e.g. Delta E < 30), add it
        if (minDistance < 30) {
          tags.add(closestColorId);
        }
      }

      gear.tags = Array.from(tags);
    } catch (e) {
      console.error(`Error extracting colors for ${gear.name}:`, e);
    }
  }

  fs.writeFileSync(FINAL_DATA_PATH, JSON.stringify({ gears }, null, 2));
  console.log(`Color extraction completed. Wrote final data to gears.json`);
}

extractColors();
