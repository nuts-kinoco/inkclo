'use client';

import React, { useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { ColorPalette } from './ColorPalette';
import { ColorChip } from './ColorChip';
import { TagList } from '../ui/TagList';
import { X } from 'lucide-react';

export function GearDetailModal() {
  const { selectedGearForDetail, closeGearDetail, coordinate, setGear } = useBuilderStore();

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGearDetail();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeGearDetail]);

  if (!selectedGearForDetail) return null;

  const gear = selectedGearForDetail;
  const isEquipped = coordinate[`${gear.category}Id` as keyof typeof coordinate] === gear.id;

  const handleEquip = () => {
    if (!isEquipped) {
      setGear(gear.category, gear.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4 transition-opacity">
      {/* Backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={closeGearDetail}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 md:zoom-in-95">
        
        {/* Header / Close Button */}
        <button 
          onClick={closeGearDetail}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-10 transition-colors"
        >
          <X size={18} className="text-gray-600" />
        </button>

        <div className="overflow-y-auto p-6 pb-24 md:pb-6 flex-1">
          {/* Image */}
          <div className="w-full h-48 bg-gray-50 rounded-xl mb-6 flex items-center justify-center p-4 border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={gear.imagePath} 
              alt={gear.name} 
              className="object-contain w-full h-full drop-shadow-sm"
            />
          </div>

          {/* Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 mb-1">{gear.name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
              <span>{gear.brand.brandName}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>
                {gear.category === 'head' ? 'アタマ' : gear.category === 'body' ? 'フク' : 'クツ'}
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100 my-6" />

          {/* Colors */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Main Color</h3>
              <div className="flex items-center gap-3">
                <ColorChip color={gear.dominantColor} className="w-10 h-10 rounded-lg" />
                <span className="font-mono text-sm text-gray-600 uppercase">{gear.dominantColor}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Palette</h3>
              <ColorPalette palette={gear.palette} />
            </div>

            {gear.tags && gear.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Tags</h3>
                <TagList tags={gear.tags} />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
          <button
            onClick={handleEquip}
            disabled={isEquipped}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-sm
              ${isEquipped 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800 hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            {isEquipped ? '着用中' : 'このギアを着用する'}
          </button>
        </div>

      </div>
    </div>
  );
}
