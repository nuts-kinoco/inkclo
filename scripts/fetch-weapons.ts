import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

const OUT_DIR = path.join(process.cwd(), 'public', 'weapons');
const TEMP_DATA_PATH = path.join(process.cwd(), 'scripts', 'temp-weapons.json');

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

async function downloadImage(internalId: string, weaponId: string): Promise<boolean> {
  // Leanny stores weapon icons as Wst_WeaponName.png
  const imageName = `Wst_${internalId}.png`;
  const url = `https://raw.githubusercontent.com/Leanny/splat3/main/images/weapon_flat/${imageName}`;
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const localFile = path.join(OUT_DIR, `${weaponId}.png`);

  if (fs.existsSync(localFile)) return true;

  try {
    const res = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: { 'User-Agent': 'Inkclo-App' },
    });
    // Add 10% padding to weapon images to avoid edge cut-offs during K-means resizing, 
    // and resize to standard 256x256
    await sharp(res.data).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(localFile);
    return true;
  } catch (error) {
    // Try the non-flat directory if flat fails
    try {
        const url2 = `https://raw.githubusercontent.com/Leanny/splat3/main/images/weapon/${imageName}`;
        const res2 = await axios({
            url: url2,
            method: 'GET',
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: { 'User-Agent': 'Inkclo-App' },
        });
        await sharp(res2.data).resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(localFile);
        return true;
    } catch (e) {
        return false;
    }
  }
}

function getWeaponClass(internalId: string): string {
    if (internalId.includes('Shooter') || internalId.includes('Blaster') && !internalId.includes('Maneuver')) {
        if (internalId.includes('Blaster')) return 'blaster';
        return 'shooter';
    }
    if (internalId.includes('Charger')) return 'charger';
    if (internalId.includes('Slosher')) return 'slosher';
    if (internalId.includes('Spinner')) return 'splatling';
    if (internalId.includes('Maneuver') || internalId.includes('Twins')) return 'dualies';
    if (internalId.includes('Umbrella')) return 'brella';
    if (internalId.includes('Brush')) return 'brush';
    if (internalId.includes('Roller')) return 'roller';
    if (internalId.includes('Stringer')) return 'stringer';
    if (internalId.includes('Saber') || internalId.includes('Wiper')) return 'splatana';
    return 'shooter'; // fallback
}

async function run() {
  console.log('🔍 最新のゲームバージョンを検索中...');
  const version = await getLatestVersion();
  console.log(`✅ 検出された最新バージョン: ${version}`);

  console.log('📖 日本語言語データを取得中...');
  const langData = await fetchLanguageData();

  const weapons: any[] = [];
  
  console.log(`\n🔫 武器データを取得中...`);
  const dataUrl = `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/WeaponInfoMain.json`;
  const res = await axios.get(dataUrl);
  const items = res.data;

  let count = 0;
  for (const item of items) {
    const internalId = item.__RowId; 
    
    // Skip salmon run specific, duplicated, or irrelevant weapons
    if (internalId.includes('_Coop') || internalId.includes('Hero') || internalId.includes('Octa') || internalId.includes('Mission') || internalId.includes('Rival')) continue;
    
    const nameKey = item.Id.toString(); // Wait, in Splatoon 3 data, Name may be referenced differently. We can use the Label.
    
    // Usually it's CommonMsg/Weapon/WeaponName_Main
    let name = langData['CommonMsg/Weapon/WeaponName_Main']?.[internalId];
    if (!name) name = item.Label?.trim();
    if (!name) continue;

    const weaponId = `weapon-${weapons.length.toString().padStart(3, '0')}`;
    const imagePath = `/weapons/${weaponId}.png`;

    weapons.push({
      id: weaponId,
      name: name,
      weaponClass: getWeaponClass(internalId),
      subWeapon: item.SubWeapon, // internal ID for now
      specialWeapon: item.SpecialWeapon, // internal ID for now
      imagePath: imagePath,
      _internalId: internalId
    });
    count++;
  }
  
  console.log(`   ✅ ${count} 件のメインウェポンを抽出`);

  console.log(`\n📊 画像ダウンロードを開始します...`);
  
  let downloaded = 0;
  let skipped = 0;

  for (let i = 0; i < weapons.length; i++) {
    const weapon = weapons[i];
    const ok = await downloadImage(weapon._internalId, weapon.id);
    if (ok) downloaded++;
    else skipped++;
    
    if (i % 20 === 0 && i > 0) process.stdout.write('.');
    
    delete weapon._internalId;
    weapon.dominantColor = '#FFFFFF';
    weapon.palette = [];
    weapon.styleTags = [];
  }

  console.log(`\n   📥 ダウンロード: ${downloaded} 件 / エラー(または既存): ${skipped} 件`);

  fs.writeFileSync(TEMP_DATA_PATH, JSON.stringify({ weapons }, null, 2));
  console.log(`\n💾 ${TEMP_DATA_PATH} に出力完了！`);
}

run().catch(e => console.error('Error:', e));
