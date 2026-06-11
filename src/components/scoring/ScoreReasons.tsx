// src/components/scoring/ScoreReasons.tsx

import React from 'react';
import { ScoreAxis, ScoreReason } from '@/types';

interface ScoreReasonsProps {
  axes: {
    color: ScoreAxis;
    style: ScoreAxis;
    season: ScoreAxis;
    balance: ScoreAxis;
  };
  isOpen: boolean;
}

export const ScoreReasons: React.FC<ScoreReasonsProps> = ({ axes, isOpen }) => {
  if (!isOpen) return null;

  const renderReason = (reason: ScoreReason, idx: number) => {
    let icon = '•';
    let colorClass = 'text-gray-500';
    let bgClass = 'bg-gray-100';

    if (reason.sentiment === 'positive') {
      icon = '✓';
      colorClass = 'text-green-600';
      bgClass = 'bg-green-100';
    } else if (reason.sentiment === 'negative') {
      icon = '!';
      colorClass = 'text-red-500';
      bgClass = 'bg-red-100';
    }

    return (
      <div key={idx} className="flex items-start gap-2 text-sm mb-1.5">
        <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${bgClass} ${colorClass}`}>
          {icon}
        </span>
        <span className="text-gray-600 leading-snug">{reason.text}</span>
      </div>
    );
  };

  const renderAxisSection = (axis: ScoreAxis) => {
    if (!axis.reasons.length) return null;
    return (
      <div className="mb-4 last:mb-0">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide border-b pb-1">
          <span>{axis.icon}</span>
          <span>{axis.label}</span>
          <span className="ml-auto text-gray-400">{axis.value} pts</span>
        </h4>
        <div>
          {axis.reasons.map((r, i) => renderReason(r, i))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
      {renderAxisSection(axes.color)}
      {renderAxisSection(axes.style)}
      {renderAxisSection(axes.season)}
      {renderAxisSection(axes.balance)}
    </div>
  );
};
