import fs from 'fs';

const dataPath = 'src/lib/data/brands.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const validBrands = [
  'バトロイカ','アイロニック','クラーゲス','ロッケンベルグ',
  'エゾッコ','フォーリマ','ホッコリー','ホタックス',
  'ジモン','シグレニ','アロメ','ヤコ','アナアキ',
  'エンペリー','タタキケンサキ','エゾッコリー','バラズシ',
  'シチリン','クマサン商会','アタリメイド'
];

data.brands = data.brands.filter(b => validBrands.includes(b.name));

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Cleaned brands.json');
