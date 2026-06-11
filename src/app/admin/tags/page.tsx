'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import gearsData from '@/lib/data/gears';
import { Gear } from '@/types';
import { Search, ArrowRight, ArrowLeft, Layers } from 'lucide-react';

const TAG_CANDIDATES = [
  { id: 'sporty', label: 'sporty', key: '1' },
  { id: 'street', label: 'street', key: '2' },
  { id: 'cute', label: 'cute', key: '3' },
  { id: 'funny', label: 'funny', key: '4' },
  { id: 'summer', label: 'summer', key: '5' },
  { id: 'winter', label: 'winter', key: '6' },
  { id: 'casual', label: 'casual', key: '7' },
  { id: 'formal', label: 'formal', key: '8' },
  { id: 'cool', label: 'cool', key: '9' },
  { id: 'outdoor', label: 'outdoor', key: '0' },
];

export default function AdminTagsPage() {
  const [gears, setGears] = useState<Gear[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagStatusFilter, setTagStatusFilter] = useState<'all' | 'tagged' | 'untagged'>('all');
  
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkTag, setBulkTag] = useState(TAG_CANDIDATES[0].id);

  // Initialize gears
  useEffect(() => {
    setGears(gearsData.gears as Gear[]);
    const savedIndex = localStorage.getItem('inkclo_admin_tag_index');
    if (savedIndex) {
      setCurrentIndex(parseInt(savedIndex, 10));
    }
  }, []);

  // Save index to local storage
  useEffect(() => {
    localStorage.setItem('inkclo_admin_tag_index', currentIndex.toString());
  }, [currentIndex]);

  const filteredGears = useMemo(() => {
    return gears.filter(g => {
      if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (brandFilter && g.brand.brandName !== brandFilter) return false;
      if (categoryFilter && g.category !== categoryFilter) return false;
      if (tagStatusFilter === 'tagged' && (!g.manualTags || g.manualTags.length === 0)) return false;
      if (tagStatusFilter === 'untagged' && (g.manualTags && g.manualTags.length > 0)) return false;
      return true;
    });
  }, [gears, searchQuery, brandFilter, categoryFilter, tagStatusFilter]);

  const currentGear = filteredGears[currentIndex];

  const toggleTag = useCallback((tagId: string) => {
    if (!currentGear) return;
    setGears(prev => prev.map(g => {
      if (g.id !== currentGear.id) return g;
      const currentManualTags = g.manualTags || [];
      const newManualTags = currentManualTags.includes(tagId)
        ? currentManualTags.filter(t => t !== tagId)
        : [...currentManualTags, tagId];
      return { ...g, manualTags: newManualTags };
    }));
  }, [currentGear]);

  const saveAndNext = useCallback(async () => {
    if (!currentGear || saving) return;
    setSaving(true);
    try {
      await fetch('/api/gears/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id: currentGear.id, manualTags: currentGear.manualTags || [] }]
        })
      });
      if (currentIndex < filteredGears.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [currentGear, saving, currentIndex, filteredGears.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        saveAndNext();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        goPrev();
      } else {
        const candidate = TAG_CANDIDATES.find(c => c.key === e.key);
        if (candidate) {
          e.preventDefault();
          toggleTag(candidate.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveAndNext, goPrev, toggleTag]);

  // Bulk Apply
  const handleBulkApply = async () => {
    if (!confirm(`Are you sure you want to apply "${bulkTag}" to all ${filteredGears.length} filtered gears?`)) return;
    setBulkSaving(true);
    
    const updates = filteredGears.map(g => {
      const current = g.manualTags || [];
      const newTags = current.includes(bulkTag) ? current : [...current, bulkTag];
      return { id: g.id, manualTags: newTags };
    });

    try {
      await fetch('/api/gears/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      
      // Update local state
      setGears(prev => prev.map(g => {
        const update = updates.find(u => u.id === g.id);
        return update ? { ...g, manualTags: update.manualTags } : g;
      }));
      
      alert('Bulk apply successful!');
    } catch (err) {
      console.error(err);
      alert('Failed bulk apply');
    } finally {
      setBulkSaving(false);
    }
  };

  const brands = useMemo(() => Array.from(new Set(gears.map(g => g.brand.brandName))).sort(), [gears]);

  // Reset index when filters change
  useEffect(() => {
    // Only reset if it's an actual filter change, not initial load
    // Actually, to avoid resetting on load when localStorage is used, let's keep it simple:
    // User can manually reset or we don't reset index. Let's comment this out so it doesn't overwrite localStorage.
    // setCurrentIndex(0);
  }, [searchQuery, brandFilter, categoryFilter, tagStatusFilter]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* Mobile Header & Menu Toggle */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
        <h1 className="font-black text-lg">Admin Tagger</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 rounded-md">
          <Layers size={20} />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300
        absolute md:relative z-30 w-80 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 pt-14 md:pt-0
      `}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-black text-xl mb-4 hidden md:block">Admin Tagger</h1>
          <div className="text-sm font-bold text-gray-500 mb-2">
            Progress: {filteredGears.length > 0 ? currentIndex + 1 : 0} / {filteredGears.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all" 
              style={{ width: `${filteredGears.length > 0 ? ((currentIndex + 1) / filteredGears.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4 pb-24 md:pb-4">
          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-2 text-gray-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="Search gear name..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Brand</label>
            <select 
              value={brandFilter} 
              onChange={e => setBrandFilter(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Brands</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Category</label>
            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Categories</option>
              <option value="head">Head</option>
              <option value="body">Body</option>
              <option value="shoes">Shoes</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Status</label>
            <select 
              value={tagStatusFilter} 
              onChange={e => setTagStatusFilter(e.target.value as 'all' | 'tagged' | 'untagged')}
              className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All</option>
              <option value="untagged">Untagged</option>
              <option value="tagged">Tagged</option>
            </select>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-1"><Layers size={16}/> Bulk Apply</h3>
            <div className="flex gap-2 mb-2">
              <select 
                value={bulkTag} 
                onChange={e => setBulkTag(e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
              >
                {TAG_CANDIDATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <button 
              onClick={handleBulkApply}
              disabled={bulkSaving || filteredGears.length === 0}
              className="w-full py-1.5 bg-gray-800 text-white rounded-md text-sm font-bold hover:bg-black disabled:opacity-50"
            >
              {bulkSaving ? 'Saving...' : 'Apply to Current Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full bg-gray-50 p-4 md:p-8 items-center justify-start md:justify-center relative overflow-y-auto pt-20 md:pt-8">
        {currentGear ? (
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row pb-24 md:pb-0">
            
            <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentGear.imagePath} alt={currentGear.name} className="w-64 h-64 object-contain drop-shadow-xl" />
              <h2 className="text-3xl font-black mt-6 text-center">{currentGear.name}</h2>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-200">
                <span className="text-sm font-bold text-gray-600">{currentGear.brand.brandName}</span>
              </div>
              
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
                {currentGear.autoTags && currentGear.autoTags.length > 0 && (
                  <div className="w-full flex justify-center gap-2 mb-2">
                    {currentGear.autoTags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold border border-blue-200">
                        🤖 {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-80 p-6 md:p-8 flex flex-col">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Manual Tags</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-auto">
                {TAG_CANDIDATES.map(tag => {
                  const isActive = (currentGear.manualTags || []).includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all ${
                        isActive 
                          ? 'border-black bg-black text-white shadow-md scale-[1.02]' 
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-bold opacity-70 mb-1">Key {tag.key}</span>
                      <span className="font-bold">{tag.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile sticky save bar */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8 flex gap-3 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:shadow-none">
                <button 
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center shrink-0"
                  title="Backspace"
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={saveAndNext}
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md flex items-center justify-center gap-2"
                  title="Enter"
                >
                  {saving ? 'Saving...' : <>Save & Next <ArrowRight size={18}/></>}
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-2">No gears found</h2>
            <p>Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
