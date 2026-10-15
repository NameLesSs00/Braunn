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
  Pencil,
  Trash2,
  XCircle,
  ArrowRightCircle,
} from 'lucide-react'
import { useAppDispatch } from '../../../../shared/apis/hooks'
import {
  changeMaintenancePurchaseStatus,
  removeMaintenancePurchase,
} from '../../../../features/maintenance/maintenancePurchasesSlice'
import { getAvailablePurchaseActions } from '../../../../models/MaintenancePurchase'
import { showSuccessToast, showErrorToast } from '../../../../shared/ui/toastFeedback'
import type {
  MaintenancePurchaseSummary,
  PurchaseStatus,
  PurchaseStatusAction,
} from '../../../../models/MaintenancePurchase'

interface MaintenancePurchasesTableProps {
  items: MaintenancePurchaseSummary[]
  loading: boolean
  pageNumber: number
  pageSize: number
  totalPages: number
  totalCount: number
  onPageChange: (newPage: number) => void
  onPageSizeChange: (newSize: number) => void
  onViewDetails: (item: MaintenancePurchaseSummary) => void
  onEdit: (item: MaintenancePurchaseSummary) => void
}

export function statusDotColor(status: PurchaseStatus | string): string {
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
    default:
      return 'bg-slate-400'
  }
}

export function statusPillClass(status: PurchaseStatus | string): string {
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
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export function MaintenancePurchasesTable({
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
}: MaintenancePurchasesTableProps) {
  const dispatch = useAppDispatch()
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<MaintenancePurchaseSummary | null>(null)

  const handleStatusAction = async (
    id: number,
    action: PurchaseStatusAction,
    currentStatus: PurchaseStatus
  ) => {
    setActionLoadingId(id)
    try {
      const res = await dispatch(
        changeMaintenancePurchaseStatus({
          id,
          statusAction: action,
          previousStatus: currentStatus,
        })
      )
      if (changeMaintenancePurchaseStatus.fulfilled.match(res)) {
        showSuccessToast(`Action '${action}' applied successfully!`)
      } else {
        showErrorToast(res.payload, `Failed to update status`)
      }
    } catch (err) {
      showErrorToast(err, `Failed to update status`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteCandidate) return
    const id = deleteCandidate.id
    setDeleteCandidate(null)
    try {
      const res = await dispatch(removeMaintenancePurchase(id))
      if (removeMaintenancePurchase.fulfilled.match(res)) {
        showSuccessToast(`Purchase request #${id} deleted.`)
      } else {
        showErrorToast(res.payload, `Failed to delete purchase request`)
      }
    } catch (err) {
      showErrorToast(err, `Failed to delete purchase request`)
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
                <th className="px-5 py-3.5">Parts</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Workflow & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0B4EA2]" />
                      <span>Loading purchase requests...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSearch className="h-8 w-8 text-slate-300" />
                      <span className="text-sm font-semibold text-slate-600">
                        No purchase requests found
                      </span>
                      <span className="text-xs text-slate-400">
                        Try adjusting your filters or create a new purchase request.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row, index) => {
                  const availableActions = getAvailablePurchaseActions(row.status)
                  const isActionLoading = actionLoadingId === row.id
                  const isMenuOpen = activeMenuId === row.id
                  const canEdit = row.status === 'Pending' || row.status === 'Viewed'
                  const canDelete = row.status === 'Pending'
                  const isNearBottom = index >= Math.max(1, items.length - 2) && items.length > 1

                  return (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-slate-50/60 group"
                    >
                      {/* ID */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 text-xs">
                        #PR-{row.id}
                      </td>

                      {/* Required Date */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(row.requiredDate).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Parts Count */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0B4EA2] border border-blue-100">
                          <Package className="h-3.5 w-3.5" />
                          <span>
                            {row.itemCount} {row.itemCount === 1 ? 'part' : 'parts'}
                          </span>
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="px-5 py-4">
                        <div
                          className="text-xs text-slate-600 max-w-[220px] truncate"
                          title={row.reason}
                        >
                          {row.reason || '—'}
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

                      {/* Created Date */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-xs text-slate-700">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(row.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
                                handleStatusAction(row.id, availableActions[0].action, row.status)
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
                              {availableActions[0].label}
                            </button>
                          )}

                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => onViewDetails(row)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Menu Dropdown */}
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
                                {/* Click-outside transparent backdrop */}
                                <div
                                  className="fixed inset-0 z-30 cursor-default"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveMenuId(null)
                                  }}
                                />
                                <div
                                  className={`absolute right-0 z-40 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl animate-in fade-in zoom-in-95 ${
                                    isNearBottom ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActiveMenuId(null)
                                      onViewDetails(row)
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 text-slate-400" />
                                    <span>View Details</span>
                                  </button>

                                  {canEdit && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveMenuId(null)
                                        onEdit(row)
                                      }}
                                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                    >
                                      <Pencil className="h-4 w-4 text-slate-400" />
                                      <span>Edit Request</span>
                                    </button>
                                  )}

                                  {availableActions.slice(1).map((opt) => (
                                    <button
                                      key={opt.action}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveMenuId(null)
                                        handleStatusAction(row.id, opt.action, row.status)
                                      }}
                                      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                                        opt.action === 'reject'
                                          ? 'text-rose-600 hover:bg-rose-50'
                                          : 'text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      {opt.action === 'reject' ? (
                                        <XCircle className="h-4 w-4 text-rose-500" />
                                      ) : (
                                        <ArrowRightCircle className="h-4 w-4 text-[#0B4EA2]" />
                                      )}
                                      <span>
                                        {opt.action === 'reject' ? 'Reject Request' : `Mark as ${opt.label}`}
                                      </span>
                                    </button>
                                  ))}

                                  {canDelete && (
                                    <div className="border-t border-slate-100 mt-1 pt-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setActiveMenuId(null)
                                          setDeleteCandidate(row)
                                        }}
                                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4 text-rose-500" />
                                        <span>Delete Request</span>
                                      </button>
                                    </div>
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

        {/* Pagination Bar */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              Showing page <strong>{pageNumber}</strong> of <strong>{totalPages || 1}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Total: <strong>{totalCount}</strong> requests
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1 || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
                disabled={pageNumber >= totalPages || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-800">Delete Purchase Request</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete purchase request{' '}
              <strong className="font-mono">#PR-{deleteCandidate.id}</strong> (
              {deleteCandidate.itemCount} parts)? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
