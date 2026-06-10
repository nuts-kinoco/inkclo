import { Search } from 'lucide-react';
import gearsData from '@/lib/data/gears';

// Predefined basic colors for filtering (acts as tags)
const COLOR_TAGS = [
  { id: 'color:white', hex: '#FFFFFF', label: '白' },
  { id: 'color:black', hex: '#000000', label: '黒' },
  { id: 'color:red', hex: '#FF0000', label: '赤' },
  { id: 'color:blue', hex: '#0000FF', label: '青' },
  { id: 'color:yellow', hex: '#FFFF00', label: '黄' },
  { id: 'color:green', hex: '#00FF00', label: '緑' },
  { id: 'color:pink', hex: '#FFC0CB', label: 'ピンク' },
];

const THEME_COLORS = [
  // JAFCA参考 ガール(G)
  { id: 'theme:25ss_g', hex: '#F091A0', label: '25SS(G)' },
  { id: 'theme:25aw_g', hex: '#8B0000', label: '25AW(G)' },
  { id: 'theme:26ss_g', hex: '#F9C8D2', label: '26SS(G)' },
  { id: 'theme:26aw_g', hex: '#4A235A', label: '26AW(G)' },
  // JAFCA参考 ボーイ(B)
  { id: 'theme:25ss_b', hex: '#008080', label: '25SS(B)' },
  { id: 'theme:25aw_b', hex: '#556B2F', label: '25AW(B)' },
  { id: 'theme:26ss_b', hex: '#39FF14', label: '26SS(B)' },
  { id: 'theme:26aw_b', hex: '#2C3E50', label: '26AW(B)' },
];

export interface FilterState {
  searchQuery: string;
  brands: string[];
  tags: string[];
  colorThreshold: number;
  sortBy: 'nameAsc' | 'nameDesc';
  customColor: string | null;
  limit: number;
  page: number;
}

interface FilterPanelProps {
  filter: FilterState;
  onChange: (filter: FilterState) => void;
}

export function FilterPanel({ filter, onChange }: FilterPanelProps) {
  const brandsMap = new Map<string, string>();
  gearsData.gears.forEach(g => brandsMap.set(g.brand.brandId, g.brand.brandName));
  const brands = Array.from(brandsMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));

  const toggleTag = (tagId: string) => {
    const newTags = filter.tags.includes(tagId)
      ? filter.tags.filter(t => t !== tagId)
      : [...filter.tags, tagId];
    onChange({ ...filter, tags: newTags, page: 1 });
  };

  const toggleBrand = (brandId: string) => {
    const newBrands = filter.brands.includes(brandId)
      ? filter.brands.filter(b => b !== brandId)
      : [...filter.brands, brandId];
    onChange({ ...filter, brands: newBrands, page: 1 });
  };

  return (
    <div className="flex flex-col gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
      
      {/* Top Row: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
          <input
            type="text"
            placeholder="ギア名で検索..."
            value={filter.searchQuery}
            onChange={(e) => onChange({ ...filter, searchQuery: e.target.value, page: 1 })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        
        <select
          value={filter.sortBy}
          onChange={(e) => onChange({ ...filter, sortBy: e.target.value as any, page: 1 })}
          className="border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="nameAsc">名前順 (A-Z)</option>
          <option value="nameDesc">名前順 (Z-A)</option>
        </select>
      </div>

      {/* Middle Row: Brands */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
        <label className="text-sm font-bold text-gray-600 dark:text-slate-300 mb-2 block">ブランド</label>
        <div className="flex flex-wrap gap-1.5 pb-2">
          {brands.map(([id, name]) => {
            const isSelected = filter.brands.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleBrand(id)}
                className={`px-2 py-1.5 rounded-lg border transition-all bg-gray-50 dark:bg-slate-700/50 flex items-center gap-1.5 ${
                  isSelected ? 'border-blue-500 shadow-sm bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 opacity-90 hover:opacity-100'
                }`}
                title={name}
              >
                <img 
                  src={`/brands/${name}.png`} 
                  alt="" 
                  className="w-4 h-4 object-contain" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
                <span className="text-xs font-bold text-gray-700 dark:text-slate-200 leading-none">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Limit, Tags, Theme Colors and Custom Color */}
      <div className="flex flex-col lg:flex-row gap-6 pt-2 border-t border-gray-100 dark:border-slate-700 items-start lg:items-center flex-wrap">
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-600 dark:text-slate-300 shrink-0">表示件数</label>
          <select
            value={filter.limit}
            onChange={(e) => onChange({ ...filter, limit: parseInt(e.target.value), page: 1 })}
            className="border border-gray-300 dark:border-slate-600 rounded-md p-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-slate-200"
          >
            {[10, 30, 50, 100].map(val => (
              <option key={val} value={val}>{val}件</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-bold text-gray-600 dark:text-slate-300 shrink-0">基本色タグ</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_TAGS.map(c => {
              const isSelected = filter.tags.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleTag(c.id)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${isSelected ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-200 dark:border-slate-600 hover:scale-105'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              );
            })}
          </div>
          {filter.tags.length > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500 dark:text-slate-400">近似度</span>
              <input 
                type="range" 
                min="10" 
                max="80" 
                step="5"
                value={filter.colorThreshold} 
                onChange={(e) => onChange({ ...filter, colorThreshold: parseInt(e.target.value), page: 1 })}
                className="w-20 accent-blue-500"
                title="色の近似判定のしきい値"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap lg:border-l border-gray-200 dark:border-slate-700 lg:pl-6">
          <label className="text-sm font-bold text-gray-600 dark:text-slate-300 shrink-0">トレンド/季節</label>
          <div className="flex gap-2 flex-wrap">
            {THEME_COLORS.map(theme => {
              const isSelected = filter.customColor?.toUpperCase() === theme.hex.toUpperCase();
              return (
                <button
                  key={theme.id}
                  onClick={() => onChange({ ...filter, customColor: isSelected ? null : theme.hex, page: 1 })}
                  className={`px-2 py-1 text-xs font-bold rounded-md border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {theme.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap lg:border-l border-gray-200 dark:border-slate-700 lg:pl-6">
          <label className="text-sm font-bold text-gray-600 dark:text-slate-300 shrink-0">詳細色検索</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={filter.customColor || '#000000'}
              onChange={(e) => onChange({ ...filter, customColor: e.target.value, page: 1 })}
              className="w-8 h-8 cursor-pointer rounded overflow-hidden"
            />
            {filter.customColor && (
              <button 
                onClick={() => onChange({ ...filter, customColor: null, page: 1 })}
                className="text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 underline"
              >
                クリア
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
