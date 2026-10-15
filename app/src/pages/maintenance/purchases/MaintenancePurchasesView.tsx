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
  fetchMaintenancePurchases,
  setFilters,
  resetFilters,
} from '../../../features/maintenance/maintenancePurchasesSlice'
import { PurchasesFilterBar } from './components/PurchasesFilterBar'
import { MaintenancePurchasesTable } from './components/MaintenancePurchasesTable'
import { NewPurchaseRequestModal } from './components/NewPurchaseRequestModal'
import { EditPurchaseRequestModal } from './components/EditPurchaseRequestModal'
import { PurchaseDetailsModal } from './components/PurchaseDetailsModal'
import type {
  MaintenancePurchase,
  PurchaseStatus,
} from '../../../models/MaintenancePurchase'

interface MaintenancePurchasesViewProps {
  initialCreateModalOpen?: boolean
  initialItemId?: number
  initialItemName?: string
  onCloseCreateModal?: () => void
}

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

export function MaintenancePurchasesView({
  initialCreateModalOpen = false,
  initialItemId,
  initialItemName,
  onCloseCreateModal,
}: MaintenancePurchasesViewProps) {
  const dispatch = useAppDispatch()
  const {
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    fetchStatus,
    filters,
  } = useAppSelector((state) => state.maintenancePurchases)

  // Local state for UI filter controls
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | 'All'>('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(initialCreateModalOpen)
  const [createItemId, setCreateItemId] = useState<number | undefined>(initialItemId)
  const [createItemName, setCreateItemName] = useState<string | undefined>(initialItemName)
  const [editingPurchase, setEditingPurchase] = useState<MaintenancePurchase | null>(null)
  const [viewingPurchase, setViewingPurchase] = useState<MaintenancePurchase | null>(null)

  // Sync external open request
  useEffect(() => {
    if (initialCreateModalOpen) {
      setCreateModalOpen(true)
      setCreateItemId(initialItemId)
      setCreateItemName(initialItemName)
    }
  }, [initialCreateModalOpen, initialItemId, initialItemName])

  // Load purchases based on filters
  const loadPurchases = useCallback(
    (page = 1, size = 10) => {
      const queryParams = {
        pageNumber: page,
        pageSize: size,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }
      dispatch(setFilters(queryParams))
      dispatch(fetchMaintenancePurchases(queryParams))
    },
    [dispatch, statusFilter, fromDate, toDate]
  )

  useEffect(() => {
    loadPurchases(1, pageSize || 10)
  }, [loadPurchases, pageSize])

  // Periodic background refresh & tab focus refresh so table refreshes on its own
  useEffect(() => {
    const interval = setInterval(() => {
      const queryParams = {
        pageNumber,
        pageSize,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }
      dispatch(fetchMaintenancePurchases(queryParams))
    }, 20000)

    const handleFocus = () => {
      const queryParams = {
        pageNumber,
        pageSize,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }
      dispatch(fetchMaintenancePurchases(queryParams))
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [dispatch, pageNumber, pageSize, statusFilter, fromDate, toDate])

  // Client-side search for fast interactive responsiveness
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item) return false
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim()
        const matchesReason = (item.reason || '').toLowerCase().includes(query)
        const matchesId = (item.id != null ? String(item.id) : '').includes(query)
        if (!matchesReason && !matchesId) return false
      }
      return true
    })
  }, [items, searchTerm])

  // KPI Calculations
  const stats = useMemo(() => {
    let pendingCount = 0
    let inProgressCount = 0
    let completedCount = 0

    items.forEach((it) => {
      if (it.status === 'Pending' || it.status === 'Viewed') pendingCount++
      else if (it.status === 'Approved' || it.status === 'Ordered') inProgressCount++
      else if (it.status === 'Completed') completedCount++
    })

    return {
      total: totalCount || items.length,
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
    }
  }, [items, totalCount])

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setFromDate('')
    setToDate('')
    dispatch(resetFilters())
    dispatch(fetchMaintenancePurchases({ pageNumber: 1, pageSize: 10 }))
  }

  const handlePageChange = (newPage: number) => {
    loadPurchases(newPage, pageSize)
  }

  const handlePageSizeChange = (newSize: number) => {
    loadPurchases(1, newSize)
  }

  const handleOpenCreateModal = (itemId?: number, itemName?: string) => {
    setCreateItemId(itemId)
    setCreateItemName(itemName)
    setCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false)
    setCreateItemId(undefined)
    setCreateItemName(undefined)
    loadPurchases(pageNumber, pageSize)
    if (onCloseCreateModal) onCloseCreateModal()
  }

  const handleCloseEditModal = () => {
    setEditingPurchase(null)
    loadPurchases(pageNumber, pageSize)
  }

  const handleCloseViewModal = () => {
    setViewingPurchase(null)
    loadPurchases(pageNumber, pageSize)
  }

  return (
    <div className="space-y-6">
      {/* KPI Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats.total}
          hint="All time purchase requests"
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          hint="Awaiting supervisor action"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="In Progress / Ordered"
          value={stats.inProgress}
          hint="Approved or placed with vendor"
          icon={<Truck className="h-5 w-5" />}
        />
        <StatCard
          label="Fulfilled & Received"
          value={stats.completed}
          hint="Completed purchase orders"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Action Header Banner */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0B4EA2]">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Maintenance Purchase Requests</h2>
            <p className="text-xs text-slate-500">
              Manage spare parts requisition, supervisor approval, and order delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-800 transition shadow-sm"
          >
            <PackagePlus className="h-4 w-4" />
            New Purchase Request
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <PurchasesFilterBar
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

      {/* Requests Table */}
      <MaintenancePurchasesTable
        items={filteredItems}
        loading={fetchStatus === 'loading'}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewDetails={(item) => setViewingPurchase(item)}
        onEdit={(item) => setEditingPurchase(item)}
      />

      {/* Modals */}
      <NewPurchaseRequestModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        defaultItemId={createItemId}
        defaultItemName={createItemName}
      />

      <EditPurchaseRequestModal
        open={Boolean(editingPurchase)}
        onClose={handleCloseEditModal}
        purchase={editingPurchase}
      />

      <PurchaseDetailsModal
        open={Boolean(viewingPurchase)}
        onClose={handleCloseViewModal}
        purchase={viewingPurchase}
      />
    </div>
  )
}
