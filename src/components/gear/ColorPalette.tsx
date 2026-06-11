import React, { useState } from 'react';
import { ColorProfile } from '@/types';
import { ColorChip } from './ColorChip';
import { Check, Copy } from 'lucide-react';

interface ColorPaletteProps {
  palette: ColorProfile[];
}

export function ColorPalette({ palette }: ColorPaletteProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!palette || palette.length === 0) {
    return <div className="text-sm text-gray-400">パレット情報がありません</div>;
  }

  const handleCopy = (color: string, index: number) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {palette.filter(p => Math.round(p.ratio * 100) >= 1).map((p, idx) => (
        <div 
          key={idx} 
          className="flex items-center gap-3 p-1 -m-1 rounded hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors relative"
          onClick={() => handleCopy(p.color, idx)}
          title={`${p.color} をコピー`}
        >
          <ColorChip color={p.color} className="w-8 h-8 rounded-md shrink-0" />
          <div className="flex-1 flex items-center gap-2">
            <div className="w-12 text-xs font-mono text-gray-500 text-right shrink-0 group-hover:text-blue-500 transition-colors">
              {Math.round(p.ratio * 100)}%
            </div>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
              <div 
                className="h-full rounded-full transition-all"
                style={{ backgroundColor: p.color, width: `${p.ratio * 100}%` }}
              />
            </div>
            <div className="w-5 shrink-0 flex justify-center text-gray-400 group-hover:text-blue-500">
              {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
