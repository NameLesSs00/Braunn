import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchMaintenanceRequestById, clearSelected } from '../../features/maintenance/maintenanceRequestsSlice'
import { appAlert } from '../../shared/ui/AppAlert'
import { API_BASE_URL } from '../../store/apiClient'
import { ReassignHistoryItem } from '../../models/MaintenanceRequest'
import { maintenanceRequestsApi } from '../../shared/apis/maintenanceRequestsApi'



export default function MaintenanceRequestDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const selected = useAppSelector((s) => s.maintenanceRequests.selected)
  const loading = useAppSelector((s) => s.maintenanceRequests.loadingDetail)

  const [reassignHistory, setReassignHistory] = useState<ReassignHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (!id) return
    dispatch(fetchMaintenanceRequestById(id)).unwrap().catch((e) => {
      appAlert.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 5000, icon: 'error', title: 'Failed to load request', text: e?.message || 'Unknown error' })
    })

    setLoadingHistory(true)
    maintenanceRequestsApi.fetchReassignHistory(id)
      .then((data) => {
        setReassignHistory(data || [])
      })
      .catch((e) => {
        console.error('Failed to load reassign history:', e)
      })
      .finally(() => {
        setLoadingHistory(false)
      })

    return () => {
      dispatch(clearSelected())
    }
  }, [dispatch, id])

  if (loading) {
    return <div className="p-6">Loading…</div>
  }

  if (!selected) {
    return <div className="p-6">Request not found.</div>
  }

  return (
    <div className="space-y-6 py-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[28px] font-semibold text-slate-800">Maintenance Request Details</h1>
            <p className="text-sm text-slate-500">Request #{selected.requestNo ?? selected.id}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">General Information</h2>
          <div className="mt-4 grid gap-3">
            <div><strong>Location:</strong> {selected.location}</div>
            <div><strong>Source:</strong> {selected.source}</div>
            <div><strong>Room Number:</strong> {selected.roomNo ?? '—'}</div>
            <div><strong>Item Name:</strong> {selected.itemName ?? '—'}</div>
            <div><strong>Item ID:</strong> {selected.itemId ?? '—'}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Request Details</h2>
          <div className="mt-4 grid gap-3">
            <div><strong>Priority:</strong> {selected.priorityLevel}</div>
            <div><strong>Status:</strong> {selected.status}</div>
            <div><strong>Notes:</strong>
              <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{selected.notes || '—'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Timeline</h2>
          <div className="mt-4 grid gap-3">
            <div><strong>Created At:</strong> {selected.createdAt}</div>
            <div><strong>Updated At:</strong> {selected.updatedAt ?? '—'}</div>
          </div>
        </div>
<div className="rounded-2xl bg-white p-6 shadow-sm">
  <h2 className="text-lg font-semibold text-slate-800">Images</h2>

  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {selected.images && selected.images.length > 0 ? (
      selected.images.map((image) => {
        const imageUrl = `https://pmss.runasp.net/${image.imageUrl}`;

        return (
          <a
            key={image.id}
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
          >
            <img
              src={imageUrl}
              alt="Maintenance"
              className="h-48 w-full object-cover"
              loading="lazy"
            />
          </a>
        );
      })
    ) : (
      <div className="text-slate-500">No uploaded images</div>
    )}
  </div>
</div>
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800">Assignment</h2>
          <div className="mt-4 grid gap-3">
            <div><strong>Current Assigned Employee:</strong> {selected.currentAssignedEmployeeName ?? '—'}</div>
            <div>
              <strong>Reassign History:</strong>
              <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {loadingHistory ? (
                  <div className="text-slate-500">Loading reassign history...</div>
                ) : reassignHistory && reassignHistory.length > 0 ? (
                  reassignHistory.map((history) => (
                    <div key={history.id} className="space-y-1 rounded-xl bg-white p-3 shadow-sm">
                      <div className="text-slate-500 font-medium">
                        {history.reassignedAt ? new Date(history.reassignedAt).toLocaleString() : '—'}
                      </div>
                      <div>
                        <strong>From:</strong> {history.oldEmployeeName || history.oldEmployeeId || 'Unassigned'}
                      </div>
                      <div>
                        <strong>To:</strong> {history.newEmployeeName || history.newEmployeeId || 'Unassigned'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No reassign history</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
