import React from 'react';
import { ColorProfile } from '@/types';
import { ColorChip } from './ColorChip';

interface ColorPaletteProps {
  palette: ColorProfile[];
}

export function ColorPalette({ palette }: ColorPaletteProps) {
  if (!palette || palette.length === 0) {
    return <div className="text-sm text-gray-400">パレット情報がありません</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {palette.filter(p => Math.round(p.ratio * 100) >= 1).map((p, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <ColorChip color={p.color} className="w-8 h-8 rounded-md" />
          <div className="flex-1 flex items-center gap-2">
            <div className="w-12 text-xs font-mono text-gray-500 text-right">
              {Math.round(p.ratio * 100)}%
            </div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  backgroundColor: p.color, 
                  width: `${p.ratio * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
