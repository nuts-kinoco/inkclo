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

export interface FilterState {
  searchQuery: string;
  brand: string | null;
  tags: string[];
  colorThreshold: number;
  sortBy: 'nameAsc' | 'nameDesc';
  customColor: string | null;
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
    onChange({ ...filter, tags: newTags });
  };

  return (
    <div className="flex flex-col gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      
      {/* Top Row: Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ギア名で検索..."
            value={filter.searchQuery}
            onChange={(e) => onChange({ ...filter, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        
        <select
          value={filter.sortBy}
          onChange={(e) => onChange({ ...filter, sortBy: e.target.value as any })}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="nameAsc">名前順 (A-Z)</option>
          <option value="nameDesc">名前順 (Z-A)</option>
        </select>
      </div>

      {/* Bottom Row: Brand, Tags and Custom Color */}
      <div className="flex flex-col sm:flex-row gap-6 pt-2 border-t border-gray-100 items-start sm:items-center">
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-600 shrink-0">ブランド</label>
          <select
            value={filter.brand || ''}
            onChange={(e) => onChange({ ...filter, brand: e.target.value || null })}
            className="border border-gray-300 rounded-md p-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
          >
            <option value="">すべて</option>
            {brands.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-bold text-gray-600 shrink-0">基本色タグ</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_TAGS.map(c => {
              const isSelected = filter.tags.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleTag(c.id)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${isSelected ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              );
            })}
          </div>
          {filter.tags.length > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500">近似度</span>
              <input 
                type="range" 
                min="10" 
                max="80" 
                step="5"
                value={filter.colorThreshold} 
                onChange={(e) => onChange({ ...filter, colorThreshold: parseInt(e.target.value) })}
                className="w-20 accent-blue-500"
                title="色の近似判定のしきい値"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto border-l border-gray-200 pl-6">
          <label className="text-sm font-bold text-gray-600 shrink-0">詳細色検索</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={filter.customColor || '#000000'}
              onChange={(e) => onChange({ ...filter, customColor: e.target.value })}
              className="w-8 h-8 cursor-pointer rounded overflow-hidden"
            />
            {filter.customColor && (
              <button 
                onClick={() => onChange({ ...filter, customColor: null })}
                className="text-xs text-gray-400 hover:text-red-500 underline"
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
