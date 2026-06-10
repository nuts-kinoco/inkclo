import { RecommendationContext, RecommendationGroup } from '@/types';
import { MonotoneStrategy, AnalogousStrategy, ComplementaryStrategy, TriadicStrategy } from './strategies';

const ALL_STRATEGIES = [
  MonotoneStrategy,
  AnalogousStrategy,
  ComplementaryStrategy,
  TriadicStrategy
];

export function runRecommendationEngine(context: RecommendationContext): RecommendationGroup[] {
  const groups: RecommendationGroup[] = [];

  for (const strategy of ALL_STRATEGIES) {
    const group = strategy.generate(context);
    if (group && group.items.length > 0) {
      groups.push(group);
    }
  }

  // Sort by priority descending
  groups.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return groups;
}
