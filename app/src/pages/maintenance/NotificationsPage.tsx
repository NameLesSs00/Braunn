import { useEffect, useState } from 'react'
import {
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiFilter,
  FiSearch,
  FiX,
} from 'react-icons/fi'
import { HiOutlineBell } from 'react-icons/hi2'

import { MaintenanceHeader } from '../../widgets/layout/MaintenanceHeader/MaintenanceHeader'
import { appAlert } from '../../shared/ui/AppAlert'
import { notificationsApi, type NotificationItem } from '../../shared/apis/notificationsApi'

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    InProgress: 'bg-purple-50 text-purple-700 border-purple-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }

  return (
    <span
      className={[
        'inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold',
        statusStyles[status] || 'bg-slate-50 text-slate-700 border-slate-200',
      ].join(' ')}
    >
      {status}
    </span>
  )
}

function DetailModal({
  isOpen,
  onClose,
  notification,
}: {
  isOpen: boolean
  onClose: () => void
  notification: NotificationItem | null
}) {
  if (!isOpen || !notification) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#004bb0] px-5 py-4 text-white">
          <div className="text-[18px] font-bold">Notification Details</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-white hover:bg-white/15"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 bg-white p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-[#004bb0]">
                <HiOutlineBell className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-800">#{notification.id}</div>
                <div className="text-[12px] text-slate-500">Notification ID</div>
              </div>
            </div>
            <StatusBadge status={notification.requestStatus} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Item Name</div>
              <div className="text-[14px] font-semibold text-slate-800">{notification.itemName || 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Plan ID</div>
              <div className="text-[14px] font-semibold text-slate-800">#{notification.planId}</div>
            </div>

            <div className="space-y-1">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">PM Request ID</div>
              <div className="text-[14px] font-semibold text-slate-800">
                #{notification.preventiveMaintenanceRequestId}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Scheduled Date</div>
              <div className="text-[14px] font-semibold text-slate-800">
                {new Date(notification.scheduledDate).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Message</div>
            <div className="rounded-lg bg-slate-50 p-4 text-[14px] text-slate-700">{notification.message}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Created At</div>
              <div className="text-[13px] text-slate-700">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Updated At</div>
              <div className="text-[13px] text-slate-700">
                {new Date(notification.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 bg-[#f8fafc] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const pageSize = 10

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const result = await notificationsApi.getNotifications({
        PageNumber: page,
        PageSize: pageSize,
        RequestStatus: statusFilter || undefined,
      })

      setNotifications(result.items || [])
      setTotalCount(result.totalCount || 0)
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch notifications'
      appAlert.fire({ icon: 'error', title: 'Error', text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (id: number) => {
    try {
      const result = await notificationsApi.getNotificationById(id)
      setSelectedNotification(result)
      setIsDetailModalOpen(true)
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Failed to fetch notification details'
      appAlert.fire({ icon: 'error', title: 'Error', text: errorMsg })
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [page, statusFilter])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="space-y-6">
      <MaintenanceHeader NameMaintenance="Maintenance Notifications" />

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-[#004bb0]">
              <HiOutlineBell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-800">Notification Alerts</h2>
              <p className="text-[12px] text-slate-500">View and track all maintenance notification alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FiFilter className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#004bb0]"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="bg-slate-50">
              <tr>
                {['ID', 'Item Name', 'Message', 'Status', 'Scheduled Date', 'Actions'].map((column) => (
                  <th
                    key={column}
                    className="px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-slate-500"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    Loading notifications...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    No notifications found.
                  </td>
                </tr>
              ) : (
                notifications.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 bg-white hover:bg-slate-50">
                    <td className="px-4 py-4 text-[13px] font-mono text-slate-800">#{item.id}</td>
                    <td className="px-4 py-4 text-[13px] font-semibold text-slate-800">
                      {item.itemName || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-600">
                      <div className="max-w-[300px] truncate">{item.message}</div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={item.requestStatus} />
                    </td>
                    <td className="px-4 py-4 text-[13px] text-slate-600">
                      {new Date(item.scheduledDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(item.id)}
                        className="rounded-md border border-[#004bb0] p-2 text-[#004bb0] hover:bg-[#eef4ff] transition-colors"
                        title="View Details"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 text-[13px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select disabled className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 opacity-70">
              <option>{pageSize}</option>
            </select>
            <span>entries</span>
          </div>
          <div>
            Showing {notifications.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(page * pageSize, totalCount)} of {totalCount} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-500 disabled:opacity-50"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-md bg-[#004bb0] px-3 py-1.5 text-white">
              {page}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-500 disabled:opacity-50"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <DetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} notification={selectedNotification} />
    </div>
  )
}

export default NotificationsPage
