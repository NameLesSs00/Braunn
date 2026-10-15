import { useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSearch,
  Loader2,
  MoreVertical,
  Package,
  Trash2,
  XCircle,
  Pencil,
} from 'lucide-react'
import { useAppDispatch } from '../../../../shared/apis/hooks'
import {
  changeLaundryPurchaseStatus,
  deleteLaundryPurchase,
} from '../../../../features/Laundryfeatures/laundryPurchases/laundryPurchasesSlice'
import {
  getAvailableLaundryPurchaseActions,
  type LaundryPurchaseReadDto,
  type LaundryPurchaseStatus,
  type LaundryPurchaseAction,
} from '../../../../models/Laundrymodels/LaundryPurchase'
import { showSuccessToast, showErrorToast } from '../../../../shared/ui/toastFeedback'

interface LaundryPurchasesTableProps {
  items: LaundryPurchaseReadDto[]
  loading: boolean
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
  onViewDetails: (item: LaundryPurchaseReadDto) => void
  onEdit?: (item: LaundryPurchaseReadDto) => void
  onRefresh: () => void
}

export function statusDotColor(status: LaundryPurchaseStatus | string): string {
  switch (status) {
    case 'Pending':
      return 'bg-amber-500'
    case 'Viewed':
      return 'bg-indigo-500'
    case 'Approved':
      return 'bg-sky-500'
    case 'Ordered':
      return 'bg-blue-600'
    case 'Completed':
      return 'bg-emerald-500'
    case 'Rejected':
      return 'bg-rose-500'
    case 'Cancelled':
    default:
      return 'bg-slate-400'
  }
}

