// src/lib/scoring/colorScore.ts

import { Gear, ScoreAxis, ScoreReason } from '@/types';
import { hexToRgb, rgbToHsl } from '../colorTheory';
import { scoreToRank } from './weights';
import { clamp, stddev, getLightness, getHueDifference } from './utils';

export function calculateColorScore(head: Gear, body: Gear, shoes: Gear): ScoreAxis {
  let totalScore = 0;
  const reasons: ScoreReason[] = [];

  // 1. pairHarmony (0〜50)
  const pairs = [
    { name: 'アタマとフク', c1: head.dominantColor, c2: body.dominantColor },
    { name: 'アタマとクツ', c1: head.dominantColor, c2: shoes.dominantColor },
    { name: 'フクとクツ', c1: body.dominantColor, c2: shoes.dominantColor },
  ];

  let pairSum = 0;
  pairs.forEach(pair => {
    if (!pair.c1 || !pair.c2) {
      pairSum += 8; // fallback
      return;
    }
    const h1 = rgbToHsl(...Object.values(hexToRgb(pair.c1)) as [number, number, number]).h;
    const h2 = rgbToHsl(...Object.values(hexToRgb(pair.c2)) as [number, number, number]).h;
    const dh = getHueDifference(h1, h2);

    let pairScore = 8;
    let reasonText = '';

    if (dh <= 15) {
      pairScore = 16;
      reasonText = `${pair.name}が同系色でまとまっている`;
    } else if (dh <= 40) {
      pairScore = 15;
      reasonText = `${pair.name}が類似色で自然な調和`;
    } else if (dh >= 110 && dh <= 130) {
      pairScore = 14;
      reasonText = `${pair.name}がトライアド配色で個性的`;
    } else if (dh >= 165 && dh <= 180) {
      pairScore = 16;
      reasonText = `${pair.name}が補色関係でアクセントが効いている`;
    } else if (dh >= 80 && dh <= 100) {
      pairScore = 13;
    }

    if (reasonText && !reasons.some(r => r.text === reasonText)) {
      reasons.push({ text: reasonText, sentiment: 'positive', impact: pairScore });
    }
    pairSum += pairScore;
  });

  const pairHarmonyScore = clamp(Math.round((pairSum / 48) * 50), 0, 50);
  totalScore += pairHarmonyScore;

  // 2. lightnessContrast (0〜25)
  const lightnesses = [
    getLightness(head.dominantColor),
    getLightness(body.dominantColor),
    getLightness(shoes.dominantColor),
  ];
  const lStdDev = stddev(lightnesses);
  let lScore = 0;

  if (lStdDev >= 15 && lStdDev <= 35) {
    lScore = 25;
    reasons.push({ text: '理想的な明暗のコントラスト', sentiment: 'positive', impact: 25 });
  } else if ((lStdDev >= 10 && lStdDev < 15) || (lStdDev > 35 && lStdDev <= 45)) {
    lScore = 18;
  } else if ((lStdDev >= 5 && lStdDev < 10) || (lStdDev > 45 && lStdDev <= 55)) {
    lScore = 12;
    reasons.push({ text: lStdDev < 10 ? '明暗差が弱く、ややのっぺりしている' : '明暗差がやや強すぎる', sentiment: 'negative', impact: 12 });
  } else if (lStdDev < 5) {
    lScore = 8;
  } else {
    lScore = 6;
  }
  totalScore += lScore;

  // 3. hueSpread (0〜25)
  const hues = [head, body, shoes].map(g => g.dominantColor ? rgbToHsl(...Object.values(hexToRgb(g.dominantColor)) as [number, number, number]).h : 0);
  hues.sort((a, b) => a - b);
  // Calculate spread: max difference between adjacent hues, subtracted from 360 to get the narrowest enclosing angle.
  const diffs = [
    hues[1] - hues[0],
    hues[2] - hues[1],
    360 - hues[2] + hues[0]
  ];
  const spreadAngle = 360 - Math.max(...diffs);
  
  let hScore = 0;
  if (spreadAngle >= 30 && spreadAngle <= 150) {
    hScore = 25;
    reasons.push({ text: '色相の広がりが適度で美しい', sentiment: 'positive', impact: 25 });
  } else if ((spreadAngle >= 15 && spreadAngle < 30) || (spreadAngle > 150 && spreadAngle <= 200)) {
    hScore = 18;
  } else if (spreadAngle < 15) {
    hScore = 12;
    reasons.push({ text: '色相がほとんど同じで単調', sentiment: 'neutral', impact: 12 });
  } else {
    hScore = 8;
    reasons.push({ text: '色相が散らばりすぎてまとまりに欠ける', sentiment: 'negative', impact: 8 });
  }
  totalScore += hScore;

  return {
    value: totalScore,
    rank: scoreToRank(totalScore),
    label: '色彩調和',
    icon: '🎨',
    reasons,
  };
}
