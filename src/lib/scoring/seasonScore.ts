// src/lib/scoring/seasonScore.ts

import { Gear, ScoreAxis, ScoreReason, Season } from '@/types';
import { scoreToRank } from './weights';
import { hexToRgb, rgbToHsl } from '../colorTheory';

export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

const SEASON_TAG_AFFINITY: Record<Season, Record<string, number>> = {
  spring: { casual: 0.8, cute: 0.9, outdoor: 0.6 },
  summer: { summer: 1.0, sporty: 0.7, casual: 0.5, outdoor: 0.8 },
  autumn: { street: 0.8, cool: 0.9, formal: 0.6 },
  winter: { winter: 1.0, formal: 0.8, cool: 0.6 },
};

const SEASON_COLOR_PROFILE: Record<Season, {
  idealLightness: [number, number];
  idealSaturation: [number, number];
  warmthPreference: 'warm' | 'cool' | 'neutral';
}> = {
  spring: { idealLightness: [55, 80], idealSaturation: [0.3, 0.7], warmthPreference: 'warm' },
  summer: { idealLightness: [50, 85], idealSaturation: [0.5, 1.0], warmthPreference: 'cool' },
  autumn: { idealLightness: [25, 55], idealSaturation: [0.3, 0.7], warmthPreference: 'warm' },
  winter: { idealLightness: [15, 45], idealSaturation: [0.0, 0.5], warmthPreference: 'cool' },
};

export function calculateSeasonScore(head: Gear, body: Gear, shoes: Gear, targetSeason: Season): ScoreAxis {
  let totalScore = 0;
  const reasons: ScoreReason[] = [];

  const gears = [head, body, shoes];

  // 1. tagSeasonFit (0〜45)
  let tagSeasonFitScore = 0;
  let hasSeasonTagMatch = false;

  gears.forEach(gear => {
    const auto = gear.autoTags || [];
    const manual = gear.manualTags || [];
    const allTags = new Set([...auto, ...manual, ...(gear.tags || [])]);
    const styleTags = Array.from(allTags).filter(t => !t.startsWith('color:'));

    let bestAffinity = 0;
    
    styleTags.forEach(tag => {
      const affinity = SEASON_TAG_AFFINITY[targetSeason][tag] || 0;
      if (affinity > bestAffinity) {
        bestAffinity = affinity;
      }
    });

    if (bestAffinity > 0) {
      tagSeasonFitScore += bestAffinity * 15;
      hasSeasonTagMatch = true;
    } else {
      tagSeasonFitScore += 7; // Neutral fallback
    }
  });

  if (hasSeasonTagMatch) {
    reasons.push({ text: `タグが季節 (${targetSeason}) のイメージにマッチ`, sentiment: 'positive', impact: 15 });
  }

  tagSeasonFitScore = Math.min(45, tagSeasonFitScore);
  totalScore += tagSeasonFitScore;

  // 2. colorSeasonFit (0〜55)
  const profile = SEASON_COLOR_PROFILE[targetSeason];
  let colorSeasonFitScore = 0;

  gears.forEach(gear => {
    if (!gear.dominantColor) {
      colorSeasonFitScore += 8;
      return;
    }
    
    const hsl = rgbToHsl(...Object.values(hexToRgb(gear.dominantColor)) as [number, number, number]);
    const l = hsl.l * 100;
    const s = hsl.s;
    const h = hsl.h;

    let lightnessScore = 3;
    if (l >= profile.idealLightness[0] && l <= profile.idealLightness[1]) {
      lightnessScore = 8;
    }

    let satScore = 2;
    if (s >= profile.idealSaturation[0] && s <= profile.idealSaturation[1]) {
      satScore = 6;
    }

    let warmthScore = 1;
    const isWarm = (h >= 0 && h <= 60) || (h >= 300);
    if ((profile.warmthPreference === 'warm' && isWarm) ||
        (profile.warmthPreference === 'cool' && !isWarm) ||
        (profile.warmthPreference === 'neutral')) {
      warmthScore = 4;
    }

    colorSeasonFitScore += lightnessScore + satScore + warmthScore;
  });

  colorSeasonFitScore = Math.min(55, colorSeasonFitScore);
  totalScore += colorSeasonFitScore;

  if (colorSeasonFitScore > 40) {
    reasons.push({ text: `色合いが季節 (${targetSeason}) にとても合っている`, sentiment: 'positive', impact: 20 });
  } else if (colorSeasonFitScore < 20) {
    reasons.push({ text: `季節感 (${targetSeason}) と色が少しずれているかも`, sentiment: 'negative', impact: -10 });
  } else {
    reasons.push({ text: `適度な季節感 (${targetSeason})`, sentiment: 'neutral', impact: 0 });
  }

  return {
    value: Math.round(totalScore),
    rank: scoreToRank(Math.round(totalScore)),
    label: '季節感',
    icon: '',
    reasons,
  };
}
