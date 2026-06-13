import React, { useMemo, useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Gear, GearCategory, ComparisonCandidate } from '@/types';
import { scoreCoordinate } from '@/lib/scoring/engine';
import { ChevronDown, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

interface ComparisonDrawerProps {
  allGears: Gear[];
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({ allGears }) => {
  const { 
    coordinate, 
    setGear,
    isComparisonOpen, 
    setComparisonOpen,
    comparisonCategory,
    setComparisonCategory,
    seasonOverride
  } = useBuilderStore();

  const [startIndex, setStartIndex] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const itemsPerPage = 5;

  const isReady = coordinate.headId && coordinate.bodyId && coordinate.shoesId;

  const currentHead = allGears.find(g => g.id === coordinate.headId);
  const currentBody = allGears.find(g => g.id === coordinate.bodyId);
  const currentShoes = allGears.find(g => g.id === coordinate.shoesId);

  const currentScore = useMemo(() => {
    if (!currentHead || !currentBody || !currentShoes) return null;
    return scoreCoordinate(currentHead, currentBody, currentShoes, seasonOverride);
  }, [currentHead, currentBody, currentShoes, seasonOverride]);

  const candidates: ComparisonCandidate[] = useMemo(() => {
    if (!isReady || !comparisonCategory || !currentHead || !currentBody || !currentShoes || !currentScore) return [];

    const currentGearId = coordinate[`${comparisonCategory}Id`];
    const categoryGears = allGears.filter(g => g.category === comparisonCategory && g.id !== currentGearId);
    
    const evaluated = categoryGears.slice(0, 50).map(gear => {
      const h = comparisonCategory === 'head' ? gear : currentHead;
      const b = comparisonCategory === 'body' ? gear : currentBody;
      const s = comparisonCategory === 'shoes' ? gear : currentShoes;
      
      return {
        gear,
        score: scoreCoordinate(h, b, s, seasonOverride),
        isBest: false
      };
    });

    evaluated.sort((a, b) => b.score.totalScore - a.score.totalScore);
    
    let topCandidates = [];
    if (evaluated.length <= itemsPerPage * 2) {
      topCandidates = evaluated;
    } else {
      const top50 = evaluated.slice(0, 50);
      
      const pseudoRandom = (seed: number) => {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      let seedCounter = shuffleSeed + 1;
      top50.sort(() => pseudoRandom(seedCounter++) - 0.5);
      
      topCandidates = top50.slice(0, 20);
    }
    
    // Find the max score among candidates to mark as BEST
    const maxCandidateScore = topCandidates.reduce((max, c) => Math.max(max, c.score.totalScore), -1);
    if (maxCandidateScore > currentScore.totalScore) {
      topCandidates.forEach(c => {
        if (c.score.totalScore === maxCandidateScore) {
          c.isBest = true;
        }
      });
    }

    return topCandidates;
  }, [isReady, comparisonCategory, currentHead, currentBody, currentShoes, allGears, seasonOverride, coordinate, currentScore, shuffleSeed]);

  if (!isComparisonOpen || !isReady || !currentHead || !currentBody || !currentShoes || !currentScore) return null;

  const renderCandidate = (c: ComparisonCandidate | null, isCurrent: boolean) => {
    const gear = isCurrent ? (comparisonCategory === 'head' ? currentHead : comparisonCategory === 'body' ? currentBody : currentShoes) : c?.gear;
    const score = isCurrent ? currentScore : c?.score;

    if (!gear || !score) return null;

    // 現在のギアが最高得点かどうか判定
    const maxCandidateScore = candidates.length > 0 ? candidates.reduce((max, cand) => Math.max(max, cand.score.totalScore), -1) : -1;
    const isBestCurrent = isCurrent && (score.totalScore >= maxCandidateScore);
    const isBest = isCurrent ? isBestCurrent : c?.isBest;

    return (
      <button 
        key={isCurrent ? 'current' : gear.id} 
        onClick={() => !isCurrent && comparisonCategory && setGear(comparisonCategory, gear.id)}
        disabled={isCurrent}
        className={`flex-shrink-0 w-36 bg-white rounded-xl border-2 p-3 mt-4 flex flex-col gap-2 text-left relative transition-all ${
          isCurrent 
            ? (isBest ? 'border-amber-400 bg-amber-50/30 cursor-default' : 'border-gray-900 bg-gray-50 cursor-default opacity-80')
            : isBest 
              ? 'border-amber-400 cursor-pointer hover:bg-amber-50 hover:-translate-y-1 hover:shadow-md' 
              : 'border-gray-200 cursor-pointer hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-md'
        }`}
      >
        {!isCurrent && isBest && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm whitespace-nowrap">★ BEST</div>}
        {isCurrent && (
          <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm whitespace-nowrap flex items-center ${isBest ? 'bg-amber-400' : 'bg-gray-900'}`}>
            <span>現在</span>
            {isBest && <span className="text-white border-l border-white/40 pl-1.5 ml-1.5">★ BEST</span>}
          </div>
        )}
        
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gear.imagePath} alt={gear.name} className="w-full h-auto aspect-square object-contain" />
        </div>
        <div className="text-xs font-bold text-gray-800 line-clamp-1 text-center w-full">{gear.name}</div>
        
        <div className="flex items-center justify-center gap-1 my-1 w-full">
          <span className="text-xs font-black px-1.5 py-0.5 rounded bg-gray-100">{score.totalRank}</span>
          <span className="text-lg font-black text-gray-900">{score.totalScore}</span>
        </div>

        <div className="flex flex-col gap-1.5 text-[10px] font-medium text-gray-500 w-full pt-1">
          <div className="flex justify-between items-center border-b border-gray-100 pb-0.5">
            <span className="tracking-widest uppercase text-[9px]">Color</span>
            <span className={score.axes.color.value >= currentScore.axes.color.value && !isCurrent ? 'text-gray-900 font-bold' : ''}>{score.axes.color.value}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-0.5">
            <span className="tracking-widest uppercase text-[9px]">Style</span>
            <span className={score.axes.style.value >= currentScore.axes.style.value && !isCurrent ? 'text-gray-900 font-bold' : ''}>{score.axes.style.value}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-0.5">
            <span className="tracking-widest uppercase text-[9px]">Season</span>
            <span className={score.axes.season.value >= currentScore.axes.season.value && !isCurrent ? 'text-gray-900 font-bold' : ''}>{score.axes.season.value}</span>
          </div>
          <div className="flex justify-between items-center pb-0.5">
            <span className="tracking-widest uppercase text-[9px]">Balance</span>
            <span className={score.axes.balance.value >= currentScore.axes.balance.value && !isCurrent ? 'text-gray-900 font-bold' : ''}>{score.axes.balance.value}</span>
          </div>
        </div>
      </button>
    );
  };

  const tabs: {id: GearCategory, label: string}[] = [
    {id: 'head', label: 'アタマ'},
    {id: 'body', label: 'フク'},
    {id: 'shoes', label: 'クツ'}
  ];

  const totalCandidates = candidates.length;
  const handlePrev = () => {
    if (totalCandidates === 0) return;
    setStartIndex((prev) => (prev - itemsPerPage + totalCandidates) % totalCandidates);
  };
  
  const handleNext = () => {
    if (totalCandidates === 0) return;
    setStartIndex((prev) => (prev + itemsPerPage) % totalCandidates);
  };
  
  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setShuffleSeed(s => s + 1);
      setStartIndex(0);
      setIsShuffling(false);
    }, 150);
  };

  const visibleCandidates = [];
  if (totalCandidates > 0) {
    for (let i = 0; i < Math.min(itemsPerPage, totalCandidates); i++) {
      visibleCandidates.push(candidates[(startIndex + i) % totalCandidates]);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 md:left-[360px] right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-200 z-50 animate-in slide-in-from-bottom-full duration-300">
      
      {/* 閉じるための格納ボタン（上部中央） */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <button 
          onClick={() => setComparisonOpen(false)}
          className="bg-white border border-gray-200 rounded-full p-1.5 shadow-md text-gray-400 hover:bg-gray-50 hover:text-gray-800 transition-all flex items-center justify-center group"
          aria-label="比較モードを閉じる"
        >
          <ChevronDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-4 pt-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>🔀</span>
              <span>比較モード</span>
            </h3>
            <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setComparisonCategory(t.id);
                    setStartIndex(0);
                  }}
                  className={`px-4 py-1 text-xs font-bold rounded-md transition-colors ${comparisonCategory === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t.label}を比較
                </button>
              ))}
            </div>
            <button
              onClick={handleShuffle}
              className={`flex items-center gap-1.5 px-3 py-1.5 ml-2 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-100 active:scale-95 active:bg-indigo-200 transition-all ${isShuffling ? 'opacity-70 pointer-events-none' : ''}`}
            >
              <Shuffle size={14} className={isShuffling ? 'animate-spin' : ''} />
              シャッフル
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pb-4 pt-2">
          {totalCandidates > itemsPerPage && (
            <button onClick={handlePrev} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
              <ChevronLeft size={24} />
            </button>
          )}
          
          <div className={`flex gap-4 px-2 overflow-x-auto snap-x transition-all duration-150 ${isShuffling ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {renderCandidate(null, true)}
            <div className="w-px bg-gray-200 self-stretch my-2" />
            {visibleCandidates.map(c => renderCandidate(c, false))}
          </div>
          
          {totalCandidates > itemsPerPage && (
            <button onClick={handleNext} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
