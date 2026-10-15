import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  CheckCircle2,
  Clock,
  FileText,
  PackagePlus,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import {
  fetchHkmPurchases,
  setPurchasesPage,
} from '../../../features/HKfeatures/hkmPurchases/hkmPurchasesSlice'
import { HKPurchasesFilterBar } from './components/HKPurchasesFilterBar'
import { HKPurchasesTable } from './components/HKPurchasesTable'
import { NewHKPurchaseModal } from './components/NewHKPurchaseModal'
import { EditHKPurchaseModal } from './components/EditHKPurchaseModal'
import { HKPurchaseDetailsModal } from './components/HKPurchaseDetailsModal'
import type { HkmPurchaseReadDto } from '../../../models/HKmodels/HkmPurchase'

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: string | number
  hint: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <div className="text-[22px] font-bold text-slate-800">{value}</div>
        <div className="text-sm font-semibold text-slate-600 mt-0.5">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{hint}</div>
      </div>
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
        {icon}
      </div>
    </div>
  )
}

export function HKPurchasesView() {
  const dispatch = useAppDispatch()
  const { items, totalCount, status, params, pageNumber, pageSize, totalPages } =
    useAppSelector((state) => state.hkmPurchases)

  // Local filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [currentPageSize, setCurrentPageSize] = useState(pageSize || 10)

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<HkmPurchaseReadDto | null>(null)
  const [viewingPurchase, setViewingPurchase] = useState<HkmPurchaseReadDto | null>(null)

  // Load HK purchases from server with query parameters
  const loadPurchases = useCallback(
    (page = pageNumber || 1, size = currentPageSize) => {
      dispatch(
        fetchHkmPurchases({
          PageNumber: page,
          PageSize: size,
          Status: statusFilter !== 'All' ? statusFilter : undefined,
          FromDate: fromDate || undefined,
          ToDate: toDate || undefined,
        })
      )
    },
    [dispatch, pageNumber, currentPageSize, statusFilter, fromDate, toDate]
  )

  useEffect(() => {
    loadPurchases()
  }, [loadPurchases])

  // Auto-refresh polling every 25 seconds & focus event listener
  useEffect(() => {
    const interval = setInterval(() => {
      loadPurchases()
    }, 25000)

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadPurchases()
      }
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [loadPurchases])

  // Filtered items (client-side fast text search on loaded items)
  const filteredItems = useMemo(() => {
    return items.filter((p) => {
      if (!p) return false

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const rawItems = Array.isArray(p.items)
          ? p.items
          : Array.isArray((p as any).purchaseItems)
          ? (p as any).purchaseItems
          : []
        const matchesId = String(p.id ?? '').includes(q)
        const matchesAuthor = (p.createdByName || p.createdBy || '').toLowerCase().includes(q)
        const matchesItem = rawItems.some((i: any) =>
          (i.itemName || i.name || '').toLowerCase().includes(q)
        )
        if (!matchesId && !matchesAuthor && !matchesItem) {
          return false
        }
      }

      return true
    })
  }, [items, searchTerm])

  // KPI Metrics matching Swagger statuses
  const stats = useMemo(() => {
    let pending = 0
    let ordered = 0
    let completed = 0
    items.forEach((p) => {
      const s = p.status
      if (s === 'Pending' || s === 'Viewed') pending++
      else if (s === 'Ordered' || s === 'Approved') ordered++
      else if (s === 'Completed') completed++
    })
    return {
      total: totalCount || items.length,
      pending,
      ordered,
      completed,
    }
  }, [items, totalCount])

  const isLoading = status === 'loading'

  const handlePageChange = (newPage: number) => {
    dispatch(setPurchasesPage(newPage))
    loadPurchases(newPage, currentPageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    setCurrentPageSize(newSize)
    dispatch(setPurchasesPage(1))
    loadPurchases(1, newSize)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setFromDate('')
    setToDate('')
  }

  return (
    <div className="space-y-6">
      {/* ── KPI Stats Bar ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          hint="All time housekeeping requests"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          hint="Pending & Viewed requests"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Ordered & Approved"
          value={stats.ordered}
          hint="Approved & Ordered supplies"
          icon={<Truck className="h-5 w-5" />}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          hint="Fulfilled & received supplies"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* ── Action Header Banner ── */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Housekeeping Purchase Requests
          </h2>
          <p className="text-xs text-slate-500">
            Track restock requests, workflow approvals, orders, and completions
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#093d7e] transition cursor-pointer"
        >
          <PackagePlus className="h-4 w-4" />
          <span>New Purchase Request</span>
        </button>
      </div>

      {/* ── Filters Bar ── */}
      <HKPurchasesFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onReset={handleResetFilters}
      />

      {/* ── Table View ── */}
      <HKPurchasesTable
        items={filteredItems}
        loading={isLoading}
        pageNumber={pageNumber || 1}
        pageSize={currentPageSize}
        totalPages={totalPages || 1}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewDetails={(item) => setViewingPurchase(item)}
        onEdit={(item) => setEditingPurchase(item)}
        onRefresh={() => loadPurchases(pageNumber || 1, currentPageSize)}
      />

      {/* ── New Purchase Request Modal ── */}
      <NewHKPurchaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* ── Edit Purchase Request Modal ── */}
      <EditHKPurchaseModal
        open={Boolean(editingPurchase)}
        purchase={editingPurchase}
        onClose={() => setEditingPurchase(null)}
      />

      {/* ── Purchase Details Modal ── */}
      <HKPurchaseDetailsModal
        purchase={viewingPurchase}
        onClose={() => setViewingPurchase(null)}
      />
    </div>
  )
}