export function statusPillClass(status: LaundryPurchaseStatus | string): string {
  switch (status) {
    case 'Pending':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'Viewed':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200'
    case 'Approved':
      return 'bg-sky-50 text-sky-800 border-sky-200'
    case 'Ordered':
      return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'Completed':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'Rejected':
      return 'bg-rose-50 text-rose-800 border-rose-200'
    case 'Cancelled':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export function LaundryPurchasesTable({
  items,
  loading,
  pageNumber,
  pageSize,
  totalPages,
  totalCount,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onEdit,
  onRefresh,
}: LaundryPurchasesTableProps) {
  const dispatch = useAppDispatch()
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<LaundryPurchaseReadDto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleStatusAction = async (
    id: number,
    action: LaundryPurchaseAction
  ) => {
    setActionLoadingId(id)
    try {
      const res = await dispatch(
        changeLaundryPurchaseStatus({
          id,
          action,
        })
      )
      if (changeLaundryPurchaseStatus.fulfilled.match(res)) {
        showSuccessToast(`Action '${action}' applied to request #LND-${id}!`)
        onRefresh()
      } else {
        showErrorToast(res.payload, 'Failed to update status')
      }
    } catch (err) {
      showErrorToast(err, 'Failed to update status')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteCandidate) return
    const id = deleteCandidate.id
    setIsDeleting(true)
    try {
      const res = await dispatch(deleteLaundryPurchase(id))
      if (deleteLaundryPurchase.fulfilled.match(res)) {
        showSuccessToast(`Purchase request #LND-${id} deleted.`)
        setDeleteCandidate(null)
        onRefresh()
      } else {
        showErrorToast(res.payload, 'Failed to delete purchase request')
      }
    } catch (err) {
      showErrorToast(err, 'Failed to delete purchase request')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto min-h-[340px]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Request ID</th>
                <th className="px-5 py-3.5">Required Date</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Workflow & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0B4EA2]" />
                      <span>Loading purchase requests...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSearch className="h-8 w-8 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-600">
                        No purchase requests found
                      </span>
                      <span className="text-xs text-slate-400">
                        Try adjusting your filters or create a new laundry purchase request.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row, index) => {
                  const rawItems = Array.isArray(row.items)
                    ? row.items
                    : Array.isArray((row as any).purchaseItems)
                    ? (row as any).purchaseItems
                    : []

                  const availableActions = getAvailableLaundryPurchaseActions(row.status)
                  const isActionLoading = actionLoadingId === row.id
                  const isMenuOpen = activeMenuId === row.id
                  const canEdit = row.status === 'Pending' || row.status === 'Viewed'
                  const canDelete = row.status === 'Pending'
                  const isNearBottom = index >= Math.max(1, items.length - 2) && items.length > 1

                  const formattedReqDate = row.requiredDate
                    ? new Date(row.requiredDate).toLocaleDateString()
                    : new Date(row.createdAt).toLocaleDateString()

                  const formattedCreatedDate = new Date(row.createdAt).toLocaleDateString()
                  const formattedCreatedTime = new Date(row.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  // Safe author name (avoid GUID)
                  const author =
                    row.createdByName ||
                    (row.createdBy && !/^[0-9a-fA-F-]{32,36}$/.test(row.createdBy)
                      ? row.createdBy
                      : 'Laundry Staff')

                  return (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-slate-50/60 group"
                    >
                      {/* Request ID */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => onViewDetails(row)}
                          className="hover:text-[#0B4EA2] hover:underline cursor-pointer transition text-left"
                          title="View Requisition Details"
                        >
                          #LND-{row.id}
                        </button>
                      </td>

                      {/* Required Date */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formattedReqDate}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          <button
                            type="button"
                            onClick={() => onViewDetails(row)}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-[#0B4EA2] border border-blue-100 hover:bg-blue-100 transition cursor-pointer"
                            title="View Requisition Items"
                          >
                            <Package className="h-3.5 w-3.5" />
                            <span>
                              {rawItems.length} {rawItems.length === 1 ? 'item' : 'items'}
                            </span>
                          </button>

                          {rawItems.slice(0, 2).map((it: any, iIdx: number) => (
                            <span
                              key={it.id || iIdx}
                              className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium inline-flex items-center gap-1"
                            >
                              <span>{it.itemName || it.name || 'Supply item'}</span>
                              <span className="font-semibold text-slate-900">×{it.quantity || 1}</span>
                              {it.priority && it.priority !== 'Normal' && (
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                    it.priority === 'High'
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {it.priority}
                                </span>
                              )}
                            </span>
                          ))}

                          {rawItems.length > 2 && (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                              +{rawItems.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${statusPillClass(
                            row.status
                          )}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${statusDotColor(row.status)}`}
                          />
                          {row.status}
                        </span>
                      </td>

                      {/* Created Date & Author */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-xs text-slate-700">
                          {formattedCreatedDate}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{formattedCreatedTime}</span>
                          <span>•</span>
                          <span>{author}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Quick Workflow Action Button */}
                          {availableActions.length > 0 && (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() =>
                                handleStatusAction(row.id, availableActions[0].action)
                              }
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 ${
                                availableActions[0].variant === 'primary'
                                  ? 'bg-[#0B4EA2] text-white hover:bg-blue-800'
                                  : availableActions[0].variant === 'success'
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : availableActions[0].variant === 'danger'
                                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                                  : availableActions[0].variant === 'warning'
                                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {isActionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                              <span>{availableActions[0].label}</span>
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => onViewDetails(row)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* 3-Dots Menu Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveMenuId(isMenuOpen ? null : row.id)
                              }}
                              className={`rounded-lg p-1.5 transition cursor-pointer ${
                                isMenuOpen
                                  ? 'bg-slate-200 text-slate-800'
                                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                              }`}
                              title="More Options"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-30 bg-transparent"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveMenuId(null)
                                  }}
                                />
                                <div
                                  className={`absolute right-0 z-40 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-all ${
                                    isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null)
                                      onViewDetails(row)
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                    <span>View Details</span>
                                  </button>

                                  {/* Secondary actions (e.g. Reject if Pending) */}
                                  {availableActions.slice(1).map((act) => (
                                    <button
                                      key={act.action}
                                      type="button"
                                      disabled={isActionLoading}
                                      onClick={() => {
                                        setActiveMenuId(null)
                                        handleStatusAction(row.id, act.action)
                                      }}
                                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition cursor-pointer ${
                                        act.variant === 'danger'
                                          ? 'text-rose-600 hover:bg-rose-50'
                                          : 'text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span>{act.label}</span>
                                    </button>
                                  ))}

                                  {canEdit && onEdit && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null)
                                        onEdit(row)
                                      }}
                                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-slate-400" />
                                      <span>Edit Request</span>
                                    </button>
                                  )}

                                  {canDelete && (
                                    <>
                                      <div className="my-1 border-t border-slate-100" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMenuId(null)
                                          setDeleteCandidate(row)
                                        }}
                                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                        <span>Delete Request</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 px-5 py-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 outline-none focus:border-[#0B4EA2] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
            <span className="text-slate-400 ml-2">
              (Total {totalCount} requests)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-2 text-slate-500">
              Page <span className="font-bold text-slate-800">{pageNumber}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages || 1}</span>
            </span>

            <button
              type="button"
              disabled={pageNumber <= 1 || loading}
              onClick={() => onPageChange(pageNumber - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              disabled={pageNumber >= totalPages || loading}
              onClick={() => onPageChange(pageNumber + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Delete Purchase Request?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Are you sure you want to delete purchase request{' '}
                    <span className="font-mono font-bold text-slate-800">
                      #LND-{deleteCandidate.id}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteCandidate(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Delete Requisition</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
