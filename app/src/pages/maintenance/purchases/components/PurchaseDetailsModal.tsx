import { useEffect } from 'react'
import { Calendar, Clock, FileText, Loader2, Package, Tag, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../shared/apis/hooks'
import {
  changeMaintenancePurchaseStatus,
  fetchMaintenancePurchaseById,
} from '../../../../features/maintenance/maintenancePurchasesSlice'
import { getAvailablePurchaseActions } from '../../../../models/MaintenancePurchase'
import { showSuccessToast, showErrorToast } from '../../../../shared/ui/toastFeedback'
import type {
  MaintenancePurchaseSummary,
  MaintenancePurchaseDetail,
  PurchaseStatusAction,
} from '../../../../models/MaintenancePurchase'

interface PurchaseDetailsModalProps {
  open: boolean
  onClose: () => void
  purchase: MaintenancePurchaseSummary | MaintenancePurchaseDetail | null
}

export function PurchaseDetailsModal({ open, onClose, purchase }: PurchaseDetailsModalProps) {
  const dispatch = useAppDispatch()
  const { statusChangeStatus, selectedItem, fetchDetailsStatus } = useAppSelector(
    (state) => state.maintenancePurchases
  )

  useEffect(() => {
    if (open && purchase) {
      dispatch(fetchMaintenancePurchaseById(purchase.id))
    }
  }, [open, purchase, dispatch])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && statusChangeStatus !== 'loading') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, statusChangeStatus, onClose])

  if (!open || !purchase) return null

  const isActionLoading = statusChangeStatus === 'loading'
  const isDetailsLoading = fetchDetailsStatus === 'loading'

  // Prefer the detailed record if it matches current purchase ID
  const detail: MaintenancePurchaseDetail | null =
    selectedItem && selectedItem.id === purchase.id ? selectedItem : null
  const currentStatus = detail?.status || purchase.status
  const availableActions = getAvailablePurchaseActions(currentStatus)

  const handleAction = async (action: PurchaseStatusAction) => {
    try {
      const res = await dispatch(
        changeMaintenancePurchaseStatus({
          id: purchase.id,
          statusAction: action,
          previousStatus: currentStatus,
        })
      )
      if (changeMaintenancePurchaseStatus.fulfilled.match(res)) {
        showSuccessToast(`Action '${action}' applied successfully!`)
        // Refresh details
        dispatch(fetchMaintenancePurchaseById(purchase.id))
      } else {
        showErrorToast(res.payload, `Failed to update status`)
      }
    } catch (err) {
      showErrorToast(err, `Failed to update status`)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'Normal':
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div
        className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#0B4EA2] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Purchase Request Details</h2>
              <p className="text-xs text-blue-100 font-mono">#PR-{purchase.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isActionLoading}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Status & Date Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Current Status</span>
              </div>
              <span className="font-bold text-sm text-slate-800">{currentStatus}</span>
            </div>

            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Required Delivery Date</span>
              </div>
              <span className="font-bold text-sm text-slate-800">
                {new Date(detail?.requiredDate || purchase.requiredDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Reason / Justification */}
          <div className="rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Reason / Justification</span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {detail?.reason || purchase.reason || 'No specific reason provided.'}
            </p>
          </div>

          {/* Requested Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Requested Parts Breakdown
              </h3>
              {detail && (
                <span className="text-xs text-slate-500">
                  {detail.items.length} {detail.items.length === 1 ? 'part' : 'parts'}
                </span>
              )}
            </div>

            {isDetailsLoading && !detail ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#0B4EA2]" />
                <span>Loading parts breakdown...</span>
              </div>
            ) : detail && detail.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">#</th>
                      <th className="px-4 py-2.5 font-bold">Spare Part</th>
                      <th className="px-4 py-2.5 font-bold">Quantity</th>
                      <th className="px-4 py-2.5 font-bold">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">
                          {item.itemName || `Item #${item.itemId}`}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-[#0B4EA2]">
                          {item.quantity} units
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold border ${getPriorityBadge(
                              item.priority || 'Low'
                            )}`}
                          >
                            {item.priority || 'Low'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No parts items data available.
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Created at:
              </span>
              <span className="font-mono text-slate-700">
                {new Date(purchase.createdAt).toLocaleString()}
              </span>
            </div>

            {detail?.modifiedAt && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Last modified:
                </span>
                <span className="font-mono text-slate-700">
                  {new Date(detail.modifiedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Status Actions */}
          {availableActions.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Workflow Actions
              </div>
              <div className="flex flex-wrap gap-2">
                {availableActions.map((opt) => (
                  <button
                    key={opt.action}
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleAction(opt.action)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                      opt.variant === 'primary'
                        ? 'bg-[#0B4EA2] text-white hover:bg-blue-800'
                        : opt.variant === 'success'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : opt.variant === 'danger'
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : opt.variant === 'warning'
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isActionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
