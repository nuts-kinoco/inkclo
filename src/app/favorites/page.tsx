'use client';

import { useRouter } from 'next/navigation';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useBuilderStore } from '@/store/builderStore';
import { CoordinatePreview } from '@/components/coordinate/CoordinatePreview';
import { ShareActions } from '@/components/coordinate/ShareActions';
import { useState, useMemo, createRef } from 'react';
import { scoreCoordinate } from '@/lib/scoring/engine';
import gearsData from '@/lib/data/gears';
import { Gear } from '@/types';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const { setCoordinate } = useBuilderStore();
  const router = useRouter();
  
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const gears = gearsData.gears as Gear[];

  const evaluatedFavorites = useMemo(() => {
    return favorites.map(fav => {
      let scoreObj = null;
      if (fav.headId && fav.bodyId && fav.shoesId) {
        const h = gears.find(g => g.id === fav.headId);
        const b = gears.find(g => g.id === fav.bodyId);
        const s = gears.find(g => g.id === fav.shoesId);
        if (h && b && s) {
          scoreObj = scoreCoordinate(h, b, s);
        }
      }
      return { ...fav, scoreObj };
    });
  }, [favorites, gears]);

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

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <h1 className="text-2xl font-black">お気に入りコーデ</h1>
        
        {favorites.length > 0 && (
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'date' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              新着順
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === 'score' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              スコア順
            </button>
          </div>
        )}
      </div>
      {favorites.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-2xl">
          お気に入りがありません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedFavorites.map(fav => {
            const ref = createRef<HTMLDivElement>();
            return (
              <div key={fav.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-4 gap-2">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <h3 className="font-bold text-gray-800 truncate">{fav.title || '名称未設定コーデ'}</h3>
                    {fav.scoreObj && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-gray-900 text-white">{fav.scoreObj.totalRank}</span>
                        <span className="text-xs font-bold text-gray-500">{fav.scoreObj.totalScore} pts</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeFavorite(fav.id)} className="text-xs text-red-500 hover:text-red-600 font-bold shrink-0 mt-1">
                    削除
                  </button>
                </div>
                <div className="w-full pointer-events-none">
                  <CoordinatePreview
                    ref={ref}
                    coordinate={fav}
                    readOnly
                  />
                </div>
                <div className="w-full">
                  <ShareActions coordinate={fav} previewRef={ref} />
                  <button
                    onClick={() => handleEdit(fav)}
                    className="mt-3 w-full py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors"
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
