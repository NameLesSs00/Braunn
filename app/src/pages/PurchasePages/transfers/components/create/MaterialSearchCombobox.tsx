import { useState, useRef, useEffect } from 'react';
import { Search, X, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { PurchasingInventoryItem } from '../../../../../models/Purchasemodels/InventoryTransfer';

interface MaterialSearchComboboxProps {
  inventory: PurchasingInventoryItem[];
  selectedItemIds: number[];
  onSelectMaterial: (item: PurchasingInventoryItem) => void;
  placeholder?: string;
  departmentFilter?: string; // Optional filter (e.g. 'Restaurant', 'Maintenance')
}

export function MaterialSearchCombobox({
  inventory,
  selectedItemIds,
  onSelectMaterial,
  placeholder = 'Search material by name or SKU...',
  departmentFilter,
}: MaterialSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = inventory.filter((item) => {
    // If department filter specified, apply it
    if (departmentFilter && departmentFilter !== 'ALL' && item.departmentType.toLowerCase() !== departmentFilter.toLowerCase()) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const nameMatch = item.itemName?.toLowerCase().includes(q);
    const idMatch = String(item.itemId || item.id).includes(q);
    const unitMatch = item.unitName?.toLowerCase().includes(q) || item.unitSymbol?.toLowerCase().includes(q);
    return nameMatch || idMatch || unitMatch;
  });

  const handleSelect = (item: PurchasingInventoryItem) => {
    onSelectMaterial(item);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input container */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10 outline-none transition-all shadow-2xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No materials matching &quot;{query}&quot; in central stock.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Available In Central Storage ({filteredItems.length})
              </div>
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.itemId || item.id);
                const isOutOfStock = Number(item.quantity) <= 0;
                const isLowStock = Number(item.quantity) > 0 && Number(item.quantity) <= 5;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    disabled={isSelected}
                    className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-all ${
                      isSelected
                        ? 'opacity-40 bg-slate-50 cursor-not-allowed'
                        : 'hover:bg-slate-50 active:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-[#0B4EA2] shrink-0">
                        <Layers className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-800 truncate">
                          {item.itemName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span>#{item.itemId || item.id}</span>
                          <span>&bull;</span>
                          <span className="font-medium text-slate-600">
                            {item.departmentType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock level badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
                          <AlertTriangle className="h-3 w-3" />
                          0 {item.unitSymbol || item.unitName}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          {item.quantity} {item.unitSymbol || item.unitName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {Number(item.quantity).toLocaleString()} {item.unitSymbol || item.unitName}
                        </span>
                      )}

                      {isSelected && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          Added
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
