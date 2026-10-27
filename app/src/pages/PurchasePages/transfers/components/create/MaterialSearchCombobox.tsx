import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Home,
  Wrench,
  Utensils,
  Plus,
} from 'lucide-react';
import type { PurchasingInventoryItem } from '../../../../../models/Purchasemodels/InventoryTransfer';

export interface CatalogItem {
  id: number;
  name: string;
  categoryName?: string;
  unitName?: string;
  unitSymbol?: string;
  quantity?: number;
}

export interface SelectedMaterialPayload {
  materialId: number;
  itemId?: number;
  id?: number;
  materialName: string;
  itemName?: string;
  departmentType: string;
  availableStock: number;
  quantity?: number;
  unitId?: number;
  unitName?: string;
  unitSymbol?: string;
}

interface MaterialSearchComboboxProps {
  inventory: PurchasingInventoryItem[];
  departmentCatalog?: CatalogItem[];
  selectedDept?: 'Restaurant' | 'Laundry' | 'Housekeeping' | 'Maintenance';
  selectedItemIds: number[];
  onSelectMaterial: (item: SelectedMaterialPayload) => void;
  placeholder?: string;
  departmentFilter?: string;
}

export function MaterialSearchCombobox({
  inventory,
  departmentCatalog,
  selectedDept = 'Restaurant',
  selectedItemIds,
  onSelectMaterial,
  placeholder,
  departmentFilter,
}: MaterialSearchComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveDept = selectedDept || departmentFilter || 'Restaurant';

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

  // Merge department catalog with central purchasing inventory
  const combinedItems = useMemo(() => {
    const list: Array<{
      id: number;
      name: string;
      departmentType: string;
      categoryName?: string;
      unitName?: string;
      unitSymbol?: string;
      unitId?: number;
      availableStock: number;
    }> = [];

    const seenKeys = new Set<string>();

    // 1. Department Catalog items
    if (departmentCatalog && departmentCatalog.length > 0) {
      departmentCatalog.forEach((catItem) => {
        const invMatch = inventory.find(
          (inv) =>
            (inv.departmentType || '').trim().toLowerCase() === effectiveDept.toLowerCase() &&
            ((inv.itemId && inv.itemId === catItem.id) ||
             (inv.itemName && catItem.name && inv.itemName.trim().toLowerCase() === catItem.name.trim().toLowerCase()))
        );

        const key = `${catItem.name.toLowerCase()}`;
        seenKeys.add(key);

        const stockAmount =
          invMatch?.quantity !== undefined
            ? Number(invMatch.quantity)
            : Number(catItem.quantity ?? 0);

        list.push({
          id: catItem.id,
          name: catItem.name,
          departmentType: effectiveDept,
          categoryName: catItem.categoryName,
          unitName: invMatch?.unitName || catItem.unitName || 'Unit',
          unitSymbol: invMatch?.unitSymbol || catItem.unitSymbol || catItem.unitName || 'Unit',
          unitId: invMatch?.unitId || 1,
          availableStock: stockAmount,
        });
      });
    }

    // 2. Central Inventory items for this department
    inventory
      .filter((inv) =>
        (inv.departmentType || '').trim().toLowerCase() === effectiveDept.toLowerCase()
      )
      .forEach((inv) => {
        const key = `${inv.itemName.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          list.push({
            id: inv.itemId || inv.id,
            name: inv.itemName,
            departmentType: inv.departmentType || effectiveDept,
            unitName: inv.unitName || 'Unit',
            unitSymbol: inv.unitSymbol || inv.unitName || 'Unit',
            unitId: inv.unitId || 1,
            availableStock: Number(inv.quantity) || 0,
          });
        }
      });

    return list;
  }, [departmentCatalog, inventory, effectiveDept]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return combinedItems;
    const q = query.toLowerCase();
    return combinedItems.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(q);
      const catMatch = item.categoryName?.toLowerCase().includes(q);
      const idMatch = String(item.id).includes(q);
      const unitMatch = item.unitName?.toLowerCase().includes(q) || item.unitSymbol?.toLowerCase().includes(q);
      return nameMatch || catMatch || idMatch || unitMatch;
    });
  }, [combinedItems, query]);

  const handleSelect = (item: (typeof combinedItems)[0]) => {
    onSelectMaterial({
      materialId: item.id,
      itemId: item.id,
      id: item.id,
      materialName: item.name,
      itemName: item.name,
      departmentType: item.departmentType,
      availableStock: item.availableStock,
      quantity: item.availableStock,
      unitId: item.unitId,
      unitSymbol: item.unitSymbol,
    });
    setQuery('');
    setIsOpen(false);
  };

  const handleSelectCustom = () => {
    if (!query.trim()) return;
    onSelectMaterial({
      materialId: Math.floor(Date.now() % 1000000),
      itemId: Math.floor(Date.now() % 1000000),
      id: Math.floor(Date.now() % 1000000),
      materialName: query.trim(),
      itemName: query.trim(),
      departmentType: effectiveDept,
      availableStock: 0,
      quantity: 0,
      unitId: 1,
      unitSymbol: 'Amount',
    });
    setQuery('');
    setIsOpen(false);
  };

  const getDeptIcon = () => {
    switch (effectiveDept) {
      case 'Laundry':
        return <Sparkles className="h-3.5 w-3.5 text-indigo-600" />;
      case 'Housekeeping':
        return <Home className="h-3.5 w-3.5 text-sky-600" />;
      case 'Maintenance':
        return <Wrench className="h-3.5 w-3.5 text-purple-600" />;
      case 'Restaurant':
      default:
        return <Utensils className="h-3.5 w-3.5 text-emerald-600" />;
    }
  };

  const defaultPlaceholder = `Search ${effectiveDept} items or central storage...`;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input container */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || defaultPlaceholder}
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
            <div className="p-4 text-center space-y-2">
              <div className="text-xs text-slate-400">
                {combinedItems.length === 0
                  ? `No ${effectiveDept} items found in catalog or storage.`
                  : `No ${effectiveDept} items matching "${query}".`}
              </div>
              {query.trim() && (
                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0B4EA2] hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Dispatch &ldquo;{query.trim()}&rdquo; as custom item</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <span>{effectiveDept} Items ({filteredItems.length})</span>
                <span>Central Storage Balance</span>
              </div>
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const isOutOfStock = item.availableStock <= 0;
                const isLowStock = item.availableStock > 0 && item.availableStock <= 5;

                return (
                  <button
                    key={`${item.departmentType}-${item.id}`}
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
                      <div className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 shrink-0">
                        {getDeptIcon()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-800 truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span>#{item.id}</span>
                          {item.categoryName && (
                            <>
                              <span>&bull;</span>
                              <span className="font-medium text-slate-500">
                                {item.categoryName}
                              </span>
                            </>
                          )}
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
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          {effectiveDept === 'Restaurant'
                            ? `0 ${item.unitSymbol} in storage`
                            : '0 in storage'}
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          {effectiveDept === 'Restaurant'
                            ? `${item.availableStock} ${item.unitSymbol}`
                            : `Amount: ${item.availableStock}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {effectiveDept === 'Restaurant'
                            ? `${Number(item.availableStock).toLocaleString()} ${item.unitSymbol}`
                            : `Amount: ${Number(item.availableStock).toLocaleString()}`}
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

              {/* If query has text, allow adding custom item as well */}
              {query.trim() && !filteredItems.some((i) => i.name.toLowerCase() === query.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors mt-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Dispatch &ldquo;{query.trim()}&rdquo; as custom {effectiveDept} item</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MaterialSearchCombobox;
