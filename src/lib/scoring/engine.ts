// src/lib/scoring/engine.ts

import { Gear, CoordinateScore, ScoreWeights, Season } from '@/types';
import { calculateColorScore } from './colorScore';
import { calculateStyleScore } from './styleScore';
import { calculateSeasonScore, getCurrentSeason } from './seasonScore';
import { calculateBalanceScore } from './balanceScore';
import { DEFAULT_WEIGHTS, scoreToRank } from './weights';

export function scoreCoordinate(
  head: Gear,
  body: Gear,
  shoes: Gear,
  seasonOverride?: Season | null,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): CoordinateScore {
  const targetSeason = seasonOverride || getCurrentSeason();

  const color = calculateColorScore(head, body, shoes);
  const style = calculateStyleScore(head, body, shoes);
  const season = calculateSeasonScore(head, body, shoes, targetSeason);
  const balance = calculateBalanceScore(head, body, shoes);

  const totalScore = Math.round(
    color.value * weights.color +
    style.value * weights.style +
    season.value * weights.season +
    balance.value * weights.balance
  );

  return {
    totalScore,
    totalRank: scoreToRank(totalScore),
    axes: { color, style, season, balance },
    weights,
    season: targetSeason,
  };
}
