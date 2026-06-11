// src/components/scoring/ScorePanel.tsx

import React, { useState } from 'react';
import { CoordinateScore } from '@/types';
import { ScoreRankBadge } from './ScoreRankBadge';
import { ScoreRadar } from './ScoreRadar';
import { ScoreReasons } from './ScoreReasons';
import { useBuilderStore } from '@/store/builderStore';

interface ScorePanelProps {
  score: CoordinateScore | null;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({ score }) => {
  const [isReasonsOpen, setIsReasonsOpen] = useState(false);
  const { setComparisonOpen, setComparisonCategory } = useBuilderStore();

  if (!score) return null;

  const handleCompareClick = () => {
    // Default to comparing body if nothing is selected yet, or prompt user
    // For simplicity, we just open the drawer and let it handle category selection
    setComparisonCategory('body');
    setComparisonOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6 animate-in fade-in zoom-in-95 duration-300">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
        Coordinate Score
      </h3>
      
      <ScoreRankBadge rank={score.totalRank} score={score.totalScore} />
      
      <ScoreRadar 
        axes={score.axes} 
        onAxisClick={() => setIsReasonsOpen(!isReasonsOpen)} 
      />
      
      <button 
        onClick={() => setIsReasonsOpen(!isReasonsOpen)}
        className="mt-4 w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"
      >
        <span>{isReasonsOpen ? '▴' : '▾'}</span>
        <span>詳細を見る</span>
      </button>

      <ScoreReasons axes={score.axes} isOpen={isReasonsOpen} />

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleCompareClick}
          className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>🔀</span>
          <span>他のギアと比較する</span>
        </button>
      </div>
    </div>
  );
};
