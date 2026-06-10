'use client';

import { useRouter } from 'next/navigation';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useBuilderStore } from '@/store/builderStore';
import { CoordinatePreview } from '@/components/coordinate/CoordinatePreview';
import { ShareActions } from '@/components/coordinate/ShareActions';
import { createRef } from 'react';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const { setCoordinate } = useBuilderStore();
  const router = useRouter();

  const handleEdit = (preset: any) => {
    setCoordinate({
      headId: preset.headId,
      bodyId: preset.bodyId,
      shoesId: preset.shoesId
    });
    router.push('/create');
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <h1 className="text-2xl font-black mb-8">お気に入りコーデ</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-2xl">
          お気に入りがありません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map(fav => {
            const ref = createRef<HTMLDivElement>();
            return (
              <div key={fav.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 truncate">{fav.title || '名称未設定コーデ'}</h3>
                  <button onClick={() => removeFavorite(fav.id)} className="text-xs text-red-500 hover:text-red-600 font-bold shrink-0 ml-2">
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
