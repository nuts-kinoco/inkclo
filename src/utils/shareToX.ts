import { Coordinate, Gear, CoordinateScore } from '@/types';
import gearsData from '@/lib/data/gears';

export function buildTweetText(coordinate: Coordinate, score: CoordinateScore | null): string {
  const gears = gearsData.gears as Gear[];
  
  const head = gears.find(g => g.id === coordinate.headId);
  const body = gears.find(g => g.id === coordinate.bodyId);
  const shoes = gears.find(g => g.id === coordinate.shoesId);

  const headName = head ? head.name : '未選択';
  const bodyName = body ? body.name : '未選択';
  const shoesName = shoes ? shoes.name : '未選択';

  const titlePart = coordinate.name ? `【${coordinate.name}】\n` : '';
  const scorePart = score ? `ランク【${score.totalRank}】(${score.totalScore}点) のコーディネート！\n` : 'My Splatoon3 Coordinate\n';

  const text = `${titlePart}${scorePart}アタマ: ${headName}\nフク: ${bodyName}\nクツ: ${shoesName}\n\n#INKCLO #Splatoon3 #スプラトゥーン3`;

  return text;
}

export function buildTwitterIntentUrl(text: string, url?: string): string {
  let intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  if (url) {
    intentUrl += `&url=${encodeURIComponent(url)}`;
  }
  return intentUrl;
}
