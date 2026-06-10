const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const res = await axios.get('https://wikiwiki.jp/splatoon3mix/%E3%82%AE%E3%82%A2%E3%83%AA%E3%82%B9%E3%83%88', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const $ = cheerio.load(res.data);
  const rows = $('table tbody tr').slice(0, 10);
  rows.each((i, row) => {
    console.log(`\n--- Row ${i} ---`);
    const cols = $(row).find('td');
    cols.each((j, col) => {
      console.log(`Col ${j}: text='${$(col).text().trim()}', img='${$(col).find('img').attr('src')}'`);
    });
  });
}
test();
