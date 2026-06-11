import rawWeaponsData from './weapons.json';
import { Weapon, WeaponClass } from '@/types/weapon';

// Cast the raw data to our Weapon type
export const weapons: Weapon[] = rawWeaponsData.weapons as Weapon[];

const defaultWeapons = { weapons };
export default defaultWeapons;
