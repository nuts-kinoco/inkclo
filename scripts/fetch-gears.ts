/**
 * ✨ INKCLO Gear Fetcher ✨
 * Leanny/splat3 のリポジトリから公式の内部データと画像を完璧に抽出するスクリプト
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'gears');
const TEMP_DATA_PATH = path.join(process.cwd(), 'scripts', 'temp-gears.json');

async function getLatestVersion() {
  const res = await axios.get('https://api.github.com/repos/Leanny/splat3/contents/data/mush', {
    headers: { 'User-Agent': 'Inkclo-App' }
  });
  const folders = res.data
    .filter((f: any) => f.type === 'dir' && /^\d+$/.test(f.name))
    .map((f: any) => parseInt(f.name))
    .sort((a: number, b: number) => b - a);
  
  return folders[0].toString();
}

async function fetchLanguageData() {
  const url = 'https://raw.githubusercontent.com/Leanny/splat3/main/data/language/JPja.json';
  const res = await axios.get(url);
  return res.data;
}

async function downloadImage(internalId: string, category: string, gearId: string): Promise<boolean> {
  const url = `https://raw.githubusercontent.com/Leanny/splat3/main/images/gear/${internalId}.png`;
  const catDir = path.join(OUT_DIR, category);
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
  const localFile = path.join(catDir, `${gearId}.png`);

  if (fs.existsSync(localFile)) return true;

  try {
    const res = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': 'Inkclo-App' },
    });
    await sharp(res.data).png().toFile(localFile);
    return true;
  } catch (error) {
    // console.error(`  ❌ 画像DL失敗: ${internalId} (${url})`);
    return false;
  }
}

async function run() {
  console.log('🔍 最新のゲームバージョンを検索中...');
  const version = await getLatestVersion();
  console.log(`✅ 検出された最新バージョン: ${version}`);

  console.log('📖 日本語言語データを取得中...');
  const langData = await fetchLanguageData();

  const categories = [
    { name: 'head', file: 'GearInfoHead.json', langKey: 'CommonMsg/Gear/GearName_Head', prefix: 'Hed_' },
    { name: 'body', file: 'GearInfoClothes.json', langKey: 'CommonMsg/Gear/GearName_Clothes', prefix: 'Clt_' },
    { name: 'shoes', file: 'GearInfoShoes.json', langKey: 'CommonMsg/Gear/GearName_Shoes', prefix: 'Shs_' },
  ];

  const gears: any[] = [];

  for (const cat of categories) {
    console.log(`\n👕 カテゴリ [${cat.name}] のデータを取得中...`);
    const dataUrl = `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/${cat.file}`;
    const res = await axios.get(dataUrl);
    const items = res.data;

    let catCount = 0;
    for (const item of items) {
      const internalId = item.__RowId; 
      const nameKey = internalId.replace(cat.prefix, '');
      
      let name = langData[cat.langKey]?.[nameKey];
      if (!name) name = item.Label?.trim();
      
      if (!name) continue; 
      if (name.includes('amiibo') || name.includes('アミーボ')) continue;

      let brandName = langData['CommonMsg/Gear/GearBrandName']?.[item.Brand] || item.Brand;

      const gearId = `${cat.name}-${gears.length.toString().padStart(3, '0')}`;
      const imagePath = `/gears/${cat.name}/${gearId}.png`;

      gears.push({
        id: gearId,
        name: name,
        category: cat.name,
        brand: {
          brandId: item.Brand,
          brandName: brandName,
        },
        imagePath: imagePath,
        _internalId: internalId
      });
      catCount++;
    }
    console.log(`   ✅ ${catCount} 件のデータを抽出`);
  }

  console.log(`\n📊 合計 ${gears.length} 件のギアを取得。画像ダウンロードを開始します...`);
  
  let downloaded = 0;
  let skipped = 0;

  for (let i = 0; i < gears.length; i++) {
    const gear = gears[i];
    const ok = await downloadImage(gear._internalId, gear.category, gear.id);
    if (ok) downloaded++;
    else skipped++;
    
    // Progress
    if (i % 100 === 0 && i > 0) process.stdout.write('.');
    
    delete gear._internalId;
    gear.dominantColor = '#FFFFFF';
    gear.palette = [];
    gear.tags = [];
  }

  console.log(`\n   📥 ダウンロード: ${downloaded} 件 / エラー(または既存): ${skipped} 件`);

  const sauna = gears.find(g => g.name.includes('サウナ'));
  if (sauna) {
    console.log(`\n🎉 【大成功】サウナハットを発見しました！`);
    console.log(sauna);
  } else {
    console.log(`\n⚠️ サウナハットが見つかりませんでした...`);
  }

  fs.writeFileSync(TEMP_DATA_PATH, JSON.stringify({ gears }, null, 2));
  console.log(`\n💾 ${TEMP_DATA_PATH} に出力完了！`);
}

run().catch(e => console.error('Error:', e));
