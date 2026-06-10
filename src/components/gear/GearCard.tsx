import { Gear } from '@/types';
import { Info } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';

interface GearCardProps {
  gear: Gear;
  onClick?: (gear: Gear) => void;
  selected?: boolean;
}

export function GearCard({ gear, onClick, selected }: GearCardProps) {
  const { openGearDetail } = useBuilderStore();

  return (
    <div
      onClick={() => onClick?.(gear)}
      className={`
        relative flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer group
        ${selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-100 bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'}
      `}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          openGearDetail(gear);
        }}
        className="absolute top-2 right-2 p-1.5 bg-gray-100/80 hover:bg-gray-200 text-gray-500 hover:text-blue-500 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
        title="詳細情報"
      >
        <Info size={16} />
      </button>
      <div className="relative w-20 h-20 mb-2">
        {gear.imagePath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gear.imagePath}
            alt={gear.name}
            className="object-contain w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-slate-700 rounded-lg" />
        )}
      </div>
      <div className="text-center w-full">
        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{gear.brand.brandName}</p>
        <p className="text-sm font-bold text-gray-800 dark:text-slate-200 line-clamp-2 leading-tight">
          {gear.name}
        </p>
      </div>
      
      {/* Palette indicator */}
      <div className="flex gap-1 mt-2">
        {gear.palette.map((p, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full border border-gray-200 dark:border-slate-600"
            style={{ backgroundColor: p.color }}
            title={`${Math.round(p.ratio * 100)}%`}
          />
        ))}
      </div>
    </div>
  );
}
