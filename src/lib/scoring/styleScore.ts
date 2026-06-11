// src/lib/scoring/styleScore.ts

import { Gear, ScoreAxis, ScoreReason } from '@/types';
import { scoreToRank } from './weights';

export function calculateStyleScore(head: Gear, body: Gear, shoes: Gear): ScoreAxis {
  let totalScore = 0;
  const reasons: ScoreReason[] = [];

  // 1. tagCoherence (0〜65)
  const getStyleTags = (g: Gear) => {
    const auto = g.autoTags || [];
    const manual = g.manualTags || [];
    const all = new Set([...auto, ...manual, ...(g.tags || [])]);
    return Array.from(all).filter(t => !t.startsWith('color:'));
  };

  const headTags = getStyleTags(head);
  const bodyTags = getStyleTags(body);
  const shoesTags = getStyleTags(shoes);

  const gearsWithTags = [headTags, bodyTags, shoesTags].filter(tags => tags.length > 0);
  const taggedGearCount = gearsWithTags.length;

  let tagCoherenceScore = 0;

  if (taggedGearCount === 0) {
    tagCoherenceScore = 35; // Neutral
    reasons.push({ text: 'スタイルタグが未設定のため中立評価', sentiment: 'neutral', impact: 35 });
  } else {
    const allStyleTags = new Set([...headTags, ...bodyTags, ...shoesTags]);
    let scoreAcc = 0;
    
    allStyleTags.forEach(tag => {
      const matchCount = [headTags, bodyTags, shoesTags].filter(tags => tags.includes(tag)).length;
      if (matchCount === taggedGearCount && taggedGearCount >= 2) {
        scoreAcc += 25;
        reasons.push({ text: `全身 ${tag} で統一！`, sentiment: 'positive', impact: 25 });
      } else if (matchCount >= 2) {
        scoreAcc += 12;
        reasons.push({ text: `2つのギアが ${tag} で一致`, sentiment: 'positive', impact: 12 });
      }
    });

    const adjustedScore = scoreAcc * (taggedGearCount / 3);
    tagCoherenceScore = Math.min(65, adjustedScore);
  }
  
  // Fallback if score is too low despite having tags
  if (taggedGearCount > 0 && tagCoherenceScore === 0) {
    tagCoherenceScore = 10; 
    reasons.push({ text: 'スタイルの方向性が混在している', sentiment: 'negative', impact: 10 });
  }

  totalScore += tagCoherenceScore;

  // 2. brandAffinity (0〜35)
  const brands = new Set([head.brand.brandId, body.brand.brandId, shoes.brand.brandId]);
  let brandScore = 0;

  if (brands.size === 1) {
    brandScore = 35;
    reasons.push({ text: 'ワンブランドコーデ！', sentiment: 'positive', impact: 35 });
  } else if (brands.size === 2) {
    brandScore = 22;
    reasons.push({ text: '2ギアがブランド統一', sentiment: 'positive', impact: 22 });
  } else {
    brandScore = 15;
    reasons.push({ text: 'ブランドmixでカジュアルな印象', sentiment: 'neutral', impact: 15 });
  }

  totalScore += brandScore;

  return {
    value: Math.round(totalScore),
    rank: scoreToRank(Math.round(totalScore)),
    label: 'スタイル統一',
    icon: '',
    reasons,
  };
}
