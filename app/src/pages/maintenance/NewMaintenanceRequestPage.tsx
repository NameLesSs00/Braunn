import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, UploadCloud, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../shared/lib/routes'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchMaintenanceItems } from '../../features/maintenance/maintenanceItemsSlice'
import { fetchRooms } from '../../features/rooms/roomsSlice'
import { createMaintenanceRequest } from '../../features/maintenance/maintenanceRequestsSlice'
import type { MaintenanceSource } from '../../models/MaintenanceRequest'
import { appAlert } from '../../shared/ui/AppAlert'

const priorityOptions = [
  { label: 'Low', description: 'No urgency, can wait 3–5 days', tone: 'bg-slate-100 text-slate-700' },
  { label: 'Medium', description: 'Should be resolved in 1–2 days', tone: 'bg-blue-100 text-blue-700' },
  { label: 'High', description: 'Resolve within 4 hours', tone: 'bg-yellow-100 text-yellow-800' },
  { label: 'Critical', description: 'Resolve within 1 hour', tone: 'bg-red-100 text-red-700' },
  { label: 'Emergency', description: 'Immediate action — safety risk!', tone: 'bg-[#F7D6DA] text-[#9F0712]' },
]

export function NewMaintenanceRequestPage() {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('High')
  const [location, setLocation] = useState('')
  const [roomNo, setRoomNo] = useState('')
  const [source, setSource] = useState<MaintenanceSource>('HK')
  const [assetId, setAssetId] = useState<string | undefined>(undefined)
  const [files, setFiles] = useState<File[]>([])

  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.maintenanceItems.items)
  const rooms = useAppSelector((s) => s.rooms.items)
  const creating = useAppSelector((s) => s.maintenanceRequests.creating)

  const maintenanceItems = useMemo(() => Array.isArray(items) ? items : [], [items])
  const availableRooms = useMemo(() => Array.isArray(rooms) ? rooms : [], [rooms])

  useEffect(() => {
    dispatch(fetchMaintenanceItems())
    dispatch(fetchRooms())
  }, [dispatch])

  const characterCount = useMemo(() => description.length, [description])

  return (
    <div className="space-y-6 py-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[28px] font-semibold text-slate-800">New Maintenance Request</h1>
            <p className="text-sm text-slate-500">Fill in all required fields to submit.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="grid gap-6">
          <section className="space-y-4">
            <div className="text-lg font-semibold text-slate-800">Source & Location</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Request Source *</span>
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-[#0B4EA2]"
                  value={source}
                  onChange={(e) => setSource(e.target.value as MaintenanceSource)}
                >
                  <option value="HK">Housekeeping</option>
                  <option value="Reception">Reception</option>
                  <option value="Sys">System</option>
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Room / Unit Number</span>
                <select
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-[#0B4EA2]"
                >
                  <option value="">Select room...</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.roomNumber}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm md:col-span-2">
                <span className="font-semibold text-slate-700">Location *</span>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]" placeholder="Main Tower - Room 301" />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <div className="text-lg font-semibold text-slate-800">Assets</div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Asset *</span>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value || undefined)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-[#0B4EA2]"
                >
                  <option value="">Select asset...</option>
                  {maintenanceItems.filter((it) => it.type === 'Product').map((it) => (
                    <option key={it.id} value={it.id}>{it.code}</option>
                  ))}
                </select>
              </label>

     
            </div>
          </section>

          <section className="space-y-4">
            <div className="text-lg font-semibold text-slate-800">Priority Level *</div>
            <div className="grid gap-3 md:grid-cols-5">
              {priorityOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setPriority(option.label)}
                  className={[
                    'rounded-2xl border p-4 text-left transition',
                    priority === option.label ? 'border-[#0B4EA2] bg-[#EEF4FF]' : 'border-slate-200 bg-white hover:bg-slate-50',
                  ].join(' ')}
                >
                  <div className={['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', option.tone].join(' ')}>{option.label}</div>
                  <div className="mt-3 text-xs text-slate-600">{option.description}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="text-lg font-semibold text-slate-800">Issue Details</div>
            <label className="block space-y-2 text-sm">
              <span className="font-semibold text-slate-700">Issue Description *</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-slate-400 focus:border-[#0B4EA2]"
                placeholder="Describe the issue in detail — symptoms, error codes, when it started, any impact on guests...."
              />
            </label>
            <div className="text-xs text-slate-500">{characterCount} characters (min. 10)</div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-800">Attachments</div>
              <div className="text-xs font-medium text-slate-500">{files.length} / 5 photos selected</div>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {files.map((file, idx) => {
                  const previewUrl = URL.createObjectURL(file)
                  return (
                    <div key={`${file.name}-${idx}`} className="group relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                      <img src={previewUrl} alt={file.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-rose-600"
                        title="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-1.5 text-center text-[10px] font-medium text-white truncate">
                        {file.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {files.length < 5 && (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-[#0B4EA2] hover:bg-slate-100/50">
                <UploadCloud className="h-8 w-8 text-[#0B4EA2]" />
                <div className="mt-2 text-sm font-semibold text-slate-700">Click to upload photos</div>
                <div className="mt-1 text-xs text-slate-500">PNG, JPG up to 10MB - Max 5 files</div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const newFiles = e.target.files ? Array.from(e.target.files) : []
                    setFiles((prev) => [...prev, ...newFiles].slice(0, 5))
                    e.target.value = ''
                  }}
                />
              </label>
            )}
          </section>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
          <button
            type="button"
            disabled={creating}
            onClick={async () => {
              if (!location.trim()) {
                appAlert.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, icon: 'error', title: 'Location is required' })
                return
              }

              try {
                const payload = {
                  location: location.trim(),
                  source,
                  roomId: roomNo || undefined,
                  itemId: assetId ? Number(assetId) : undefined,
                  priorityLevel: priority as any,
                  notes: description || undefined,
                }

                await dispatch(createMaintenanceRequest({ payload, images: files })).unwrap()
                appAlert.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Maintenance request created' })
                navigate(routes.maintenance.requests)
              } catch (e: any) {
                appAlert.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 5000, icon: 'error', title: 'Failed to create request', text: e?.message || 'Unknown error' })
              }
            }}
            className="rounded-xl bg-[#0B4EA2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A3F8B] disabled:opacity-60"
          >
            {creating ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
