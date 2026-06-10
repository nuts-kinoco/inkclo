import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'gears.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Tag rules
const rules = [
  // Brands
  { match: (brand: string) => brand === 'アロメ', tags: ['sporty'] },
  { match: (brand: string) => brand === 'ホタックス', tags: ['outdoor', 'casual'] },
  { match: (brand: string) => brand === 'アイロニック', tags: ['sporty', 'casual'] },
  { match: (brand: string) => brand === 'クラーゲス', tags: ['casual'] },
  { match: (brand: string) => brand === 'ロッケンベルグ', tags: ['cool'] },
  { match: (brand: string) => brand === 'エゾッコ', tags: ['street', 'casual'] },
  { match: (brand: string) => brand === 'エゾッコリー', tags: ['street'] },
  { match: (brand: string) => brand === 'フォーリマ', tags: ['outdoor', 'cool'] },
  { match: (brand: string) => brand === 'シグレニ', tags: ['outdoor'] },
  { match: (brand: string) => brand === 'ヤコ', tags: ['sporty', 'street'] },
  { match: (brand: string) => brand === 'アナアキ', tags: ['street', 'cool'] },
  { match: (brand: string) => brand === 'エンペリー', tags: ['sporty', 'cool'] },
  { match: (brand: string) => brand === 'タタキケンサキ', tags: ['cool', 'formal'] },
  { match: (brand: string) => brand === 'ジモン', tags: ['casual'] },
  { match: (brand: string) => brand === 'バラズシ', tags: ['formal', 'cool'] },
  { match: (brand: string) => brand === 'シチリン', tags: ['outdoor', 'casual'] },

  // Names
  { match: (name: string) => /(ニット|スウェット|セーター|マフラー|コート|ダウン|パーカー|ブーツ|スノー)/.test(name), tags: ['winter'] },
  { match: (name: string) => /(Tシャツ|サンダル|アロハ|ポロ|ショーツ|半袖)/.test(name), tags: ['summer'] },
  { match: (name: string) => /(サングラス|レザー|ライダース)/.test(name), tags: ['cool'] },
  { match: (name: string) => /(リボン|スカート|ワンピース|フリル)/.test(name), tags: ['cute'] },
  { match: (name: string) => /(お面|ヘルメット|おもしろ|着ぐるみ)/.test(name), tags: ['funny'] },
  { match: (name: string) => /(シャツ|ネクタイ|スーツ|革靴)/.test(name), tags: ['formal'] },
  { match: (name: string) => /(キャップ|スニーカー|ジャージ)/.test(name), tags: ['sporty'] },
];

data.gears = data.gears.map((gear: any) => {
  const autoTags = new Set<string>();

  rules.forEach(rule => {
    if (rule.match(gear.brand.brandName) || rule.match(gear.name)) {
      rule.tags.forEach(t => autoTags.add(t));
    }
  });

  return {
    ...gear,
    autoTags: Array.from(autoTags),
    manualTags: gear.manualTags || []
  };
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Successfully generated autoTags for gears!');
