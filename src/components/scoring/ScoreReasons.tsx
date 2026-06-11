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
    let colorClass = 'text-gray-400';
    let bgClass = 'bg-transparent';

    if (reason.sentiment === 'positive') {
      icon = '+';
      colorClass = 'text-gray-900';
      bgClass = 'bg-gray-100';
    } else if (reason.sentiment === 'negative') {
      icon = '-';
      colorClass = 'text-gray-500';
      bgClass = 'bg-white border border-gray-200';
    }

    return (
      <div key={idx} className="flex items-start gap-2 text-sm mb-1.5">
        <span className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-medium mt-0.5 ${bgClass} ${colorClass}`}>
          {icon}
        </span>
        <span className="text-gray-600 leading-snug text-xs">{reason.text}</span>
      </div>
    );
  };

  const getAxisEnglish = (label: string) => {
    switch (label) {
      case '色彩調和': return 'COLOR';
      case 'スタイル統一': return 'STYLE';
      case '季節感': return 'SEASON';
      case '視覚バランス': return 'BALANCE';
      default: return label.toUpperCase();
    }
  };

  const renderAxisSection = (axis: ScoreAxis) => {
    if (!axis.reasons.length) return null;
    return (
      <div className="mb-5 last:mb-0">
        <h4 className="flex items-end gap-2 text-sm text-gray-800 mb-2.5 border-b border-gray-200 pb-1">
          <span className="font-light tracking-widest uppercase">{getAxisEnglish(axis.label)}</span>
          <span className="text-[10px] text-gray-400 font-normal mb-0.5">{axis.label}</span>
          <span className="ml-auto text-gray-900 font-light tracking-wider">{axis.value} <span className="text-[9px] text-gray-400">PTS</span></span>
        </h4>
        <div className="flex flex-col gap-0.5">
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
