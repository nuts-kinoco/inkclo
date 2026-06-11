import fs from 'fs';
import path from 'path';
import { extractColorsFromImage } from './color-extractor';
import { Weapon } from '../src/types/weapon';

const TEMP_DATA_PATH = path.join(process.cwd(), 'scripts', 'temp-weapons.json');
const FINAL_DATA_PATH = path.join(process.cwd(), 'src', 'lib', 'data', 'weapons.json');

async function run() {
  console.log('🎨 ブキのカラー情報を抽出します...');
  
  if (!fs.existsSync(TEMP_DATA_PATH)) {
    console.error('temp-weapons.json が見つかりません。先に fetch-weapons.ts を実行してください。');
    return;
  }

  const rawData = fs.readFileSync(TEMP_DATA_PATH, 'utf-8');
  const data = JSON.parse(rawData);
  const weapons: Weapon[] = data.weapons;

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < weapons.length; i++) {
    const weapon = weapons[i];
    const imagePath = path.join(process.cwd(), 'public', weapon.imagePath);

    if (!fs.existsSync(imagePath)) {
      console.warn(`[WARN] 画像が見つかりません: ${weapon.name} (${imagePath})`);
      failCount++;
      continue;
    }

    try {
      const { dominantColor, palette } = await extractColorsFromImage(imagePath);
      weapon.dominantColor = dominantColor;
      weapon.palette = palette;
      
      successCount++;
      
      if (i % 10 === 0 && i > 0) {
        process.stdout.write(`\n✅ ${i}件完了... `);
      } else {
        process.stdout.write('.');
      }
    } catch (e) {
      console.error(`\n[ERROR] 抽出失敗 ${weapon.name}:`, e);
      failCount++;
    }
  }

  fs.writeFileSync(FINAL_DATA_PATH, JSON.stringify({ weapons }, null, 2));
  console.log(`\n🎉 抽出完了！ 成功: ${successCount}件 / 失敗: ${failCount}件`);
  console.log(`💾 最終データ: ${FINAL_DATA_PATH}`);
}

run().catch(e => console.error(e));
