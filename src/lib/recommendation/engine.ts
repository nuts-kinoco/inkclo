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
  const recommendedGearIds = new Set<string>();

  // 優先度の高い順に戦略を実行し、重複を防ぐ
  // 優先度順: Monotone (30) -> Analogous (20) -> Triadic (15) -> Complementary (10)
  const orderedStrategies = [
    MonotoneStrategy,
    AnalogousStrategy,
    TriadicStrategy,
    ComplementaryStrategy
  ];

  for (const strategy of orderedStrategies) {
    // 既に他の戦略で選ばれたギアを、現在のコーディネートの装備品と同様に「除外対象」として context.coordinate に擬似的に追加する
    const currentCoordinate = { ...context.coordinate };
    let idx = 0;
    recommendedGearIds.forEach(id => {
      currentCoordinate[`__recommended_${idx++}`] = id;
    });

    const localContext: RecommendationContext = {
      ...context,
      coordinate: currentCoordinate
    };

    const group = strategy.generate(localContext);
    if (group && group.items.length > 0) {
      // 今回推薦されたギアIDを登録
      group.items.forEach(item => recommendedGearIds.add(item.id));
      groups.push(group);
    }
  }

  return groups;
}
