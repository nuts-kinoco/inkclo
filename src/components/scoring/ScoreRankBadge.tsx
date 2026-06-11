// src/components/scoring/ScoreRankBadge.tsx

import React from 'react';
import { Rank } from '@/types';
import { RANK_COLORS } from '@/lib/scoring/weights';

interface ScoreRankBadgeProps {
  rank: Rank;
  score: number;
}

export const ScoreRankBadge: React.FC<ScoreRankBadgeProps> = ({ rank, score }) => {
  const colors = RANK_COLORS[rank];

  return (
    <div className="flex items-center gap-3 mb-4">
      <div 
        className={`w-14 h-14 rounded-2xl shadow-sm border-2 flex items-center justify-center
          ${colors.bg} ${colors.border}`}
      >
        <span className={`text-2xl font-black italic tracking-tighter ${colors.text} drop-shadow-sm`}>
          {rank}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-800 tracking-tight leading-none">
          {score}
        </span>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
          Points
        </span>
      </div>
    </div>
  );
};
