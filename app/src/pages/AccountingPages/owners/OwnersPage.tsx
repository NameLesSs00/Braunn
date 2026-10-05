import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { fetchOwners } from '../../../features/accounting/ownersSlice'
import { OwnersTable } from './components/OwnersTable'
import { OwnerModal } from './modals/OwnerModal'
import { AccountingLayout } from '../../../widgets/layout/AccountingLayout/AccountingLayout'

export function OwnersPage() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state: any) => state.owners)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Use a timeout to debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  // Fetch owners when debounced query changes
  useEffect(() => {
    dispatch(fetchOwners(debouncedQuery || undefined))
  }, [dispatch, debouncedQuery])

  const handleCreate = () => {
    setIsModalOpen(true)
  }

  return (
    <AccountingLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 flex h-full flex-col pb-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a365d]">Owners</h1>
            <p className="mt-2 text-sm text-slate-500">Manage hotel owners, contacts, and legal details</p>
          </div>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-[#0B4EA2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0B4EA2]/90"
          >
            + Add Owner
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by owner name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          {status === 'loading' ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-sm text-slate-500">Loading owners...</div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-sm text-rose-500">Error: {error}</div>
            </div>
          ) : (
            <OwnersTable owners={items} />
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <OwnerModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </AccountingLayout>
  )
}
