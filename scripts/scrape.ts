import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://wikiwiki.jp/splatoon3mix/%E3%82%AE%E3%82%A2%E3%83%AA%E3%82%B9%E3%83%88';
const OUT_DIR = path.join(process.cwd(), 'public', 'gears');
const TEMP_DATA_PATH = path.join(process.cwd(), 'scripts', 'temp-gears.json');

import sharp from 'sharp';

// Helper to download image and convert to true PNG
async function downloadImage(url: string, filepath: string) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    // wikiwiki returns webp often even with .png extensions, so force convert to true PNG
    await sharp(response.data)
      .png()
      .toFile(filepath);
      
    return true;
  } catch (error) {
    console.error(`Failed to download and convert ${url}`);
    return false;
  }
}

async function scrape() {
  const gears: any[] = [];
  
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  try {
    console.log(`Scraping URL: ${TARGET_URL}...`);
    const { data } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    // wikiwiki.jp/splatoon3mix/ギアリスト
    // Tables for Head, Body, Shoes. We will just parse all rows and try to infer category or just put them in 'unknown' if we can't.
    // Actually, let's just find all rows that look like gear rows.
    
    // In many wiki pages, tables are preceded by headers. 
    // We can iterate through tables.
    const tables = $('h2, h3, table');
    let currentCategory = 'head'; // Default
    
    tables.each((i, el) => {
      if (el.tagName === 'h2' || el.tagName === 'h3') {
        const title = $(el).text();
        if (title.includes('アタマ')) currentCategory = 'head';
        else if (title.includes('フク')) currentCategory = 'body';
        else if (title.includes('クツ')) currentCategory = 'shoes';
      } else if (el.tagName === 'table') {
        // Parse rows of this table
        const rows = $(el).find('tbody tr');
        let count = 0;

        rows.each((_, row) => {
          const cols = $(row).find('td');
          // A gear row usually has many columns (ability, image, name, brand, etc)
          if (cols.length >= 8) {
            const imgTag = $(cols[1]).find('img');
            let imgSrc = imgTag.attr('data-src') || imgTag.attr('src');
            const name = $(cols[2]).text().trim();
            const brandName = $(cols[3]).text().trim();

            if (imgSrc && name && brandName && !name.includes('amiibo')) {
              if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
              else if (imgSrc.startsWith('/')) imgSrc = 'https://wikiwiki.jp' + imgSrc;

              const gearId = `${currentCategory}-${gears.length.toString().padStart(3, '0')}`;
              const catDir = path.join(OUT_DIR, currentCategory);
              if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
              
              const imagePath = `/gears/${currentCategory}/${gearId}.png`;
              const localFile = path.join(catDir, `${gearId}.png`);

              // Download later, just push to array to not block event loop entirely
              gears.push({
                id: gearId,
                name,
                category: currentCategory,
                brand: {
                  brandId: brandName,
                  brandName
                },
                imagePath,
                imgSrc, // temporary
                localFile // temporary
              });
              count++;
            }
          }
        });
      }
    });

    console.log(`Found ${gears.length} gears. Downloading images...`);
    
    for (const gear of gears) {
      console.log(`Downloading: ${gear.name} (${gear.brand.brandName})`);
      await downloadImage(gear.imgSrc, gear.localFile);
      delete gear.imgSrc;
      delete gear.localFile;
      gear.dominantColor = '#FFFFFF';
      gear.palette = [];
      gear.tags = [];
    }

    fs.writeFileSync(TEMP_DATA_PATH, JSON.stringify({ gears }, null, 2));
    console.log(`Scraping completed. Wrote ${gears.length} gears to temp-gears.json`);

  } catch (e) {
    console.error(`Failed to scrape:`, e);
  }
}

scrape();
