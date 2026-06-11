// src/components/scoring/ScoreRadar.tsx

import React from 'react';
import { ScoreAxis } from '@/types';

interface ScoreRadarProps {
  axes: {
    color: ScoreAxis;
    style: ScoreAxis;
    season: ScoreAxis;
    balance: ScoreAxis;
  };
  onAxisClick: () => void;
}

export const ScoreRadar: React.FC<ScoreRadarProps> = ({ axes, onAxisClick }) => {
  const renderAxis = (axis: ScoreAxis, colorClass: string) => {
    return (
      <div 
        className="flex items-center gap-3 py-1 cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
        onClick={onAxisClick}
      >
        <span className="text-xl w-6 text-center">{axis.icon}</span>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-gray-600">{axis.label}</span>
            <span className="text-sm font-black text-gray-800">{axis.value}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
              style={{ width: `${axis.value}%` }}
            />
          </div>
        </div>
        <div className="w-4 flex justify-end text-gray-300">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {renderAxis(axes.color, 'bg-pink-400')}
      {renderAxis(axes.style, 'bg-blue-400')}
      {renderAxis(axes.season, 'bg-green-400')}
      {renderAxis(axes.balance, 'bg-purple-400')}
    </div>
  );
};
