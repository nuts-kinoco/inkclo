import { forwardRef } from 'react';
import { Coordinate, GearCategory } from '@/types';
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
    const { openGearDetail, gears } = useBuilderStore();

    const PreviewSlot = ({ category, title }: { category: GearCategory, title: string }) => {
      const gearId = coordinate[`${category}Id` as keyof Coordinate];
      const gear = gears.find(g => g.id === gearId);

      if (compact) {
        return (
          <div className="flex flex-col items-center flex-1 min-w-0 bg-gray-50 dark:bg-slate-700/50 rounded-xl p-2 border border-gray-100 dark:border-slate-700">
            {gear ? (
              <>
                <div className="w-12 h-12 relative mb-0.5 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gear.imagePath} alt={gear.name} className="object-contain w-full h-full" />
                </div>
                <div className="flex flex-col items-center w-full px-1 min-w-0">
                  <div className="flex items-center justify-center gap-0.5 opacity-80 mb-0.5 w-full min-w-0">
                    <img src={`/brands/${gear.brand.brandName}.png`} alt="" className="w-2.5 h-2.5 object-contain shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <span className="text-[8px] text-gray-400 dark:text-slate-400 font-bold leading-none truncate block">{gear.brand.brandName}</span>
                  </div>
                  <p className="text-[10px] font-bold text-center leading-tight line-clamp-2 w-full text-gray-600 dark:text-slate-300 break-words">{gear.name}</p>
                </div>
              </>
            ) : (
              <div className="w-12 h-12 flex items-center justify-center text-gray-300 dark:text-slate-500 text-xs">-</div>
            )}
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-600 w-full relative group transition-all hover:bg-gray-100/50 dark:hover:bg-slate-700/80 min-w-0">
          <span className="text-xs font-bold text-gray-400 dark:text-slate-400 mb-1 shrink-0">{title}</span>
          {gear ? (
            <>
              <div className="w-20 h-20 relative mb-1 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gear.imagePath} alt={gear.name} className="object-contain w-full h-full" />
              </div>
              <div className="flex flex-col items-center w-full px-1 min-w-0">
                <div className="flex items-center justify-center gap-1 opacity-80 mb-0.5 w-full min-w-0">
                  <img src={`/brands/${gear.brand.brandName}.png`} alt="" className="w-3 h-3 object-contain shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold leading-none truncate block">{gear.brand.brandName}</span>
                </div>
                <p className="text-sm font-bold text-center leading-tight dark:text-slate-200 line-clamp-2 break-words w-full">{gear.name}</p>
              </div>
              
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
