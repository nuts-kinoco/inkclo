'use client';

import React, { useState, useMemo } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { weapons } from '@/lib/data/weapons';
import { WeaponCard } from './WeaponCard';
import { WeaponAffinityBadge } from './WeaponAffinityBadge';
import { recommendWeaponsForCoordinate } from '@/lib/weapon/recommendationEngine';
import { ChevronDown, ChevronUp, Crosshair, X } from 'lucide-react';
import { Weapon } from '@/types/weapon';

export function WeaponPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { coordinate, weaponId, setWeaponId } = useBuilderStore();

  const selectedWeapon = weapons.find(w => w.id === weaponId);

  // Recommendations based on current coordinate
  const recommendations = useMemo(() => {
    return recommendWeaponsForCoordinate(coordinate, 5);
  }, [coordinate]);

  // Filtered weapons for manual selection
  const filteredWeapons = useMemo(() => {
    if (!searchQuery) return weapons;
    return weapons.filter(w => w.name.includes(searchQuery));
  }, [searchQuery]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all">
      {/* Header / Toggle */}
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-colors ${selectedWeapon ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-gray-100 text-gray-500 dark:bg-slate-800'}`}>
            <Crosshair size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              ブキを合わせる
              <span className="text-[10px] font-normal bg-orange-100 text-orange-600 dark:bg-orange-900/50 px-2 py-0.5 rounded-full">Beta</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedWeapon ? selectedWeapon.name : '持たせるブキを選ぶ（任意）'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedWeapon && (
            <button 
              onClick={(e) => { e.stopPropagation(); setWeaponId(null); }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* Recommendations Section */}
          {Object.keys(coordinate).length > 0 && recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                <SparklesIcon /> コーデに合うおすすめブキ
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {recommendations.map(({ weapon, affinity }) => (
                  <div key={weapon.id} className="snap-start flex-shrink-0 w-24 flex flex-col gap-2">
                    <WeaponCard 
                      weapon={weapon} 
                      selected={weaponId === weapon.id}
                      onClick={() => setWeaponId(weapon.id)}
                    />
                    <WeaponAffinityBadge affinity={affinity} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and All Weapons */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500">すべてのブキ</h4>
              <input 
                type="text" 
                placeholder="ブキ名で検索..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 dark:text-gray-200 w-32 md:w-48 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {filteredWeapons.map(weapon => (
                <div key={weapon.id} className="flex flex-col gap-1">
                  <WeaponCard 
                    weapon={weapon} 
                    selected={weaponId === weapon.id}
                    onClick={() => setWeaponId(weapon.id)}
                  />
                </div>
              ))}
              {filteredWeapons.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm text-gray-400">
                  見つかりませんでした
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
