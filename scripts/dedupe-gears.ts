import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'gears.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const gears = data.gears;

function normalizeName(name: string): string {
  // Convert full-width alphanumeric to half-width
  let n = name.replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  
  // Replace 10 with テン, remove middle dot and spaces
  n = n.replace(/10/g, 'テン');
  n = n.replace(/[・\s　]/g, '');
  return n;
}

const uniqueGears = new Map<string, any>();
let dupCount = 0;

for (const gear of gears) {
  const normName = normalizeName(gear.name);
  
  if (uniqueGears.has(normName)) {
    // Duplicate found! Merge tags.
    const existing = uniqueGears.get(normName);
    console.log(`Duplicate found: [${gear.name}] (normalized: ${normName})`);
    console.log(`  Merging into existing: [${existing.name}]`);
    
    // Merge manual tags
    if (gear.manualTags && gear.manualTags.length > 0) {
      existing.manualTags = existing.manualTags || [];
      for (const tag of gear.manualTags) {
        if (!existing.manualTags.includes(tag)) {
          existing.manualTags.push(tag);
        }
      }
    }
    dupCount++;
  } else {
    uniqueGears.set(normName, gear);
  }
}

data.gears = Array.from(uniqueGears.values());
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`\n✅ Deduplication complete! Merged and removed ${dupCount} duplicates.`);
console.log(`Total gears remaining: ${data.gears.length}`);
