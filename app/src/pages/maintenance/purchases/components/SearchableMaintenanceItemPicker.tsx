import { useState, useEffect, useRef } from 'react'
import { Check, ChevronsUpDown, Loader2, Package, Search } from 'lucide-react'
import { getMaintenanceItems } from '../../../../shared/apis/maintenanceItemsApi'
import type { MaintenanceItem } from '../../../../models/MaintenanceItem'

interface SearchableMaintenanceItemPickerProps {
  value: number
  onChange: (item: MaintenanceItem | null) => void
  disabled?: boolean
  initialItem?: MaintenanceItem | null
}

export function SearchableMaintenanceItemPicker({
  value,
  onChange,
  disabled,
  initialItem,
}: SearchableMaintenanceItemPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(initialItem || null)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch initial item details if value is provided and not selected yet
  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem)
    }
  }, [initialItem])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search effect with debouncing
  useEffect(() => {
    if (!open) return

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    setLoading(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await getMaintenanceItems({
          search: search.trim() || undefined,
          pageNumber: 1,
          pageSize: 20,
        })
        setItems(res?.items || [])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [search, open])

  // Sync selected item if value changes externally
  useEffect(() => {
    if (value && (!selectedItem || Number(selectedItem.id) !== value)) {
      const found = items.find((i) => Number(i.id) === value)
      if (found) setSelectedItem(found)
    } else if (!value) {
      setSelectedItem(null)
    }
  }, [value, items, selectedItem])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm transition',
          open ? 'border-[#0B4EA2] ring-2 ring-[#0B4EA2]/20' : 'border-slate-200 hover:border-slate-300',
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer',
        ].join(' ')}
      >
        {selectedItem ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#0B4EA2]">
              <Package className="h-4 w-4" />
            </div>
            <div className="truncate">
              <div className="font-semibold text-slate-800 truncate">{selectedItem.name}</div>
              <div className="text-xs text-slate-500">
                {selectedItem.code ? `Code: ${selectedItem.code}` : ''} • Stock:{' '}
                <span className="font-medium text-slate-700">{selectedItem.quantity ?? 0}</span>
                {selectedItem.unitName ? ` ${selectedItem.unitName}` : ' pcs'}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-slate-400">Search and select a spare part...</span>
        )}

        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400 ml-2" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search spare parts by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#0B4EA2]"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#0B4EA2]" />
                <span>Loading spare parts...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                No spare parts found matching &quot;{search}&quot;
              </div>
            ) : (
              items.map((item) => {
                const isSelected = selectedItem?.id === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedItem(item)
                      onChange(item)
                      setOpen(false)
                    }}
                    className={[
                      'flex w-full items-center justify-between rounded-lg p-2.5 text-left text-sm transition',
                      isSelected ? 'bg-[#EAF2FF] text-[#0B4EA2]' : 'hover:bg-slate-50 text-slate-700',
                    ].join(' ')}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-slate-800 truncate">{item.name}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {item.code && <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{item.code}</span>}
                        {item.categoryName && <span>{item.categoryName}</span>}
                        <span>• In Stock: <strong>{item.quantity ?? 0}</strong></span>
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
