import { WeaponClass } from '@/types/weapon';

export const weaponClassToStyles: Record<WeaponClass, string[]> = {
  shooter: ['style:casual', 'style:sporty'],
  blaster: ['style:street', 'style:tech'],
  charger: ['style:formal', 'style:tech', 'style:cool'],
  slosher: ['style:casual', 'style:pop'],
  splatling: ['style:heavy', 'style:military', 'style:tech'],
  dualies: ['style:sporty', 'style:street', 'style:cool'],
  brella: ['style:formal', 'style:elegance'],
  brush: ['style:art', 'style:pop', 'style:casual'],
  roller: ['style:street', 'style:casual', 'style:work'],
  stringer: ['style:tech', 'style:outdoor', 'style:cool'],
  splatana: ['style:street', 'style:cool', 'style:formal']
};

export function getWeaponStyles(weaponClass: WeaponClass, weaponSpecificTags: string[] = []): string[] {
  // Merge default class tags with any weapon-specific tags
  const defaults = weaponClassToStyles[weaponClass] || [];
  return Array.from(new Set([...defaults, ...weaponSpecificTags]));
}
