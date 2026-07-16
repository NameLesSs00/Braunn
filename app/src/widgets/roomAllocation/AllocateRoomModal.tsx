import { useEffect, useMemo, useState } from 'react'
import { X, Search, Loader2, ChevronDown } from 'lucide-react'

import { Modal } from '../../shared/ui/Modal'
import { useAppDispatch } from '../../shared/apis/hooks'
import { assignReservationRoom } from '../../features/ops/opsSlice'
import { getPmsReservationFolio } from '../../shared/apis/PmsReservation'
import { getRoomsAvailability } from '../../shared/apis/roomsApi'
import type { PmsReservationDetails, PmsReservationRoom } from '../../models/PmsReservation'
import type { RoomAvailability } from '../../models/Room'

type Props = {
  open: boolean
  onClose: () => void
  onAssigned?: () => void
  reservation: PmsReservationDetails
}

type AllocationRoomRow = {
  reservationRoomId: string
  roomTypeId: string
  roomTypeName: string
  roomId: string | null
  roomNumber: string | null
  checkInDate: string
  checkOutDate: string
  adults?: number
  children?: number
  status?: string | null
}

function dateOnly(value?: string | null) {
  return value ? value.replace('T', ' ').split(' ')[0] : ''
}

function hasAssignedRoom(row: AllocationRoomRow) {
  return Boolean(row.roomId || (row.roomNumber && row.roomNumber !== 'N/A'))
}

function rowFromReservationRoom(room: PmsReservationRoom, reservation: PmsReservationDetails): AllocationRoomRow {
  return {
    reservationRoomId: room.reservationRoomId,
    roomTypeId: room.roomTypeId || reservation.roomTypeId || '',
    roomTypeName: room.roomTypeName || reservation.roomTypeName || 'Room',
    roomId: room.roomId ?? null,
    roomNumber: room.roomNumber ?? null,
    checkInDate: room.checkInDate || reservation.checkInDate,
    checkOutDate: room.checkOutDate || reservation.checkOutDate,
    adults: room.adults,
    children: room.children,
    status: room.status,
  }
}

