import { Weapon } from '@/types/weapon';
import { Coordinate, Gear } from '@/types';
import { deltaE } from '../colorUtils';
import { getWeaponStyles } from './classStyleMap';
import gearsData from '../data/gears';

export interface WeaponAffinityScore {
  total: number;       // 0 - 100
  colorScore: number;  // 0 - 100
  styleScore: number;  // 0 - 100
  reasons: string[];
}

export function calculateWeaponAffinity(weapon: Weapon, coordinate: Coordinate): WeaponAffinityScore {
  const allGears = gearsData.gears as Gear[];
  const gears = [
    allGears.find((g: Gear) => g.id === coordinate.headId),
    allGears.find((g: Gear) => g.id === coordinate.bodyId),
    allGears.find((g: Gear) => g.id === coordinate.shoesId)
  ].filter((g): g is Gear => !!g);
  if (gears.length === 0) {
    return { total: 0, colorScore: 0, styleScore: 0, reasons: [] };
  }

  // 1. Color Score (55% weight)
  // Calculate the average color of the coordinate (or use the closest gear)
  // For simplicity and accuracy, let's compare the weapon's dominant color to each gear's dominant color
  // and take the best match (minimum deltaE) or the average deltaE. Let's use the best match.
  let bestDeltaE = Infinity;
  let bestMatchingGear = null;

  for (const gear of gears) {
    if (gear.dominantColor) {
      const d = deltaE(weapon.dominantColor, gear.dominantColor);
      if (d < bestDeltaE) {
        bestDeltaE = d;
        bestMatchingGear = gear;
      }
    }
  }

  // deltaE typically ranges 0-100. Let's map 0 -> 100 score, 50 -> 0 score
  let colorScore = 0;
  if (bestDeltaE !== Infinity) {
    colorScore = Math.max(0, 100 - (bestDeltaE * 2)); // 50 is the cut-off
  }

  // 2. Style Score (45% weight)
  const weaponStyles = getWeaponStyles(weapon.weaponClass, weapon.styleTags);
  const gearStyles = new Set<string>();
  gears.forEach((g: Gear) => {
    (g.autoTags || []).filter((t: string) => t.startsWith('style:')).forEach((t: string) => gearStyles.add(t));
    (g.manualTags || []).filter((t: string) => t.startsWith('style:')).forEach((t: string) => gearStyles.add(t));
  });

  let styleMatchCount = 0;
  weaponStyles.forEach(ws => {
    if (gearStyles.has(ws)) styleMatchCount++;
  });

  let styleScore = 0;
  if (weaponStyles.length > 0) {
    // Jaccard similarity or simple intersection coverage
    styleScore = Math.min(100, (styleMatchCount / weaponStyles.length) * 100);
  }

  // Calculate Total
  const COLOR_WEIGHT = 0.55;
  const STYLE_WEIGHT = 0.45;
  const total = Math.round((colorScore * COLOR_WEIGHT) + (styleScore * STYLE_WEIGHT));

  // Generate reasons
  const reasons: string[] = [];
  if (colorScore > 80 && bestMatchingGear) {
    reasons.push(`${bestMatchingGear.name}の色合いとマッチ！`);
  }
  if (styleScore > 50) {
    reasons.push(`コーディネートの雰囲気と合っています`);
  }

  return {
    total,
    colorScore: Math.round(colorScore),
    styleScore: Math.round(styleScore),
    reasons
  };
}
