const fs = require('fs');
const https = require('https');
const path = require('path');

const fetchUrl = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => resolve(data));
  }).on('error', reject);
});

async function main() {
  const urls = [
    'https://gamewith.jp/splatoon3/362079', // Head
    'https://gamewith.jp/splatoon3/362080', // Body
    'https://gamewith.jp/splatoon3/362081'  // Shoes
  ];

  let combinedHtml = '';
  for (const url of urls) {
    console.log('Fetching', url);
    combinedHtml += await fetchUrl(url);
  }

  const gearsPath = path.join(__dirname, '../src/lib/data/gears.json');
  const gearsData = JSON.parse(fs.readFileSync(gearsPath, 'utf8'));

  let hiddenCount = 0;
  let unhiddenCount = 0;

  for (const gear of gearsData.gears) {
    // Some wiki names might have slightly different spaces or characters, but exact match is usually best
    if (!combinedHtml.includes(gear.name)) {
      gear.isHidden = true;
      hiddenCount++;
      console.log('Hiding:', gear.name);
    } else {
      if (gear.isHidden) {
        gear.isHidden = false;
        unhiddenCount++;
      } else {
        // do nothing, was already visible
      }
    }
  }

  console.log(`Hidden ${hiddenCount} gears. Unhidden ${unhiddenCount} gears.`);
  
  fs.writeFileSync(gearsPath, JSON.stringify(gearsData, null, 2));
  console.log('Updated gears.json successfully.');
}

main().catch(console.error);
