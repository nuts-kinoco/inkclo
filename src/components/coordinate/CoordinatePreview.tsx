import { forwardRef } from 'react';
import { Coordinate, GearCategory } from '@/types';
import gearsData from '@/lib/data/gears';

interface CoordinatePreviewProps {
  coordinate: Coordinate;
  onRemoveGear?: (category: GearCategory) => void;
  readOnly?: boolean;
}

export const CoordinatePreview = forwardRef<HTMLDivElement, CoordinatePreviewProps>(
  ({ coordinate, onRemoveGear, readOnly = false }, ref) => {
    const gears = gearsData.gears;

    const PreviewSlot = ({ category, title }: { category: GearCategory, title: string }) => {
      const gearId = coordinate[`${category}Id` as keyof Coordinate];
      const gear = gears.find(g => g.id === gearId);

      return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 w-full relative group">
          <span className="text-sm font-bold text-gray-400 mb-2">{title}</span>
          {gear ? (
            <>
              <div className="w-24 h-24 relative mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={gear.imagePath} alt={gear.name} className="object-contain w-full h-full" />
              </div>
              <p className="text-sm font-bold text-center leading-tight">{gear.name}</p>
              {!readOnly && onRemoveGear && (
                <button
                  onClick={() => onRemoveGear(category)}
                  className="absolute top-2 right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              )}
            </>
          ) : (
            <div className="w-24 h-24 flex items-center justify-center text-gray-300 text-sm">
              未選択
            </div>
          )}
        </div>
      );
    };

    return (
      <div ref={ref} className="flex flex-col gap-4 w-full max-w-xs bg-white p-4 rounded-xl">
        <PreviewSlot category="head" title="アタマ" />
        <PreviewSlot category="body" title="フク" />
        <PreviewSlot category="shoes" title="クツ" />
      </div>
    );
  }
);

CoordinatePreview.displayName = 'CoordinatePreview';
