import { Gear } from '@/types';
import { deltaE } from '../colorUtils';

/**
 * Apply MMR (Maximal Marginal Relevance) inspired algorithm to select diverse gears.
 * Ensures we don't show identical colors or too many of the same brand.
 * 
 * @param candidates Initial sorted candidates (e.g. sorted by distance to target color)
 * @param limit Maximum number of items to return
 * @returns Filtered list of gears ensuring brand and color diversity
 */
export function applyMMRDiversity(candidates: Gear[], limit: number = 10): Gear[] {
  const selected: Gear[] = [];
  const skipped: Gear[] = [];

  for (const candidate of candidates) {
    if (selected.length >= limit) break;

    // Penalty 1: Color similarity
    // If DeltaE < 5 with any already selected gear, it's visually almost identical.
    const isTooSimilarColor = selected.some(s => deltaE(candidate.dominantColor, s.dominantColor) < 5);
    if (isTooSimilarColor) {
      skipped.push(candidate);
      continue;
    }

    // Penalty 2: Brand diversity
    // Max 2 gears from the exact same brand in one carousel
    const sameBrandCount = selected.filter(s => s.brand.brandId === candidate.brand.brandId).length;
    if (sameBrandCount >= 2) {
      skipped.push(candidate);
      continue;
    }

    selected.push(candidate);
  }

  // Fallback: If we couldn't find enough diverse gears, backfill from skipped
  if (selected.length < limit) {
    for (const candidate of skipped) {
      if (selected.length >= limit) break;
      selected.push(candidate);
    }
  }

  return selected;
}
