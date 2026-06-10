import { forwardRef } from 'react';
import { Coordinate, GearCategory, Gear } from '@/types';
import gearsData from '@/lib/data/gears';
import { useBuilderStore } from '@/store/builderStore';
import { Info, X } from 'lucide-react';

interface CoordinatePreviewProps {
  coordinate: Coordinate;
  onRemoveGear?: (category: GearCategory) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export const CoordinatePreview = forwardRef<HTMLDivElement, CoordinatePreviewProps>(
  ({ coordinate, onRemoveGear, readOnly = false, compact = false }, ref) => {
    const gears = gearsData.gears as Gear[];
    const { openGearDetail } = useBuilderStore();

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
        <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 w-full relative group transition-all hover:bg-gray-100/50 dark:hover:bg-slate-700/80">
          <span className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1">{title}</span>
          {gear ? (
            <>
              <div className="w-20 h-20 relative mb-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gear.imagePath} alt={gear.name} className="object-contain w-full h-full" />
              </div>
              <p className="text-sm font-bold text-center leading-tight dark:text-slate-200">{gear.name}</p>
              
              {!readOnly && (
                <>
                  {/* 左上: 詳細情報(i)ボタン */}
                  <button
                    onClick={() => openGearDetail(gear)}
                    className="absolute top-2 left-2 w-6 h-6 bg-white dark:bg-slate-600 hover:bg-blue-50 dark:hover:bg-slate-500 text-gray-500 dark:text-slate-200 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 dark:border-slate-500"
                    title="カラー詳細を表示"
                  >
                    <Info size={12} />
                  </button>
                  
                  {/* 右上: 装備解除(×)ボタン */}
                  {onRemoveGear && (
                    <button
                      onClick={() => onRemoveGear(category)}
                      className="absolute top-2 right-2 w-6 h-6 bg-white dark:bg-slate-600 hover:bg-red-50 dark:hover:bg-slate-500 text-gray-500 dark:text-slate-200 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100 dark:border-slate-500"
                      title="装備を外す"
                    >
                      <X size={12} />
                    </button>
                  )}
                </>
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
