'use client';

import { useRouter } from 'next/navigation';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useBuilderStore } from '@/store/builderStore';
import { CoordinatePreview } from '@/components/coordinate/CoordinatePreview';
import { ShareActions } from '@/components/coordinate/ShareActions';
import { createRef } from 'react';

export default function FavoritesPage() {
  const { coordinates, removeCoordinate } = useFavoritesStore();
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
      {coordinates.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-2xl">
          お気に入りがありません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {coordinates.map(coord => {
            const ref = createRef<HTMLDivElement>();
            return (
              <div key={coord.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-4">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-slate-200 truncate">{coord.name || '名称未設定コーデ'}</h3>
                    <span className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      {new Date(coord.createdAt).toLocaleDateString('ja-JP')} {new Date(coord.createdAt).toLocaleTimeString('ja-JP', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <button onClick={() => removeCoordinate(coord.id)} className="text-xs text-red-500 hover:text-red-600 font-bold shrink-0 ml-2 mt-1">
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
