'use client';

import { useRouter } from 'next/navigation';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useBuilderStore } from '@/store/builderStore';
import { CoordinatePreview } from '@/components/coordinate/CoordinatePreview';
import { ShareActions } from '@/components/coordinate/ShareActions';
import { useState, useMemo, createRef } from 'react';
import { scoreCoordinate } from '@/lib/scoring/engine';
import { Gear } from '@/types';
import { useEffect } from 'react';

export default function FavoritesPage() {
  const { coordinates, removeCoordinate } = useFavoritesStore();
  const { setCoordinate, gears, loadGears, isGearsLoaded } = useBuilderStore();
  const router = useRouter();
  
  useEffect(() => {
    loadGears();
  }, [loadGears]);

  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const evaluatedFavorites = useMemo(() => {
    return coordinates.map(coord => {
      let scoreObj = null;
      if (coord.headId && coord.bodyId && coord.shoesId) {
        const h = gears.find(g => g.id === coord.headId);
        const b = gears.find(g => g.id === coord.bodyId);
        const s = gears.find(g => g.id === coord.shoesId);
        if (h && b && s) {
          scoreObj = scoreCoordinate(h, b, s);
        }
      }
      return { ...coord, scoreObj };
    });
  }, [coordinates, gears]);

  const sortedFavorites = useMemo(() => {
    const list = [...evaluatedFavorites];
    if (sortBy === 'score') {
      list.sort((a, b) => {
        const scoreA = a.scoreObj ? a.scoreObj.totalScore : -1;
        const scoreB = b.scoreObj ? b.scoreObj.totalScore : -1;
        return scoreB - scoreA;
      });
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [evaluatedFavorites, sortBy]);

  const handleEdit = (preset: {headId?: string, bodyId?: string, shoesId?: string}) => {
    setCoordinate({
      headId: preset.headId,
      bodyId: preset.bodyId,
      shoesId: preset.shoesId
    });
    router.push('/create');
  };

  if (!isGearsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <h1 className="text-2xl font-black">お気に入りコーデ</h1>
        
        {coordinates.length > 0 && (
          <div className="flex bg-gray-200 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'date' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
            >
              新着順
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'score' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
            >
              スコア順
            </button>
          </div>
        )}
      </div>
      {coordinates.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-2xl">
          お気に入りがありません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedFavorites.map(coord => {
            const ref = createRef<HTMLDivElement>();
            return (
              <div key={coord.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-4 gap-2">
                  <div className="flex flex-col gap-1 overflow-hidden min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-slate-200 truncate">{coord.name || '名称未設定コーデ'}</h3>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {new Date(coord.createdAt).toLocaleDateString('ja-JP')} {new Date(coord.createdAt).toLocaleTimeString('ja-JP', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {coord.scoreObj && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-900 dark:bg-slate-700 text-white dark:text-slate-200">{coord.scoreObj.totalRank}</span>
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-400">{coord.scoreObj.totalScore} pts</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeCoordinate(coord.id)} className="text-xs text-red-500 hover:text-red-600 font-bold shrink-0 mt-1">
                    削除
                  </button>
                </div>
                <div className="w-full pointer-events-none mt-2 mb-4">
                  <CoordinatePreview
                    ref={ref}
                    coordinate={coord}
                    readOnly
                    compact
                  />
                </div>
                <div className="w-full mt-auto">
                  <ShareActions coordinate={coord} previewRef={ref} hideSaveButton />
                  <button
                    onClick={() => handleEdit(coord)}
                    className="mt-3 w-full py-2 bg-gray-100 dark:bg-slate-700/50 text-gray-800 dark:text-slate-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm"
                  >
                    このコーデを再編集する
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
