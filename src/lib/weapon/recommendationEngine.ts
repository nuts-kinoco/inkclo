import { Coordinate, Gear } from '@/types';
import { Weapon } from '@/types/weapon';
import { weapons } from '../data/weapons';
import { calculateWeaponAffinity, WeaponAffinityScore } from './affinityEngine';
import { deltaE } from '../colorUtils';

export interface WeaponRecommendation {
  weapon: Weapon;
  affinity: WeaponAffinityScore;
}

// Pattern B: Gears -> Weapons
// Returns top N weapons for a given coordinate
export function recommendWeaponsForCoordinate(coordinate: Coordinate, limit: number = 5): WeaponRecommendation[] {
  const recommendations: WeaponRecommendation[] = [];

  for (const weapon of weapons) {
    const affinity = calculateWeaponAffinity(weapon, coordinate);
    recommendations.push({ weapon, affinity });
  }

  // Sort by highest total affinity score
  recommendations.sort((a, b) => b.affinity.total - a.affinity.total);

  return recommendations.slice(0, limit);
}

// Pattern A: Weapon -> Gears
// Recommends gears that match the selected weapon
export function recommendGearsForWeapon(weapon: Weapon, allGears: Gear[], category: 'head' | 'clothes' | 'shoes', limit: number = 10): Gear[] {
  // Filter by category
  const candidates = allGears.filter(g => g.category === category);
  
  // Sort candidates by color affinity to the weapon
  const scoredCandidates = candidates.map(gear => {
    let score = 0;
    if (gear.dominantColor) {
      const d = deltaE(weapon.dominantColor, gear.dominantColor);
      score = Math.max(0, 100 - (d * 2));
    }
    return { gear, score };
  });

  scoredCandidates.sort((a, b) => b.score - a.score);

  return scoredCandidates.slice(0, limit).map(sc => sc.gear);
}
