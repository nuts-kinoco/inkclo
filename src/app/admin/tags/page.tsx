'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Gear } from '@/types';
import { Search, ArrowRight, ArrowLeft, Layers, List, SquareSquare } from 'lucide-react';

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
  const [tagStatusFilter, setTagStatusFilter] = useState<'all' | 'reviewed' | 'unreviewed'>('all');
  const [viewMode, setViewMode] = useState<'single' | 'list'>('single');
  
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkTag, setBulkTag] = useState(TAG_CANDIDATES[0].id);

  // Initialize gears
  useEffect(() => {
    fetch('/api/gears')
      .then(res => res.json())
      .then(data => {
        const initGears = (data.gears as any[]).map(g => {
          if (!g.isReviewed) {
            return { ...g, manualTags: g.autoTags ? [...g.autoTags] : [] };
          }
          return g;
        });
        setGears(initGears);
        const savedIndex = localStorage.getItem('inkclo_admin_tag_index');
        if (savedIndex) {
          setCurrentIndex(parseInt(savedIndex, 10));
        }
      })
      .catch(err => console.error('Failed to fetch gears:', err));
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
      if (tagStatusFilter === 'reviewed' && !g.isReviewed) return false;
      if (tagStatusFilter === 'unreviewed' && g.isReviewed) return false;
      return true;
    });
  }, [gears, searchQuery, brandFilter, categoryFilter, tagStatusFilter]);

  const currentGear = filteredGears[currentIndex];

  const toggleTag = useCallback((tagId: string, gearId?: string) => {
    const targetId = gearId || currentGear?.id;
    if (!targetId) return;
    setGears(prev => prev.map(g => {
      if (g.id !== targetId) return g;
      const currentManualTags = g.manualTags || [];
      const newManualTags = currentManualTags.includes(tagId)
        ? currentManualTags.filter(t => t !== tagId)
        : [...currentManualTags, tagId];
      return { ...g, manualTags: newManualTags };
    }));
  }, [currentGear]);

  const toggleHidden = useCallback((gearId: string) => {
    setGears(prev => prev.map(g => {
      if (g.id !== gearId) return g;
      return { ...g, isHidden: !g.isHidden } as Gear;
    }));
  }, []);

  const saveAndNext = useCallback(async () => {
    if (!currentGear || saving) return;
    setSaving(true);
    try {
      await fetch('/api/gears/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id: currentGear.id, manualTags: currentGear.manualTags || [], isHidden: currentGear.isHidden }]
        })
      });
      
      setGears(prev => prev.map(g => g.id === currentGear.id ? { ...g, isReviewed: true } as Gear : g));

      if (tagStatusFilter !== 'unreviewed') {
        if (currentIndex < filteredGears.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [currentGear, saving, currentIndex, filteredGears.length, tagStatusFilter]);

  const saveAllFiltered = async () => {
    if (saving || filteredGears.length === 0) return;
    if (!confirm(`Are you sure you want to save all ${filteredGears.length} gears currently shown?`)) return;
    
    setSaving(true);
    try {
      const updates = filteredGears.map(g => ({ id: g.id, manualTags: g.manualTags || [], isHidden: g.isHidden }));
      
      await fetch('/api/gears/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      
      const updatedIds = new Set(updates.map(u => u.id));
      setGears(prev => prev.map(g => updatedIds.has(g.id) ? { ...g, isReviewed: true } as Gear : g));

      alert(`Successfully saved ${updates.length} gears!`);
    } catch (err) {
      console.error(err);
      alert('Failed to save all');
    } finally {
      setSaving(false);
    }
  };

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (viewMode === 'single') {
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveAndNext, goPrev, toggleTag, viewMode]);

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
          
          <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('single')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'single' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            >
              <SquareSquare size={16} /> Single
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            >
              <List size={16} /> List
            </button>
          </div>

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
              onChange={e => setTagStatusFilter(e.target.value as 'all' | 'reviewed' | 'unreviewed')}
              className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="unreviewed">Unreviewed (New)</option>
              <option value="reviewed">Reviewed (Saved)</option>
              <option value="all">All</option>
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
      <div className="flex-1 flex flex-col h-full bg-gray-50 relative overflow-hidden pt-14 md:pt-0">
        
        {/* List Mode Controls */}
        {viewMode === 'list' && filteredGears.length > 0 && (
          <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm z-10">
            <div>
              <span className="font-bold text-lg">{filteredGears.length}</span> <span className="text-gray-500">gears shown</span>
            </div>
            <button 
              onClick={saveAllFiltered}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : '✅ Save All Displayed'}
            </button>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${viewMode === 'single' ? 'flex items-center justify-center' : ''}`}>
          
          {filteredGears.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <h2 className="text-2xl font-bold mb-2">No gears found</h2>
              <p>Try adjusting your filters.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-4 max-w-6xl mx-auto pb-24">
              {filteredGears.map(gear => (
                <div key={gear.id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row gap-6 items-center transition-all ${gear.isHidden ? 'opacity-50 grayscale border-gray-100 bg-gray-50' : 'border-gray-200'}`}>
                  
                  {/* Left: Hidden Toggle */}
                  <div className="flex flex-col items-center justify-center shrink-0 w-16 border-r border-gray-100 pr-4">
                    <label className="flex flex-col items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!gear.isHidden}
                        onChange={() => toggleHidden(gear.id)}
                        className="w-5 h-5 mb-1 cursor-pointer accent-blue-600"
                      />
                      <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">{gear.isHidden ? 'Hidden' : 'Visible'}</span>
                    </label>
                  </div>

                  {/* Gear Info */}
                  <div className="flex items-center gap-4 w-full md:w-48 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gear.imagePath} alt={gear.name} className="w-16 h-16 object-contain" />
                    <div>
                      <div className="font-black text-sm leading-tight">{gear.name}</div>
                      <div className="text-xs font-bold text-gray-500 mt-1">{gear.brand.brandName}</div>
                    </div>
                  </div>

                  {/* Right: Manual Tags */}
                  <div className="flex-1 flex flex-wrap gap-2 w-full">
                    {TAG_CANDIDATES.map(tag => {
                      const isActive = (gear.manualTags || []).includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id, gear.id)}
                          className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-all ${
                            isActive 
                              ? 'border-black bg-black text-white' 
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            currentGear && (
              <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row pb-24 md:pb-0 mx-auto">
                <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 relative overflow-hidden">
                  {currentGear.isHidden && (
                    <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-3 py-1 rounded-md font-bold text-xs border border-red-200">
                      Hidden from Catalog
                    </div>
                  )}

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentGear.imagePath} alt={currentGear.name} className={`w-64 h-64 object-contain drop-shadow-xl transition-all ${currentGear.isHidden ? 'opacity-30 grayscale' : ''}`} />
                  <h2 className="text-3xl font-black mt-6 text-center">{currentGear.name}</h2>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-200">
                    <span className="text-sm font-bold text-gray-600">{currentGear.brand.brandName}</span>
                  </div>
                  
                  <div className="mt-6 flex flex-col items-center gap-2 max-w-md">
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-full border-2 border-gray-200 shadow-sm mt-1 hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={!currentGear.isHidden}
                        onChange={() => toggleHidden(currentGear.id)}
                        className="w-5 h-5 cursor-pointer accent-blue-600"
                      />
                      <span className="text-sm font-bold text-gray-700">{currentGear.isHidden ? '🚫 Hidden from Catalog' : '👁️ Visible in Catalog'}</span>
                    </label>

                    {currentGear.autoTags && currentGear.autoTags.length > 0 && (
                      <div className="w-full flex flex-wrap justify-center gap-2 mt-4">
                        {currentGear.autoTags.map(tag => (
                          <span key={`auto-${tag}`} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold border border-blue-200">
                            🤖 {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {currentGear.manualTags && currentGear.manualTags.length > 0 && (
                      <div className="w-full flex flex-wrap justify-center gap-2 mt-2">
                        {currentGear.manualTags.map(tag => (
                          <span key={`manual-${tag}`} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold border border-purple-200">
                            ✍️ {tag}
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
            )
          )}
        </div>
      </div>
    </div>
  );
}
