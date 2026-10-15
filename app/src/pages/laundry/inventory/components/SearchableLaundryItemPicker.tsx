import { useState, useEffect, useRef } from 'react'
import { Check, ChevronsUpDown, Loader2, Package, Search } from 'lucide-react'
import { getLaundryInventoryItems } from '../../../../shared/Laundryshared/api/laundryInventoryItemsApi'
import type { LaundryInventoryItemReadDto } from '../../../../models/Laundrymodels/LaundryInventoryItem'

interface SearchableLaundryItemPickerProps {
  value: number
  onChange: (item: LaundryInventoryItemReadDto | null) => void
  disabled?: boolean
  initialItem?: LaundryInventoryItemReadDto | null
}

export function SearchableLaundryItemPicker({
  value,
  onChange,
  disabled,
  initialItem,
}: SearchableLaundryItemPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<LaundryInventoryItemReadDto[]>([])
  const [selectedItem, setSelectedItem] = useState<LaundryInventoryItemReadDto | null>(initialItem || null)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem)
    }
  }, [initialItem])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    setLoading(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await getLaundryInventoryItems({
          Name: search.trim() || undefined,
          PageNumber: 1,
          PageSize: 20,
        })
        setItems(res?.items || [])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [open, search])

  // Initial load when opened
  const handleOpen = () => {
    if (disabled) return
    setOpen((prev) => !prev)
    setSearch('')
  }

  const handleSelect = (item: LaundryInventoryItemReadDto) => {
    setSelectedItem(item)
    onChange(item)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={[
          'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition shadow-2xs',
          disabled
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : 'bg-white hover:border-slate-300 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/20',
          selectedItem ? 'border-slate-300 text-slate-800' : 'border-slate-200 text-slate-400',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 truncate">
          <Package className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="truncate font-medium">
            {selectedItem ? (
              <span className="text-slate-800 font-semibold">
                {selectedItem.name}
                <span className="text-xs text-slate-400 ml-1.5 font-normal">
                  (Stock: {selectedItem.quantity} {selectedItem.unitName || ''})
                </span>
              </span>
            ) : (
              'Select laundry consumable / item...'
            )}
          </span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Search Field */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by item name..."
                autoFocus
                className="w-full rounded-lg bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-[#0B4EA2]"
              />
            </div>
          </div>

          {/* List items */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-[#0B4EA2]" />
                <span>Loading items...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No laundry items found
              </div>
            ) : (
              items.map((it) => {
                const isSelected = selectedItem?.id === it.id || value === it.id
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => handleSelect(it)}
                    className={[
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition cursor-pointer',
                      isSelected
                        ? 'bg-[#EEF4FF] text-[#0B4EA2] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{it.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Stock: <span className="font-medium text-slate-600">{it.quantity} {it.unitName || ''}</span>
                        {it.minimumStock ? ` • Min: ${it.minimumStock}` : ''}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-[#0B4EA2]" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
