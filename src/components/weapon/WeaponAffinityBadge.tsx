import React from 'react';
import { WeaponAffinityScore } from '@/lib/weapon/affinityEngine';
import { Sparkles } from 'lucide-react';

interface WeaponAffinityBadgeProps {
  affinity: WeaponAffinityScore;
}

export function WeaponAffinityBadge({ affinity }: WeaponAffinityBadgeProps) {
  if (affinity.total === 0) return null;

  // Determine color based on score
  let badgeColor = 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400';
  if (affinity.total >= 80) badgeColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50';
  else if (affinity.total >= 50) badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50';

  return (
    <div className="flex flex-col gap-1 items-center">
      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${badgeColor}`}>
        <Sparkles size={10} />
        {affinity.total}% MATCH
      </div>
    </div>
  );
}
