// src/components/scoring/SeasonSelector.tsx

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';

export const SeasonSelector: React.FC = () => {
  const { seasonOverride, setSeasonOverride } = useBuilderStore();

  const seasons = [
    { id: null, label: '自動判定' },
    { id: 'spring', label: '🌸 春' },
    { id: 'summer', label: '🌻 夏' },
    { id: 'autumn', label: '🍁 秋' },
    { id: 'winter', label: '❄️ 冬' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-gray-500">季節のテーマ:</span>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {seasons.map(s => (
            <button
              key={s.id || 'auto'}
              onClick={() => setSeasonOverride(s.id as 'spring' | 'summer' | 'autumn' | 'winter' | null)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                seasonOverride === s.id 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
