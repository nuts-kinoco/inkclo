'use client';

import React, { useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { GearCategory, Gear } from '@/types';
import gearsData from '@/lib/data/gears';
import { getWeightedAverageColor } from '@/lib/colorTheory';
import { runRecommendationEngine } from '@/lib/recommendation/engine';
import { Sparkles, Moon, Palette, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CoordinateAssistantProps {
  activeCategoryTab: GearCategory;
}

export function CoordinateAssistant({ activeCategoryTab }: CoordinateAssistantProps) {
  const { coordinate, setGear } = useBuilderStore();
  const allGears = gearsData.gears as Gear[];
  const [page, setPage] = useState(0);

  React.useEffect(() => {
    setPage(0);
  }, [coordinate, activeCategoryTab]);

  const { targetCategory, groups } = useMemo(() => {
    // Determine target category
    let target: GearCategory = activeCategoryTab;
    if (!coordinate.headId) target = 'head';
    else if (!coordinate.bodyId) target = 'body';
    else if (!coordinate.shoesId) target = 'shoes';

    // Get current colors
    const colors = [];
    const h = allGears.find(g => g.id === coordinate.headId);
    const b = allGears.find(g => g.id === coordinate.bodyId);
    const s = allGears.find(g => g.id === coordinate.shoesId);

    if (h?.dominantColor) colors.push({ hex: h.dominantColor, weight: 0.25 });
    if (b?.dominantColor) colors.push({ hex: b.dominantColor, weight: 0.50 });
    if (s?.dominantColor) colors.push({ hex: s.dominantColor, weight: 0.25 });

    if (colors.length === 0) return { targetCategory: target, groups: [] };

    const baseHex = getWeightedAverageColor(colors);
    if (!baseHex) return { targetCategory: target, groups: [] };

    const generatedGroups = runRecommendationEngine({
      baseColor: baseHex,
      targetCategory: target,
      allGears,
      coordinate: {
        headId: coordinate.headId || null,
        bodyId: coordinate.bodyId || null,
        shoesId: coordinate.shoesId || null
      }
    });

    return {
      targetCategory: target,
      groups: generatedGroups
    };
  }, [coordinate, activeCategoryTab, allGears]);

  if (!groups || groups.length === 0) return null;

  const renderIcon = (iconName?: string) => {
    if (iconName === 'Moon') return <Moon size={16} className="text-gray-500" />;
    if (iconName === 'Palette') return <Palette size={16} className="text-gray-500" />;
    return <Sparkles size={16} className="text-gray-500" />;
  };

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
  const visibleGroups = groups.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="w-full mt-6 bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden flex flex-col relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-blue-50/50 to-transparent">
        <Sparkles className="text-blue-500" size={18} />
        <h3 className="font-black text-gray-900 tracking-tight">Coordinate Assistant</h3>
        <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md dark:bg-gray-800 dark:text-gray-400">
          Target: {targetCategory === 'head' ? 'アタマ' : targetCategory === 'body' ? 'フク' : 'クツ'}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1 ml-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-100 shadow-sm transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 rounded bg-white text-gray-600 disabled:opacity-30 hover:bg-gray-100 shadow-sm transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="p-5 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {visibleGroups.map(group => (
          <div key={group.id} className="flex flex-col gap-3 min-w-0">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {renderIcon(group.icon)}
                <h4 className="font-bold text-sm text-gray-800 truncate">{group.title}</h4>
              </div>
              <p className="text-xs font-bold text-gray-500 truncate">{group.description}</p>
            </div>
            
            {/* Horizontal Scroll Carousel */}
            <div className="flex overflow-x-auto snap-x hide-scrollbar gap-3 pb-2">
              {group.items.map(gear => (
                <button
                  key={gear.id}
                  onClick={() => setGear(targetCategory, gear.id)}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all shrink-0 snap-start w-[100px] group"
                >
                  <div className="w-16 h-16 shrink-0 bg-white rounded-lg p-1 shadow-sm group-hover:shadow transition-shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gear.imagePath} alt={gear.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col items-center w-full overflow-hidden">
                    <span className="text-[9px] text-gray-400 truncate w-full text-center leading-tight">{gear.brand.brandName}</span>
                    <span className="text-[11px] font-bold text-gray-700 truncate w-full text-center leading-tight mt-0.5">{gear.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
