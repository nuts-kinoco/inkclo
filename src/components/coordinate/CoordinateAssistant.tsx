'use client';

import React, { useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { GearCategory } from '@/types';
import { getWeightedAverageColor } from '@/lib/colorTheory';
import { runRecommendationEngine } from '@/lib/recommendation/engine';
import { Sparkles, Moon, Palette, ChevronLeft, ChevronRight, Dices, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CoordinateAssistantProps {
  activeCategoryTab: GearCategory;
}

export function CoordinateAssistant({ activeCategoryTab }: CoordinateAssistantProps) {
  const { coordinate, setGear, gears: allGears } = useBuilderStore();
  const [page, setPage] = useState(0);
  const [shuffleSalt, setShuffleSalt] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  // 装備中ギアやカテゴリタブが変わった際は、シャッフルとページを初期状態にリセット
  React.useEffect(() => {
    setPage(0);
    setShuffleSalt(0);
  }, [coordinate, activeCategoryTab]);

  // スクロール時に自動で折りたたむ処理
  React.useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      setIsOpen(false);
    };

    // キャプチャフェーズでスクロールイベントを監視（どの要素のスクロールも検知可能）
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

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
      },
      shuffleSalt
    });

    return {
      targetCategory: target,
      groups: generatedGroups
    };
  }, [coordinate, activeCategoryTab, allGears, shuffleSalt]);

  if (!groups || groups.length === 0) return null;

  const renderIcon = (iconName?: string) => {
    if (iconName === 'Moon') return <Moon size={16} className="text-gray-500" />;
    if (iconName === 'Palette') return <Palette size={16} className="text-gray-500" />;
    return <Sparkles size={16} className="text-gray-500" />;
  };

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(groups.length / ITEMS_PER_PAGE);
  const visibleGroups = groups.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleShuffleClick = () => {
    setShuffleSalt(prev => prev + 1);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-blue-100 dark:border-slate-700 overflow-hidden flex flex-col relative transition-all duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20 cursor-pointer select-none"
      >
        <Sparkles className="text-blue-500" size={18} />
        <h3 className="font-black text-gray-900 dark:text-gray-100 tracking-tight text-sm md:text-base">Coordinate Assistant</h3>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md dark:bg-slate-700 dark:text-gray-300">
          {targetCategory === 'head' ? 'アタマ' : targetCategory === 'body' ? 'フク' : 'クツ'}
        </span>
        
        {isOpen ? (
          <div className="ml-auto flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleShuffleClick}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg text-xs font-bold transition-colors"
            >
              <Dices size={14} />
              シャッフル
            </button>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 shadow-sm transition-all border border-gray-200 dark:border-slate-600"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 shadow-sm transition-all border border-gray-200 dark:border-slate-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 ml-1 transition-colors"
              aria-label="Collapse assistant"
            >
              <ChevronUp size={18} />
            </button>
          </div>
        ) : (
          <div className="ml-auto flex items-center">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Expand assistant"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="p-5 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {visibleGroups.map(group => (
            <div key={group.id} className="flex flex-col gap-3 min-w-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {renderIcon(group.icon)}
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">{group.title}</h4>
                </div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate">{group.description}</p>
              </div>
              
              {/* Horizontal Scroll Carousel */}
              <div className="flex overflow-x-auto snap-x hide-scrollbar gap-3 pb-2">
                {group.items.map(gear => (
                  <button
                    key={gear.id}
                    onClick={() => setGear(targetCategory, gear.id)}
                    className="flex flex-col items-center gap-2 p-2 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-750 transition-all shrink-0 snap-start w-[100px] group"
                  >
                    <div className="w-16 h-16 shrink-0 bg-white rounded-lg p-1 shadow-sm group-hover:shadow transition-shadow">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gear.imagePath} alt={gear.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col items-center w-full overflow-hidden">
                      <span className="text-[9px] text-gray-400 truncate w-full text-center leading-tight">{gear.brand.brandName}</span>
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate w-full text-center leading-tight mt-0.5">{gear.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
