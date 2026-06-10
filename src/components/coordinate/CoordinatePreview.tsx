import { forwardRef } from 'react';
import { Coordinate, GearCategory } from '@/types';
import gearsData from '@/lib/data/gears';

interface CoordinatePreviewProps {
  coordinate: Coordinate;
  onRemoveGear?: (category: GearCategory) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export const CoordinatePreview = forwardRef<HTMLDivElement, CoordinatePreviewProps>(
  ({ coordinate, onRemoveGear, readOnly = false, compact = false }, ref) => {
    const gears = gearsData.gears;

    const PreviewSlot = ({ category, title }: { category: GearCategory, title: string }) => {
      const gearId = coordinate[`${category}Id` as keyof Coordinate];
      const gear = gears.find(g => g.id === gearId);

      if (compact) {
        return (
          <div className="flex flex-col items-center flex-1 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-2 border border-gray-100 dark:border-slate-700">
            {gear ? (
              <>
                <div className="w-12 h-12 relative mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gear.imagePath} alt={gear.name} className="object-contain w-full h-full" />
                </div>
                <p className="text-[10px] font-bold text-center leading-tight line-clamp-2 w-full text-gray-600 dark:text-slate-300">{gear.name}</p>
              </>
            ) : (
              <div className="w-12 h-12 flex items-center justify-center text-gray-300 dark:text-slate-500 text-xs">-</div>
            )}
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 w-full relative group">
          <span className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1">{title}</span>
          {gear ? (
            <>
              <div className="w-20 h-20 relative mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gear.imagePath} alt={gear.name} className="object-contain w-full h-full" />
              </div>
              <p className="text-sm font-bold text-center leading-tight dark:text-slate-200">{gear.name}</p>
              {!readOnly && onRemoveGear && (
                <button
                  onClick={() => onRemoveGear(category)}
                  className="absolute top-2 right-2 w-6 h-6 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-600 dark:text-slate-200 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </>
          ) : (
            <div className="w-20 h-20 flex items-center justify-center text-gray-300 dark:text-slate-500 text-xs">
              未選択
            </div>
          )}
        </div>
      );
    };

    return (
      <div ref={ref} className={`flex ${compact ? 'flex-row gap-2 p-2' : 'flex-col gap-2 p-2'} w-full max-w-xs bg-white dark:bg-slate-800 rounded-xl mx-auto`}>
        <PreviewSlot category="head" title="アタマ" />
        <PreviewSlot category="body" title="フク" />
        <PreviewSlot category="shoes" title="クツ" />
      </div>
    );
  }
);

CoordinatePreview.displayName = 'CoordinatePreview';
