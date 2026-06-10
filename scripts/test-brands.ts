import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://wikiwiki.jp/splatoon3mix/%E3%82%AE%E3%82%A2/%E3%83%96%E3%83%A9%E3%83%B3%E3%83%89';

async function test() {
  try {
    const { data } = await axios.get(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    const brands = [];

    // The brand logos are usually in the first column of the tables
    $('table tbody tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 2) {
        const img = $(cols[0]).find('img');
        let src = img.attr('data-src') || img.attr('src');
        let name = $(cols[1]).text().trim();
        // Sometimes name is in cols[0] and img in cols[1], let's just search the whole row
        if (!src) {
           const anyImg = $(row).find('img').first();
           src = anyImg.attr('data-src') || anyImg.attr('src');
        }
        if (!name) {
           name = $(row).find('a').first().text().trim();
        }
        
        if (name && src) {
          if (src.startsWith('//')) src = 'https:' + src;
          else if (src.startsWith('/')) src = 'https://wikiwiki.jp' + src;
          
          if (name.includes('amiibo')) return;
          brands.push({ name, src });
        }
      }
    });
    console.log(brands.slice(0, 10));
  } catch(e) {
    console.error(e.message);
  }
}

test();
