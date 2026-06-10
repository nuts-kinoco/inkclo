import { Suspense } from 'react';
import { CoordinatePreview } from '@/components/coordinate/CoordinatePreview';

// Page requires searchParams which is an async API in Next.js 15
export default async function SharedCoordinatePage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string; b?: string; s?: string }>;
}) {
  const { h, b, s } = await searchParams;
  const coordinate = { headId: h, bodyId: b, shoesId: s };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-black mb-8">InClo - Shared Coordinate</h1>
      
      {/* Read-only Preview */}
      <CoordinatePreview coordinate={coordinate} readOnly />
      
      <div className="mt-8">
        <a 
          href="/create"
          className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
        >
          自分もコーデを作る
        </a>
      </div>
    </div>
  );
}
