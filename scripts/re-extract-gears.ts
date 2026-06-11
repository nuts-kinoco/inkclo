import fs from 'fs';
import path from 'path';
import { extractColorsFromImage } from './color-extractor';
import { Gear } from '../src/types';

const DATA_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'gears.json');

async function run() {
  console.log('🔄 既存ギアのカラー情報を新アルゴリズムで再抽出します...');
  
  if (!fs.existsSync(DATA_PATH)) {
    console.error('gears.json が見つかりません。');
    return;
  }

  const rawData = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(rawData);
  const gears: Gear[] = data.gears;

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < gears.length; i++) {
    const gear = gears[i];
    const imagePath = path.join(process.cwd(), 'public', gear.imagePath);

    if (!fs.existsSync(imagePath)) {
      console.warn(`[WARN] 画像が見つかりません: ${gear.name} (${imagePath})`);
      failCount++;
      continue;
    }

    try {
      const { dominantColor, palette } = await extractColorsFromImage(imagePath);
      gear.dominantColor = dominantColor;
      gear.palette = palette;
      
      // We do not re-generate tags here, we leave existing tags intact
      
      successCount++;
      
      if (i % 50 === 0 && i > 0) {
        process.stdout.write(`\n✅ ${i}件完了... `);
      } else {
        process.stdout.write('.');
      }
    } catch (e) {
      console.error(`\n[ERROR] 抽出失敗 ${gear.name}:`, e);
      failCount++;
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify({ gears }, null, 2));
  console.log(`\n🎉 再抽出完了！ 成功: ${successCount}件 / 失敗: ${failCount}件`);
}

run().catch(e => console.error(e));
