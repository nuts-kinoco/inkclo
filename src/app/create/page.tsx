'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { GearCard } from '@/components/gear/GearCard';
import { FilterPanel, FilterState } from '@/components/gear/FilterPanel';
import { CoordinatePreview } from '@/components/coordinate/CoordinatePreview';
import { ShareActions } from '@/components/coordinate/ShareActions';
import { CoordinateAssistant } from '@/components/coordinate/CoordinateAssistant';
import { GearDetailModal } from '@/components/gear/GearDetailModal';
import gearsData from '@/lib/data/gears';
import { GearCategory, Gear } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { deltaE } from '@/lib/colorUtils';
import { ScorePanel } from '@/components/scoring/ScorePanel';
import { ComparisonDrawer } from '@/components/scoring/ComparisonDrawer';
import { SeasonSelector } from '@/components/scoring/SeasonSelector';
import { scoreCoordinate } from '@/lib/scoring/engine';

export default function CreatePage() {
  const { coordinate, setGear, removeGear, seasonOverride, setComparisonOpen, setComparisonCategory } = useBuilderStore();
  const gears = gearsData.gears as Gear[];
  
  const previewRef = useRef<HTMLDivElement>(null);
  const prevGearCountRef = useRef(0);

  // Category Tabs
  const [activeCategory, setActiveCategory] = useState<GearCategory>('head');

  // Filters State
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    brands: [],
    limit: 30,
    page: 1,
    tags: [],
    colorThreshold: 30,
    sortBy: 'nameAsc',
    customColor: null
  });

  // Mobile sticky bar state
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  // Scoring
  const currentHead = useMemo(() => gears.find(g => g.id === coordinate.headId), [coordinate.headId, gears]);
  const currentBody = useMemo(() => gears.find(g => g.id === coordinate.bodyId), [coordinate.bodyId, gears]);
  const currentShoes = useMemo(() => gears.find(g => g.id === coordinate.shoesId), [coordinate.shoesId, gears]);

  const currentScore = useMemo(() => {
    if (currentHead && currentBody && currentShoes) {
      return scoreCoordinate(currentHead, currentBody, currentShoes, seasonOverride);
    }
    return null;
  }, [currentHead, currentBody, currentShoes, seasonOverride]);

  // Q2: Auto-open comparison
  useEffect(() => {
    const selectedCount = [coordinate.headId, coordinate.bodyId, coordinate.shoesId].filter(Boolean).length;
    
    if (selectedCount === 2 && prevGearCountRef.current < 2) {
      const unselectedCategory = !coordinate.headId ? 'head' : !coordinate.bodyId ? 'body' : 'shoes';
      setComparisonCategory(unselectedCategory);
      setComparisonOpen(true);
    }
    
    prevGearCountRef.current = selectedCount;
  }, [coordinate, setComparisonOpen, setComparisonCategory]);

  // Filtered Gears (all categories)
  const allFilteredGears = useMemo(() => {
    let result = gears;

    if (filter.searchQuery) {
      result = result.filter(g => g.name.toLowerCase().includes(filter.searchQuery.toLowerCase()));
    }
    if (filter.brands.length > 0) {
      result = result.filter(g => filter.brands.includes(g.brand.brandId));
    }
    if (filter.tags.length > 0) {
      const selectedHexes = filter.tags.map(t => {
        if (t === 'color:white') return '#FFFFFF';
        if (t === 'color:black') return '#000000';
        if (t === 'color:red') return '#FF0000';
        if (t === 'color:blue') return '#0000FF';
        if (t === 'color:yellow') return '#FFFF00';
        if (t === 'color:green') return '#00FF00';
        if (t === 'color:pink') return '#FFC0CB';
        return null;
      }).filter(Boolean) as string[];
      
      if (selectedHexes.length > 0) {
        result = result.filter(g => g.palette && g.palette.some(p => {
          return selectedHexes.some(hex => deltaE(p.color, hex) <= filter.colorThreshold);
        }));
      }
    }

    if (filter.customColor) {
      const customHex = filter.customColor;
      const getMinDistance = (g: Gear) => {
        if (!g.palette || g.palette.length === 0) return 999;
        return Math.min(...g.palette.map(p => deltaE(customHex, p.color)));
      };
      result = result.filter(g => getMinDistance(g) < 40);
    }

    return result;
  }, [filter, gears]);

  // Filtered & Sorted Gears (active category only)
  const filteredGears = useMemo(() => {
    let result = allFilteredGears.filter(gear => gear.category === activeCategory);

    if (filter.customColor) {
      const customHex = filter.customColor;
      const getMinDistance = (g: Gear) => {
        if (!g.palette || g.palette.length === 0) return 999;
        return Math.min(...g.palette.map(p => deltaE(customHex, p.color)));
      };
      result.sort((a, b) => getMinDistance(a) - getMinDistance(b));
    } else {
      result.sort((a, b) => {
        if (filter.sortBy === 'nameAsc') return a.name.localeCompare(b.name);
        if (filter.sortBy === 'nameDesc') return b.name.localeCompare(a.name);
        return 0;
      });
    }

    return result;
  }, [allFilteredGears, activeCategory, filter.customColor, filter.sortBy]);


  return (
    <div className="min-h-screen flex flex-col md:flex-row pb-[200px] md:pb-0">
      
      {/* Desktop Sidebar: Preview */}
      <div className="hidden md:flex w-[360px] bg-white dark:bg-slate-900 p-5 border-r border-gray-200 dark:border-slate-800 flex-col items-center shadow-sm z-10 shrink-0 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto">
        <h2 className="text-xl font-black tracking-tight mb-4 w-full text-left dark:text-slate-200">Your Coordinate</h2>
        <CoordinatePreview
          ref={previewRef}
          coordinate={coordinate}
          onRemoveGear={removeGear}
        />
        <div className="w-full mt-4">
          <ScorePanel score={currentScore} />
        </div>
        <ShareActions 
          coordinate={coordinate} 
          previewRef={previewRef} 
        />
      </div>

      {/* Main Content: Catalog */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
        
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-200 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {[
            { id: 'head', label: 'アタマ' },
            { id: 'body', label: 'フク' },
            { id: 'shoes', label: 'クツ' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as GearCategory)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                activeCategory === cat.id 
                  ? 'bg-white dark:bg-slate-700 text-black dark:text-slate-200 shadow-sm' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <CoordinateAssistant activeCategoryTab={activeCategory} />
        <SeasonSelector />

        <FilterPanel 
          filter={filter}
          onChange={setFilter}
        />
        
        {filteredGears.length === 0 ? (
          <div className="p-10 text-center text-gray-400 dark:text-slate-500 font-bold border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
            条件に一致するギアがありません
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredGears.slice((filter.page - 1) * filter.limit, filter.page * filter.limit).map((gear) => (
                <GearCard
                  key={gear.id}
                  gear={gear}
                  selected={coordinate[`${gear.category}Id` as keyof typeof coordinate] === gear.id}
                  onClick={() => setGear(gear.category as GearCategory, gear.id)}
                />
              ))}
            </div>
            
            {Math.ceil(filteredGears.length / filter.limit) > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pb-4">
                <button 
                  onClick={() => setFilter({ ...filter, page: Math.max(1, filter.page - 1) })}
                  disabled={filter.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 font-bold text-sm bg-white dark:bg-slate-800 dark:text-slate-200"
                >
                  前へ
                </button>
                <span className="text-sm font-bold text-gray-500 dark:text-slate-400">
                  {filter.page} / {Math.ceil(filteredGears.length / filter.limit)} ページ
                </span>
                <button 
                  onClick={() => setFilter({ ...filter, page: Math.min(Math.ceil(filteredGears.length / filter.limit), filter.page + 1) })}
                  disabled={filter.page === Math.ceil(filteredGears.length / filter.limit)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-700 font-bold text-sm bg-white dark:bg-slate-800 dark:text-slate-200"
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 transition-transform duration-300 ${isMobilePreviewOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
        {/* Toggle Bar */}
        <button 
          onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)}
          className="w-full h-[80px] px-6 flex items-center justify-between bg-white dark:bg-slate-900 focus:outline-none"
        >
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-400">プレビュー・共有</span>
            <span className="text-sm font-black dark:text-slate-200">
              {Object.keys(coordinate).length}/3 選択中
            </span>
          </div>
          <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 dark:text-slate-200 rounded-full flex items-center justify-center">
            {isMobilePreviewOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        </button>

        {/* Expanded Content */}
        <div className="p-6 pt-0 max-h-[60vh] overflow-y-auto">
          <CoordinatePreview
            coordinate={coordinate}
            onRemoveGear={removeGear}
          />
          <div className="w-full mt-4">
            <ScorePanel score={currentScore} />
          </div>
          <ShareActions 
            coordinate={coordinate} 
            previewRef={previewRef} 
          />
        </div>
      </div>

      <ComparisonDrawer allGears={gears} />
      <GearDetailModal />
    </div>
  );
}
