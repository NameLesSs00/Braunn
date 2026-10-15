import { useEffect } from 'react'
import { Calendar, Clock, Loader2, Package, Tag, User, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../../../shared/apis/hooks'
import {
  changeLaundryPurchaseStatus,
  fetchLaundryPurchaseById,
} from '../../../../../features/Laundryfeatures/laundryPurchases/laundryPurchasesSlice'
import { getAvailableLaundryPurchaseActions } from '../../../../../models/Laundrymodels/LaundryPurchase'
import { showSuccessToast, showErrorToast } from '../../../../../shared/ui/toastFeedback'
import type {
  LaundryPurchaseReadDto,
  LaundryPurchaseAction,
  LaundryPurchasePriority,
  LaundryPurchaseItemDto,
} from '../../../../../models/Laundrymodels/LaundryPurchase'

interface LaundryPurchaseDetailsModalProps {
  open?: boolean
  onClose: () => void
  purchase: LaundryPurchaseReadDto | null
}

export function LaundryPurchaseDetailsModal({
  open,
  onClose,
  purchase,
}: LaundryPurchaseDetailsModalProps) {
  const dispatch = useAppDispatch()
  const { actionStatus, selectedItem, detailStatus } = useAppSelector(
    (state) => state.laundryPurchases
  )

  const isOpen = open !== undefined ? open : Boolean(purchase)

  useEffect(() => {
    if (isOpen && purchase?.id) {
      dispatch(fetchLaundryPurchaseById(purchase.id))
    }
  }, [isOpen, purchase?.id, dispatch])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && actionStatus !== 'loading') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, actionStatus, onClose])

  if (!isOpen || !purchase) return null

  const isActionLoading = actionStatus === 'loading'
  const isDetailsLoading = detailStatus === 'loading'

  const detail: LaundryPurchaseReadDto | null =
    selectedItem && selectedItem.id === purchase.id ? selectedItem : purchase

  const currentStatus = detail?.status || purchase.status
  const availableActions = getAvailableLaundryPurchaseActions(currentStatus)

  const itemsList: LaundryPurchaseItemDto[] = (
    Array.isArray(detail?.items)
      ? detail.items
      : Array.isArray((detail as any)?.purchaseItems)
      ? (detail as any).purchaseItems
      : Array.isArray((detail as any)?.Items)
      ? (detail as any).Items
      : Array.isArray(purchase?.items)
      ? purchase.items
      : Array.isArray((purchase as any)?.purchaseItems)
      ? (purchase as any).purchaseItems
      : []
  ) as LaundryPurchaseItemDto[]

  const handleAction = async (action: LaundryPurchaseAction) => {
    try {
      const res = await dispatch(
        changeLaundryPurchaseStatus({
          id: purchase.id,
          action,
        })
      )
      if (changeLaundryPurchaseStatus.fulfilled.match(res)) {
        showSuccessToast(`Requisition #${purchase.id} action "${action}" completed`)
      } else {
        showErrorToast(res.payload || 'Failed to update status')
      }
    } catch (err) {
      showErrorToast(err, 'Failed to update status')
    }
  }

  const getPriorityBadgeClass = (priority: LaundryPurchasePriority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Low':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Ordered':
      case 'Approved':
        return 'bg-blue-100 text-[#0B4EA2] border-blue-200'
      case 'Viewed':
        return 'bg-sky-100 text-sky-700 border-sky-200'
      case 'Rejected':
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200'
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Laundry Purchase Requisition Details</h2>
              <p className="text-xs text-blue-100 font-mono mt-0.5">#LND-{purchase.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isActionLoading}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Status & Date Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Current Status</span>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                  currentStatus
                )}`}
              >
                {currentStatus}
              </span>
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

            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Created By</span>
              </div>
              <span className="font-bold text-sm text-slate-800 truncate block">
                {detail?.createdByName ||
                  (detail?.createdBy && !/^[0-9a-fA-F-]{32,36}$/.test(detail.createdBy)
                    ? detail.createdBy
                    : 'Laundry Staff')}
              </span>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-[#0B4EA2]" />
                Requested Laundry Items ({itemsList.length})
              </h3>
            </div>

            {isDetailsLoading && itemsList.length === 0 ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-[#0B4EA2]" />
                <span>Loading requisition items...</span>
              </div>
            ) : itemsList.length > 0 ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Item Description</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemsList.map((it: LaundryPurchaseItemDto, idx: number) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 text-xs font-mono text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {it.itemName || (it as any).name || (it.itemId ? `Item #${it.itemId}` : `Supply Item #${idx + 1}`)}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">
                          {it.quantity}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadgeClass(
                              it.priority
                            )}`}
                          >
                            {it.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                No items attached to this requisition.
              </div>
            )}
          </div>

          {/* Audit Timestamps */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>Created: {new Date(detail?.createdAt || purchase.createdAt).toLocaleString()}</span>
            {detail?.updatedAt && (
              <span>Updated: {new Date(detail.updatedAt).toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {availableActions.map((opt) => (
              <button
                key={opt.action}
                type="button"
                onClick={() => handleAction(opt.action)}
                disabled={isActionLoading}
                className={[
                  'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer',
                  opt.variant === 'primary'
                    ? 'bg-[#0B4EA2] text-white hover:bg-blue-800'
                    : opt.variant === 'success'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : opt.variant === 'danger'
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
