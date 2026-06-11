// src/lib/scoring/balanceScore.ts

import { Gear, ScoreAxis, ScoreReason } from '@/types';
import { scoreToRank } from './weights';
import { stddev, clamp, getLightness, getSaturation } from './utils';

export function calculateBalanceScore(head: Gear, body: Gear, shoes: Gear): ScoreAxis {
  let totalScore = 0;
  const reasons: ScoreReason[] = [];

  const lHead = getLightness(head.dominantColor);
  const lBody = getLightness(body.dominantColor);
  const lShoes = getLightness(shoes.dominantColor);

  // 1. lightnessFlow (0〜40)
  const isMonotoneDown = lHead >= lBody && lBody >= lShoes;
  const isMonotoneUp = lHead <= lBody && lBody <= lShoes;
  const isSandwich = (lBody > lHead && lBody > lShoes) || (lBody < lHead && lBody < lShoes);

  let lightnessFlowScore = 0;
  if (isMonotoneDown) {
    lightnessFlowScore = 40;
    reasons.push({ text: '上が明るく下が暗い、最も安定感のある配色', sentiment: 'positive', impact: 40 });
  } else if (isMonotoneUp) {
    lightnessFlowScore = 35;
    reasons.push({ text: '美しい明度グラデーション', sentiment: 'positive', impact: 35 });
  } else if (isSandwich) {
    lightnessFlowScore = 30;
    reasons.push({ text: 'フクがアクセントになるサンドイッチ配色', sentiment: 'positive', impact: 30 });
  } else {
    const diff1 = Math.abs(lHead - lBody);
    const diff2 = Math.abs(lBody - lShoes);
    const avgDiff = (diff1 + diff2) / 2;
    lightnessFlowScore = Math.max(15, 30 - avgDiff * 0.3);
  }
  totalScore += lightnessFlowScore;

  // 2. saturationCoherence (0〜30)
  const saturations = [
    getSaturation(head.dominantColor),
    getSaturation(body.dominantColor),
    getSaturation(shoes.dominantColor)
  ];
  const sStdDev = stddev(saturations);
  let saturationScore = 0;

  if (sStdDev < 0.05) {
    saturationScore = 30;
    reasons.push({ text: '彩度が統一されている', sentiment: 'positive', impact: 30 });
  } else if (sStdDev < 0.10) {
    saturationScore = 24;
    reasons.push({ text: '彩度がほぼ揃っている', sentiment: 'positive', impact: 24 });
  } else if (sStdDev < 0.18) {
    saturationScore = 16;
  } else if (sStdDev < 0.30) {
    saturationScore = 10;
    reasons.push({ text: '彩度にややばらつきがある', sentiment: 'negative', impact: 10 });
  } else {
    saturationScore = 5;
    reasons.push({ text: '彩度がバラバラで散漫な印象', sentiment: 'negative', impact: 5 });
  }
  totalScore += saturationScore;

  // 3. visualWeight (0〜30)
  // 暗い色ほど重い
  const weightHead = (100 - lHead) / 100;
  const weightBody = (100 - lBody) / 100;
  const weightShoes = (100 - lShoes) / 100;

  const totalWeight = weightHead + weightBody + weightShoes || 1;
  const ratioHead = weightHead / totalWeight;
  const ratioBody = weightBody / totalWeight;
  const ratioShoes = weightShoes / totalWeight;

  // 下が重いほど高スコア
  const bottomHeavyScore = ratioShoes * 2 + ratioBody * 1 + ratioHead * 0.5;
  const normalizedScore = ((bottomHeavyScore - 0.5) / 1.5) * 30;
  const visualWeightScore = clamp(Math.round(normalizedScore), 0, 30);
  
  totalScore += visualWeightScore;
  
  if (visualWeightScore > 25) {
    reasons.push({ text: '下に重心があり視覚的に安定している', sentiment: 'positive', impact: 25 });
  } else if (visualWeightScore < 10) {
    reasons.push({ text: '上が重く、少し不安定なバランスかも', sentiment: 'neutral', impact: 10 });
  }

  return {
    value: Math.round(totalScore),
    rank: scoreToRank(Math.round(totalScore)),
    label: '視覚バランス',
    icon: '⚖️',
    reasons,
  };
}
