import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const URL = 'https://wikiwiki.jp/splatoon3mix/%E3%82%AE%E3%82%A2/%E3%83%96%E3%83%A9%E3%83%B3%E3%83%89';
const OUT_DIR = path.join(process.cwd(), 'public', 'brands');
const OUT_DATA = path.join(process.cwd(), 'src', 'lib', 'data', 'brands.json');

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
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  try {
    const { data } = await axios.get(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    const brands: { id: string; name: string; imagePath: string }[] = [];

    $('table tbody tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 2) {
        const img = $(cols[0]).find('img');
        let src = img.attr('data-src') || img.attr('src');
        let name = $(cols[1]).text().trim();
        
        if (!src) {
           const anyImg = $(row).find('img').first();
           src = anyImg.attr('data-src') || anyImg.attr('src');
        }
        if (!name) {
           name = $(row).find('a').first().text().trim();
        }
        
        if (name && src && !name.includes('amiibo')) {
          if (src.startsWith('//')) src = 'https:' + src;
          else if (src.startsWith('/')) src = 'https://wikiwiki.jp' + src;
          
          // Use name directly as ID if it's safe, but better to map it or just use it. 
          // All brands are in Japanese katakana usually.
          const brandId = name;
          brands.push({ id: brandId, name, imagePath: `/brands/${brandId}.png`, _src: src } as any);
        }
      }
    });

    console.log(`Found ${brands.length} brands. Downloading images...`);

    const finalBrands = [];
    for (const brand of brands) {
      const src = (brand as any)._src;
      const localFile = path.join(OUT_DIR, `${brand.id}.png`);
      console.log(`Downloading: ${brand.name}`);
      await downloadImage(src, localFile);
      
      finalBrands.push({
        id: brand.id,
        name: brand.name,
        imagePath: brand.imagePath
      });
    }

    // Deduplicate just in case
    const uniqueBrands = Array.from(new Map(finalBrands.map(b => [b.id, b])).values());

    fs.writeFileSync(OUT_DATA, JSON.stringify({ brands: uniqueBrands }, null, 2));
    console.log(`Saved ${uniqueBrands.length} brands to ${OUT_DATA}`);

  } catch(e) {
    console.error(`Scrape failed:`, e);
  }
}

scrape();
