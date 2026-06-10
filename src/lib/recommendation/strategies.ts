import { RecommendationStrategy, RecommendationContext, Gear } from '@/types';
import { getTheoryColors } from '../colorTheory';
import { deltaE } from '../colorUtils';
import { applyMMRDiversity } from './mmr';

function getCandidates(hexColors: string[], context: RecommendationContext): Gear[] {
  const targetGears = context.allGears.filter(g => g.category === context.targetCategory);
  const unequippedGears = targetGears.filter(g => !Object.values(context.coordinate).includes(g.id));

  // For each gear, find the minimum distance to ANY of the target hex colors
  const scored = unequippedGears.map(gear => {
    if (!gear.dominantColor) return { gear, dist: 999 };
    const dist = Math.min(...hexColors.map(hex => deltaE(hex, gear.dominantColor)));
    return { gear, dist };
  });

  // Sort by distance and take top 40 as candidates
  scored.sort((a, b) => a.dist - b.dist);
  return scored.slice(0, 40).map(x => x.gear);
}

export const MonotoneStrategy: RecommendationStrategy = {
  generate: (context) => {
    const theory = getTheoryColors(context.baseColor);
    const candidates = getCandidates(theory.monotone, context);
    const items = applyMMRDiversity(candidates, 10);

    if (items.length === 0) return null;

    return {
      id: 'color-monotone',
      title: 'モノトーン',
      description: '白黒やグレーで統一感のあるクールな印象に',
      icon: 'Moon',
      priority: 30,
      type: 'color',
      items
    };
  }
};

export const AnalogousStrategy: RecommendationStrategy = {
  generate: (context) => {
    const theory = getTheoryColors(context.baseColor);
    const candidates = getCandidates(theory.analogous, context);
    const items = applyMMRDiversity(candidates, 10);

    if (items.length === 0) return null;

    return {
      id: 'color-analogous',
      title: '類似色',
      description: '近い色味で自然なまとまりを持たせる',
      icon: 'Palette',
      priority: 20,
      type: 'color',
      items
    };
  }
};

export const ComplementaryStrategy: RecommendationStrategy = {
  generate: (context) => {
    const theory = getTheoryColors(context.baseColor);
    const candidates = getCandidates(theory.complementary, context);
    const items = applyMMRDiversity(candidates, 10);

    if (items.length === 0) return null;

    return {
      id: 'color-complementary',
      title: '補色・アクセント',
      description: '反対色で強いコントラストと差し色を',
      icon: 'Sparkles',
      priority: 10,
      type: 'color',
      items
    };
  }
};

export const TriadicStrategy: RecommendationStrategy = {
  generate: (context) => {
    const theory = getTheoryColors(context.baseColor);
    const candidates = getCandidates(theory.triadic, context);
    const items = applyMMRDiversity(candidates, 10);

    if (items.length === 0) return null;

    return {
      id: 'color-triadic',
      title: 'トライアド',
      description: '色相環で正三角形の位置にある色で、個性的でバランスの取れたコーデに',
      icon: 'Palette',
      priority: 15,
      type: 'color',
      items
    };
  }
};
