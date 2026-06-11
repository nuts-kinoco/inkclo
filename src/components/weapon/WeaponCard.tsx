import React from 'react';
import Image from 'next/image';
import { Weapon } from '@/types/weapon';

interface WeaponCardProps {
  weapon: Weapon;
  onClick?: () => void;
  selected?: boolean;
}

export function WeaponCard({ weapon, onClick, selected }: WeaponCardProps) {
  // Use dominant color with some opacity for the background
  const bgColor = weapon.dominantColor ? `${weapon.dominantColor}33` : 'rgba(255,255,255,0.1)';
  const borderColor = selected ? weapon.dominantColor || '#FFF' : 'transparent';

  return (
    <div 
      onClick={onClick}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300
        border-2 hover:scale-[1.02] active:scale-95 flex flex-col items-center justify-center p-3
      `}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        boxShadow: selected ? `0 0 15px ${weapon.dominantColor}40` : 'none'
      }}
    >
      <div className="relative w-16 h-16 md:w-20 md:h-20 drop-shadow-md">
        <Image
          src={weapon.imagePath}
          alt={weapon.name}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <div className="mt-2 text-xs font-bold text-center text-slate-800 dark:text-slate-200 line-clamp-1 w-full px-1">
        {weapon.name}
      </div>
    </div>
  );
}
