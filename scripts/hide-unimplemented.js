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

  let allImplementedGearNames = new Set();

  for (const url of urls) {
    console.log('Fetching', url);
    const html = await fetchUrl(url);
    
    // We are looking for gear names. Gamewith usually has tables with gear names in anchors or specific classes.
    // Example: <a href=".../article/show/123">アセストップソシナ</a>
    // Or it might be inside <td>
    // Let's just extract all strings inside <a ...>...</a> and <th>...</th> that might be gear names.
    // Actually, a more robust way without DOM parsing:
    // Regex for typical Gamewith Splatoon 3 gear tables:
    // Usually they have a row with the gear name as an anchor.
    // <td class="w-200"> <a href="...">ギア名</a> </td>
    const matches = [...html.matchAll(/<a href="[^"]*">([^<]+)<\/a>/g)];
    for (const match of matches) {
      const name = match[1].trim();
      if (name.length > 0 && name.length < 30) { // arbitrary length check
        allImplementedGearNames.add(name);
      }
    }
  }

  console.log(`Extracted ${allImplementedGearNames.size} potential gear names from Wiki.`);

  const gearsPath = path.join(__dirname, '../src/lib/data/gears.json');
  const gearsData = JSON.parse(fs.readFileSync(gearsPath, 'utf8'));

  let hiddenCount = 0;
  let unhiddenCount = 0;

  for (const gear of gearsData.gears) {
    if (!allImplementedGearNames.has(gear.name)) {
      // It's not in the wiki list
      if (!gear.isHidden) {
        gear.isHidden = true;
        hiddenCount++;
        console.log('Hiding:', gear.name);
      }
    } else {
      if (gear.isHidden) {
        gear.isHidden = false;
        unhiddenCount++;
      }
    }
  }

  console.log(`Hidden ${hiddenCount} gears. Unhidden ${unhiddenCount} gears.`);
  
  if (hiddenCount > 0 || unhiddenCount > 0) {
    fs.writeFileSync(gearsPath, JSON.stringify(gearsData, null, 2));
    console.log('Updated gears.json successfully.');
  } else {
    console.log('No changes needed.');
  }
}

main().catch(console.error);
