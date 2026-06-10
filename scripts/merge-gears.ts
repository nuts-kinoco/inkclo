/**
 * 🛠️ INKCLO Gear Database Merger & Cleanser 🛠️
 * 既存の gears.json の整合性を完全に維持したまま、
 * 解析データ (Leanny/splat3) から不足している最新ギアのみを抽出し、
 * 公式画像と共に安全にマージするスクリプト。
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

const GEARS_JSON_PATH = path.join(process.cwd(), 'src', 'lib/data/gears.json');
const OUT_DIR = path.join(process.cwd(), 'public', 'gears');

// 名前の正規化（全角半角の統一、スペース削除、大文字小文字の統一）
function normalizeName(name: string): string {
  return name
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .toLowerCase();
}

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

// 画像をダウンロードし、ドミナントカラーを計算する
async function downloadAndProcessImage(internalId: string, category: string, gearId: string): Promise<{ ok: boolean, dominantColor: string, palette: any[] }> {
  const url = `https://raw.githubusercontent.com/Leanny/splat3/main/images/gear/${internalId}.png`;
  const catDir = path.join(OUT_DIR, category);
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
  const localFile = path.join(catDir, `${gearId}.png`);

  try {
    const res = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': 'Inkclo-App' },
    });

    const buffer = Buffer.from(res.data);
    
    // sharp を使って保存
    await sharp(buffer).png().toFile(localFile);

    // ドミナントカラーの簡易抽出
    const { dominant } = await sharp(buffer).stats();
    const hex = '#' + [dominant.r, dominant.g, dominant.b].map(x => {
      const hexVal = Math.round(x).toString(16);
      return hexVal.length === 1 ? '0' + hexVal : hexVal;
    }).join('');

    const palette = [
      { color: hex, ratio: 0.8 },
      { color: '#FFFFFF', ratio: 0.2 }
    ];

    return { ok: true, dominantColor: hex, palette };
  } catch (error) {
    return { ok: false, dominantColor: '#FFFFFF', palette: [] };
  }
}

async function run() {
  console.log('📖 既存の gears.json を読み込み中...');
  const gearsData = JSON.parse(fs.readFileSync(GEARS_JSON_PATH, 'utf8'));
  let existingGears = gearsData.gears || gearsData;

  // 1. 既存データのクレンジング (ブランド名 'エンペリー*1' の修正など)
  console.log('🧹 既存データのクレンジングを実行中...');
  let cleansedCount = 0;
  for (const gear of existingGears) {
    if (gear.brand.brandName === 'エンペリー*1') {
      gear.brand.brandName = 'エンペリー';
      gear.brand.brandId = 'エンペリー';
      cleansedCount++;
    }
    if (gear.brand.brandId === 'エンペリー*1') {
      gear.brand.brandId = 'エンペリー';
    }
  }
  if (cleansedCount > 0) {
    console.log(`   ✅ 既存ギアのブランド表記ゆれを ${cleansedCount} 件クレンジングしました。`);
  }

  // 既存ギアの名前のセット（重複チェック用）
  const existingNamesNormalized = new Set(existingGears.map((g: any) => normalizeName(g.name)));

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

  // カテゴリごとの最大IDの検出
  const maxIds: { [key: string]: number } = { head: -1, body: -1, shoes: -1 };
  existingGears.forEach((gear: any) => {
    const num = parseInt(gear.id.split('-')[1]);
    if (!isNaN(num) && num > maxIds[gear.category]) {
      maxIds[gear.category] = num;
    }
  });

  console.log('📊 現在のカテゴリ最大ID数値:', maxIds);

  const newGears: any[] = [];
  const validBrands = new Set([
    'B00', 'B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09',
    'B10', 'B11', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B97', 'B98', 'B99'
  ]);

  for (const cat of categories) {
    console.log(`\n👕 カテゴリ [${cat.name}] の新規ギア候補をチェック中...`);
    const dataUrl = `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/${cat.file}`;
    const res = await axios.get(dataUrl);
    const items = res.data;

    let catAdded = 0;
    for (const item of items) {
      const internalId = item.__RowId; 
      const nameKey = internalId.replace(cat.prefix, '');
      
      let name = langData[cat.langKey]?.[nameKey];
      if (!name) name = item.Label?.trim();
      
      // 不正データ・没データの除外
      if (!name) continue;
      if (name.includes('amiibo') || name.includes('アミーボ')) continue; // 既存のamiiboデータと重複しないよう除外
      if (name.includes('INVISIBLE') || name.includes('Dummy') || name === 'Tシャツ') continue;
      if (!validBrands.has(item.Brand)) continue; // 没ブランドやNoneは除外

      const trimmedName = name.trim();
      
      // すでに登録済みのギアはスキップ
      if (existingNamesNormalized.has(normalizeName(trimmedName))) continue;

      // 新規IDの割り当て
      maxIds[cat.name]++;
      const newIdNum = maxIds[cat.name];
      const gearId = `${cat.name}-${newIdNum.toString().padStart(3, '0')}`;
      const imagePath = `/gears/${cat.name}/${gearId}.png`;

      const brandName = langData['CommonMsg/Gear/GearBrandName']?.[item.Brand] || item.Brand;

      newGears.push({
        id: gearId,
        name: trimmedName,
        category: cat.name,
        brand: {
          brandId: brandName,
          brandName: brandName,
        },
        imagePath: imagePath,
        _internalId: internalId
      });
      
      existingNamesNormalized.add(normalizeName(trimmedName)); // 同一名ギアの重複防止
      catAdded++;
    }
    console.log(`   ➕ ${catAdded} 件の新規候補を検出`);
  }

  console.log(`\n📥 新規ギアの画像ダウンロードと解析を開始します (${newGears.length} 件)...`);

  const mergedGears = [...existingGears];
  let successCount = 0;

  for (const newGear of newGears) {
    console.log(`   ➡️ ダウンロード中: ${newGear.name} (${newGear._internalId})`);
    const result = await downloadAndProcessImage(newGear._internalId, newGear.category, newGear.id);
    
    if (result.ok) {
      delete newGear._internalId;
      newGear.dominantColor = result.dominantColor;
      newGear.palette = result.palette;
      newGear.tags = [];
      newGear.autoTags = [];
      newGear.manualTags = [];
      
      mergedGears.push(newGear);
      successCount++;
    } else {
      console.log(`   ❌ 画像なし等のため除外: ${newGear.name}`);
      // IDのカウンターを差し引く
      maxIds[newGear.category]--;
    }
  }

  console.log(`\n🎉 マージ完了! 新しく ${successCount} 件のギアを追加しました。`);

  // gears.json に保存
  const finalData = { gears: mergedGears };
  fs.writeFileSync(GEARS_JSON_PATH, JSON.stringify(finalData, null, 2));
  console.log(`💾 ${GEARS_JSON_PATH} を更新しました！`);
}

run().catch(e => console.error('Error:', e));
