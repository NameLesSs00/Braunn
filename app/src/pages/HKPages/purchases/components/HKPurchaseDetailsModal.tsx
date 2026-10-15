import { useEffect } from 'react'
import { Calendar, FileText, Package, User, X } from 'lucide-react'
import type { HkmPurchaseReadDto } from '../../../../models/HKmodels/HkmPurchase'
import { statusPillClass, statusDotColor } from './HKPurchasesTable'

interface HKPurchaseDetailsModalProps {
  purchase: HkmPurchaseReadDto | null
  onClose: () => void
}

export function HKPurchaseDetailsModal({
  purchase,
  onClose,
}: HKPurchaseDetailsModalProps) {
  useEffect(() => {
    if (!purchase) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [purchase, onClose])

  if (!purchase) return null

  const items = Array.isArray(purchase.items)
    ? purchase.items
    : Array.isArray((purchase as any).purchaseItems)
    ? (purchase as any).purchaseItems
    : []

  const reqDate = purchase.requiredDate
    ? new Date(purchase.requiredDate).toLocaleDateString()
    : new Date(purchase.createdAt).toLocaleDateString()

  const createdDate = new Date(purchase.createdAt).toLocaleDateString()
  const createdTime = new Date(purchase.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const author =
    purchase.createdByName ||
    (purchase.createdBy && !/^[0-9a-fA-F-]{32,36}$/.test(purchase.createdBy)
      ? purchase.createdBy
      : 'Housekeeping Staff')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B4EA2]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-800">
                  Purchase Request #HK-{purchase.id}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusPillClass(
                    purchase.status
                  )}`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusDotColor(purchase.status)}`} />
                  {purchase.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted on {createdDate} at {createdTime}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Required Date
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Calendar className="h-4 w-4 text-[#0B4EA2]" />
                <span>{reqDate}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Items
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Package className="h-4 w-4 text-[#0B4EA2]" />
                <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Requested By
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 truncate">
                <User className="h-4 w-4 text-[#0B4EA2] shrink-0" />
                <span className="truncate">{author}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Requested Items
            </span>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Item Description</th>
                    <th className="px-4 py-3 text-center">Priority</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-xs text-slate-400">
                        No item details available.
                      </td>
                    </tr>
                  ) : (
                    items.map((it: any, idx: number) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {it.itemName || it.name || 'Housekeeping Supply Item'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                              it.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : it.priority === 'Low'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}
                          >
                            {it.priority || 'Normal'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-[#0B4EA2]">
                          {it.quantity}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4 bg-slate-50/30">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