export function AllocateRoomModal({ open, onClose, onAssigned, reservation }: Props) {
  const dispatch = useAppDispatch()

  const [rows, setRows] = useState<AllocationRoomRow[]>([])
  const [availabilityByRow, setAvailabilityByRow] = useState<Record<string, RoomAvailability[]>>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeRowId, setActiveRowId] = useState('')
  const [selectedRoomIds, setSelectedRoomIds] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoomType, setSelectedRoomType] = useState('select')
  const [selectedFloor, setSelectedFloor] = useState('select')
  const [selectedStatus, setSelectedStatus] = useState('select')
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    if (!open) return

    const fallbackRows = (reservation.reservationRooms?.length
      ? reservation.reservationRooms.map((room) => rowFromReservationRoom(room, reservation))
      : [{
          reservationRoomId: reservation.reservationRoomIds?.[0] || reservation.id,
          roomTypeId: reservation.roomTypeId || '',
          roomTypeName: reservation.roomTypeName || 'Room',
          roomId: reservation.roomId ?? null,
          roomNumber: reservation.roomNumber ?? null,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          status: reservation.status,
        }])

    let cancelled = false
    setRows(fallbackRows)
    setActiveRowId(fallbackRows[0]?.reservationRoomId ?? '')
    setSelectedRoomIds({})
    setSearchQuery('')
    setSelectedRoomType('select')
    setSelectedFloor('select')
    setSelectedStatus('select')
    setAvailabilityByRow({})
    setLoadError(null)
    setLoadingAvailability(true)

    async function load() {
      try {
        const folio = await getPmsReservationFolio(reservation.id)
        if (cancelled) return

        const folioRows = (folio.reservationRooms ?? []).map((room) => ({
          reservationRoomId: room.reservationRoomId,
          roomTypeId: room.roomTypeId || reservation.roomTypeId || '',
          roomTypeName: room.roomTypeName || reservation.roomTypeName || 'Room',
          roomId: room.roomId ?? null,
          roomNumber: room.roomNumber ?? null,
          checkInDate: room.checkInDate || reservation.checkInDate,
          checkOutDate: room.checkOutDate || reservation.checkOutDate,
          adults: room.adults,
          children: room.children,
          status: room.status,
        }))
        const nextRows = folioRows.length ? folioRows : fallbackRows
        setRows(nextRows)
        setActiveRowId(nextRows[0]?.reservationRoomId ?? '')

        const availabilityEntries = await Promise.all(nextRows.map(async (row) => {
          const rooms = await getRoomsAvailability({
            StartDate: dateOnly(row.checkInDate),
            EndDate: dateOnly(row.checkOutDate),
            RoomTypeId: row.roomTypeId,
          })
          return [row.reservationRoomId, rooms] as const
        }))
        if (!cancelled) {
          setAvailabilityByRow(Object.fromEntries(availabilityEntries))
        }
      } catch (err) {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Could not load reservation room availability.')
      } finally {
        if (!cancelled) setLoadingAvailability(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, reservation])

  const activeRow = useMemo(
    () => rows.find((row) => row.reservationRoomId === activeRowId) ?? rows[0] ?? null,
    [activeRowId, rows],
  )

  const requiredCount = rows.length
  const assignedCount = rows.filter((row) => hasAssignedRoom(row) || selectedRoomIds[row.reservationRoomId]).length
  const hasPendingChanges = rows.some((row) => {
    const selectedRoomId = selectedRoomIds[row.reservationRoomId]
    return selectedRoomId && selectedRoomId !== row.roomId
  })
  const allRowsAssigned = requiredCount > 0 && assignedCount === requiredCount

  const roomTypeOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.roomTypeName).filter(Boolean))),
    [rows],
  )

  const filteredRooms = useMemo(() => {
    if (!activeRow) return []

    const currentRooms = availabilityByRow[activeRow.reservationRoomId] ?? []
    const usedRoomIds = new Set(rows.flatMap((row) => {
      if (row.reservationRoomId === activeRow.reservationRoomId) return []
      return selectedRoomIds[row.reservationRoomId] || row.roomId || []
    }))

    let result = currentRooms.filter((room) => !usedRoomIds.has(room.roomId))

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((room) => room.roomNumber.toLowerCase().includes(q))
    }
    if (selectedRoomType !== 'select') {
      result = result.filter((room) => room.roomTypeName?.toLowerCase().includes(selectedRoomType.toLowerCase()))
    }
    if (selectedFloor !== 'select') {
      result = result.filter((room) => room.roomNumber.startsWith(selectedFloor))
    }
    if (selectedStatus !== 'select' && selectedStatus !== 'Vacant Clean') {
      result = []
    }
    return result
  }, [activeRow, availabilityByRow, rows, searchQuery, selectedFloor, selectedRoomIds, selectedRoomType, selectedStatus])

  const handleAssign = async () => {
    if (!allRowsAssigned || !hasPendingChanges) return
    setIsAssigning(true)
    try {
      for (const row of rows) {
        const selectedRoomId = selectedRoomIds[row.reservationRoomId]
        if (!selectedRoomId || selectedRoomId === row.roomId) continue
        await dispatch(assignReservationRoom({
          reservationRoomId: row.reservationRoomId,
          roomId: selectedRoomId,
        })).unwrap()
      }
      onAssigned?.()
      onClose()
    } catch (e) {
      alert('Failed to assign room: ' + (typeof e === 'string' ? e : e instanceof Error ? e.message : 'Unknown error'))
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="flex flex-col overflow-hidden rounded-2xl bg-white pointer-events-auto"
        style={{ width: 'min(1180px, calc(100vw - 32px))', height: 'min(88vh, 900px)' }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-8 py-5">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>Allocate Rooms</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{assignedCount}/{requiredCount} required rooms assigned</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-6 mt-6 mb-6 rounded-xl border border-slate-100 bg-slate-50 px-6 py-5">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Reservation Details</p>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 md:grid-cols-4">
              <div>
                <p className="mb-1 text-[13px] text-slate-500">Guest Name</p>
                <p className="text-[15px] font-semibold text-slate-900">{reservation.guestName}</p>
              </div>
              <div>
                <p className="mb-1 text-[13px] text-slate-500">Check-In</p>
                <p className="text-[15px] font-semibold text-slate-900">{dateOnly(reservation.checkInDate)}</p>
              </div>
              <div>
                <p className="mb-1 text-[13px] text-slate-500">Check-Out</p>
                <p className="text-[15px] font-semibold text-slate-900">{dateOnly(reservation.checkOutDate)}</p>
              </div>
              <div>
                <p className="mb-1 text-[13px] text-slate-500">Rooms Needed</p>
                <p className="text-[15px] font-semibold text-slate-900">{requiredCount}</p>
              </div>
            </div>
          </div>

          {loadError ? (
            <div className="mx-6 mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{loadError}</div>
          ) : null}

          <div className="mx-6 mb-6 grid gap-5 lg:grid-cols-[360px_1fr]">
            <div className="space-y-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.07em] text-slate-500">Required Room Rows</p>
              {rows.map((row, index) => {
                const selectedRoom = selectedRoomIds[row.reservationRoomId]
                const selectedRoomNumber = selectedRoom
                  ? Object.values(availabilityByRow).flat().find((room) => room.roomId === selectedRoom)?.roomNumber
                  : null
                const assignedLabel = selectedRoomNumber || row.roomNumber || 'Not assigned'
                const complete = hasAssignedRoom(row) || Boolean(selectedRoom)
                return (
                  <button
                    key={row.reservationRoomId}
                    type="button"
                    onClick={() => setActiveRowId(row.reservationRoomId)}
                    className={[
                      'w-full rounded-xl border p-4 text-left transition-colors',
                      activeRow?.reservationRoomId === row.reservationRoomId ? 'border-[#0B4EA2] bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Room {index + 1}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{row.roomTypeName || 'Room Type'}</p>
                      </div>
                      <span className={[
                        'rounded-full border px-2.5 py-1 text-[11px] font-bold',
                        complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700',
                      ].join(' ')}>
                        {complete ? 'Ready' : 'Missing'}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <span>Adults: {row.adults ?? '-'}</span>
                      <span>Children: {row.children ?? '-'}</span>
                      <span className="col-span-2">Room: {assignedLabel}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="min-w-0">
              <div className="mb-5 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <div>
                  <p className="mb-1 text-[12px] font-semibold text-transparent select-none">_</p>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search room number..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] text-slate-700 outline-none focus:border-[#0B4EA2]"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[12px] font-semibold text-slate-600">Room Type</p>
                  <div className="relative">
                    <select
                      value={selectedRoomType}
                      onChange={(e) => setSelectedRoomType(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] text-slate-700 outline-none focus:border-[#0B4EA2]"
                    >
                      <option value="select">select</option>
                      {roomTypeOptions.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[12px] font-semibold text-slate-600">Floor</p>
                  <div className="relative">
                    <select
                      value={selectedFloor}
                      onChange={(e) => setSelectedFloor(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] text-slate-700 outline-none focus:border-[#0B4EA2]"
                    >
                      <option value="select">select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[12px] font-semibold text-slate-600">Room Status</p>
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] text-slate-700 outline-none focus:border-[#0B4EA2]"
                    >
                      <option value="select">select</option>
                      <option value="Vacant Clean">Vacant Clean</option>
                      <option value="Vacant Dirty">Vacant Dirty</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[0.07em] text-slate-500">
                  Available Rooms For Selected Row ({filteredRooms.length})
                </p>
                {loadingAvailability ? (
                  <span className="flex items-center gap-1.5 text-[13px] text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredRooms.map((room) => {
                  const isSelected = activeRow ? selectedRoomIds[activeRow.reservationRoomId] === room.roomId : false
                  return (
                    <button
                      key={room.roomId}
                      type="button"
                      onClick={() => {
                        if (!activeRow) return
                        setSelectedRoomIds((prev) => ({ ...prev, [activeRow.reservationRoomId]: room.roomId }))
                      }}
                      className="relative flex h-[130px] flex-col justify-between rounded-xl border-2 p-4 text-left transition-all"
                      style={{
                        borderColor: isSelected ? '#1E3A8A' : '#A7F3D0',
                        backgroundColor: isSelected ? '#EFF6FF' : '#ECFDF5',
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[26px] font-bold leading-none text-slate-900">{room.roomNumber}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[12px] font-semibold text-emerald-600">Vacant Clean</span>
                        </div>
                      </div>
                      <div>
                        <p className="mb-0.5 text-[13px] text-slate-500">Floor {room.roomNumber.charAt(0)}</p>
                        <p className="text-[14px] text-slate-700">{room.roomTypeName || activeRow?.roomTypeName || 'Room'}</p>
                      </div>
                      {isSelected ? (
                        <div className="absolute bottom-3 right-3 grid h-6 w-6 place-items-center rounded-full bg-[#1E3A8A]">
                          <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      ) : null}
                    </button>
                  )
                })}

                {!loadingAvailability && filteredRooms.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-sm text-slate-400">
                    No available rooms match this required room row.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-8 py-4">
          <div className="text-sm font-semibold text-slate-500">
            {allRowsAssigned ? 'All required rooms are ready.' : `Assign ${requiredCount - assignedCount} more room${requiredCount - assignedCount === 1 ? '' : 's'} to continue.`}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isAssigning}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={!allRowsAssigned || !hasPendingChanges || isAssigning}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              style={{ backgroundColor: allRowsAssigned && hasPendingChanges && !isAssigning ? '#1E3A8A' : undefined }}
            >
              {isAssigning ? <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</> : 'Confirm Selection'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
