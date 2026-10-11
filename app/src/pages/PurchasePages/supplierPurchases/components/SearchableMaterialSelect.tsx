import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Package, X } from 'lucide-react';
import type { RestaurantMaterial } from '../../../../models/RestaurantMaterial';

interface SearchableMaterialSelectProps {
  materials: RestaurantMaterial[];
  selectedId: number | '';
  onSelect: (material: RestaurantMaterial) => void;
  placeholder?: string;
  required?: boolean;
}

export function SearchableMaterialSelect({
  materials,
  selectedId,
  onSelect,
  placeholder = 'Search & select material...',
  required = false,
}: SearchableMaterialSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedMaterial = useMemo(
    () => materials.find((m) => m.id === selectedId),
    [materials, selectedId]
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return materials;
    const query = searchQuery.toLowerCase();
    return materials.filter(
      (m) =>
        m.name?.toLowerCase().includes(query) ||
        m.unitName?.toLowerCase().includes(query) ||
        m.unitSymbol?.toLowerCase().includes(query)
    );
  }, [materials, searchQuery]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-xs text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20 ${
          isOpen ? 'border-[#0B4EA2] ring-2 ring-[#0B4EA2]/20' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {selectedMaterial ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-slate-800 truncate">{selectedMaterial.name}</span>
              {selectedMaterial.unitName && (
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 shrink-0">
                  {selectedMaterial.unitName}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#0B4EA2]' : ''
          }`}
        />
      </button>

      {/* Hidden input to satisfy required form validation */}
      {required && (
        <input
          type="text"
          value={selectedId ? selectedId.toString() : ''}
          onChange={() => {}}
          required
          className="sr-only"
          tabIndex={-1}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[280px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in duration-150">
          {/* Search Bar inside Dropdown */}
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search material by name..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0B4EA2] focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filteredMaterials.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No materials found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredMaterials.map((mat) => {
                const isSelected = mat.id === selectedId;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => {
                      onSelect(mat);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-[#EEF4FF] text-[#0B4EA2] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">{mat.name}</span>
                      {mat.unitName && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-normal">
                          {mat.unitName}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#0B4EA2] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
