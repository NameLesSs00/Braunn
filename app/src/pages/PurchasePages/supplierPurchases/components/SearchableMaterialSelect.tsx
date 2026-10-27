import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Package, X, Plus } from 'lucide-react';
import type { RestaurantMaterial } from '../../../../models/RestaurantMaterial';

export interface GenericItemOption {
  id: number | string;
  name: string;
  categoryName?: string;
  unitId?: number | null;
  unitName?: string | null;
  unitSymbol?: string | null;
  code?: string;
}

interface SearchableMaterialSelectProps {
  materials?: RestaurantMaterial[];
  items?: GenericItemOption[];
  selectedId: number | string | '';
  selectedName?: string;
  onSelect: (item: GenericItemOption) => void;
  placeholder?: string;
  required?: boolean;
  departmentType?: string;
}

export function SearchableMaterialSelect({
  materials,
  items,
  selectedId,
  selectedName,
  onSelect,
  placeholder = 'Search & select item...',
  required = false,
  departmentType = 'Item',
}: SearchableMaterialSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const availableItems: GenericItemOption[] = useMemo(() => {
    if (items && items.length > 0) return items;
    if (materials && materials.length > 0) {
      return materials.map((m) => ({
        id: m.id,
        name: m.name,
        categoryName: m.categoryName,
        unitId: m.unitId,
        unitName: m.unitName,
        unitSymbol: m.unitSymbol,
      }));
    }
    return [];
  }, [items, materials]);

  const selectedItem = useMemo(() => {
    const found = availableItems.find((m) => String(m.id) === String(selectedId));
    if (found) return found;
    if (selectedName) {
      return { id: selectedId, name: selectedName };
    }
    return undefined;
  }, [availableItems, selectedId, selectedName]);

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

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return availableItems;
    const query = searchQuery.toLowerCase();
    return availableItems.filter(
      (m) =>
        m.name?.toLowerCase().includes(query) ||
        m.categoryName?.toLowerCase().includes(query) ||
        m.unitName?.toLowerCase().includes(query) ||
        m.code?.toLowerCase().includes(query)
    );
  }, [availableItems, searchQuery]);

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
          {selectedItem ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-slate-800 truncate">{selectedItem.name}</span>
              {selectedItem.categoryName && (
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-500 shrink-0">
                  {selectedItem.categoryName}
                </span>
              )}
              {selectedItem.unitName && (
                <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] text-[#0B4EA2] font-semibold shrink-0">
                  {selectedItem.unitName}
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
          value={selectedId ? selectedId.toString() : (selectedName || '')}
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
              placeholder={`Search ${departmentType} item by name or category...`}
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
            {filteredItems.length === 0 ? (
              <div className="space-y-2 p-2">
                <div className="text-center text-xs text-slate-400">
                  {availableItems.length === 0
                    ? `No ${departmentType} catalog items loaded.`
                    : `No items found matching "${searchQuery}"`}
                </div>
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect({
                        id: Math.floor(Date.now() % 1000000),
                        name: searchQuery.trim(),
                      });
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-xs font-semibold text-[#0B4EA2] hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Use &ldquo;{searchQuery.trim()}&rdquo;</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredItems.map((mat) => {
                  const isSelected = String(mat.id) === String(selectedId);
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
                        {mat.categoryName && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 font-normal">
                            {mat.categoryName}
                          </span>
                        )}
                        {mat.unitName && (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-[#0B4EA2] font-medium">
                            {mat.unitName}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#0B4EA2] shrink-0" />}
                    </button>
                  );
                })}

                {/* If searchQuery doesn't exact match any item, offer to use custom text as well */}
                {searchQuery.trim() && !filteredItems.some((i) => i.name.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect({
                        id: Math.floor(Date.now() % 1000000),
                        name: searchQuery.trim(),
                      });
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors mt-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add &ldquo;{searchQuery.trim()}&rdquo; as custom item</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableMaterialSelect;
