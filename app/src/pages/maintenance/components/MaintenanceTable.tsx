import { useState, useRef, useEffect, useCallback } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { PriorityBadge } from './PriorityBadge'
import { RequestStatusBadge } from './RequestStatusBadge'

export type MaintenanceStatus = 'Pending' | 'Assigned' | 'InProgress' | 'Completed'

export interface MaintenanceRequest {
  id: number | string
  location: string
  requestNo: string
  source: string
  roomNo: string
  itemName: string
  notes?: string
  priorityLevel: string
  status: MaintenanceStatus
}

interface ActionMenuItem {
  label: string
  action: () => void
  className?: string
}

type Props = {
  requests: MaintenanceRequest[]
  onAssign: (request: MaintenanceRequest) => void
  onView: (request: MaintenanceRequest) => void
  onStart?: (id: number | string) => void
  onComplete?: (id: number | string) => void
  onReassign?: (request: MaintenanceRequest) => void
}

// Fixed uniform grid columns across header and rows
const GRID_COL_TEMPLATE = 'grid-cols-[120px_120px_100px_100px_180px_160px_120px_100px_120px]'

export function MaintenanceTable({
  requests,
  onAssign,
  onView,
  onStart,
  onComplete,
  onReassign,
}: Props) {
  const [openMenuForId, setOpenMenuForId] = useState<number | string | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)

  const menuRef = useRef<HTMLDivElement | null>(null)
  const activeButtonRef = useRef<HTMLButtonElement | null>(null)

  // Handle outside click, scroll, resize, and Escape key
  useEffect(() => {
    if (openMenuForId === null) return

    const handleMouseDown = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        activeButtonRef.current &&
        !activeButtonRef.current.contains(e.target as Node)
      ) {
        setOpenMenuForId(null)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuForId(null)
    }

    const handleClose = () => setOpenMenuForId(null)

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleClose, true)
    window.addEventListener('resize', handleClose)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
    }
  }, [openMenuForId])

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number | string) => {
    e.stopPropagation()
    if (openMenuForId === id) {
      setOpenMenuForId(null)
      setMenuPos(null)
      activeButtonRef.current = null
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      activeButtonRef.current = e.currentTarget

      // Compute fixed position so menu doesn't expand parent container bounds or add scrollbars
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      })
      setOpenMenuForId(id)
    }
  }

  const getMenuItems = useCallback(
    (request: MaintenanceRequest): ActionMenuItem[] => {
      const items: ActionMenuItem[] = []

      if (request.status === 'Pending') {
        items.push({ label: 'Assign', action: () => onAssign(request), className: 'text-slate-700' })
        items.push({ label: 'Details', action: () => onView(request), className: 'text-slate-700' })
      } else if (request.status === 'Assigned') {
        items.push({ label: 'Start', action: () => onStart?.(request.id), className: 'text-slate-700' })
        items.push({ label: 'Reassign', action: () => onReassign?.(request), className: 'text-slate-700' })
        items.push({ label: 'Details', action: () => onView(request), className: 'text-slate-700' })
      } else if (request.status === 'InProgress') {
        items.push({ label: 'Complete', action: () => onComplete?.(request.id), className: 'text-slate-700' })
        items.push({ label: 'Reassign', action: () => onReassign?.(request), className: 'text-slate-700' })
        items.push({ label: 'Details', action: () => onView(request), className: 'text-slate-700' })
      } else if (request.status === 'Completed') {
        items.push({ label: 'Details', action: () => onView(request), className: 'text-slate-700' })
      }

      return items
    },
    [onAssign, onView, onStart, onComplete, onReassign]
  )

  const activeRequest = requests.find((r) => r.id === openMenuForId)
  const activeMenuItems = activeRequest ? getMenuItems(activeRequest) : []

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div
          className={`grid ${GRID_COL_TEMPLATE} bg-[#EAF2FF] px-6 py-3 text-[12px] font-semibold text-slate-700`}
        >
          <div>Location</div>
          <div>Request No</div>
          <div>Source</div>
          <div>Room No</div>
          <div>Item Name</div>
          <div>Notes</div>
          <div>Priority</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Rows */}
        <div>
          {requests.map((request, idx) => {
            const isOpen = openMenuForId === request.id

            return (
              <div
                key={request.id}
                className={`grid ${GRID_COL_TEMPLATE} items-center px-6 py-4 text-[12px] text-slate-700 ${
                  idx % 2 === 1 ? 'bg-[#F4F9FF]' : 'bg-white'
                }`}
              >
                <div className="truncate" title={request.location}>
                  {request.location}
                </div>
                <div className="font-semibold text-slate-800">{request.requestNo}</div>
                <div>{request.source}</div>
                <div>{request.roomNo}</div>
                <div className="truncate" title={request.itemName}>
                  {request.itemName}
                </div>
                <div className="truncate" title={request.notes}>
                  {request.notes}
                </div>
                <div>
                  <PriorityBadge priority={request.priorityLevel} />
                </div>
                <div>
                  <RequestStatusBadge status={request.status} />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    className={`inline-flex h-7 w-9 items-center justify-center rounded-lg transition-colors ${
                      isOpen ? 'bg-slate-300 text-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    aria-label="More options"
                    onClick={(e) => handleToggleMenu(e, request.id)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Menu - Fixed Position prevents scrollbars and overflow clipping */}
      {openMenuForId !== null && menuPos && activeMenuItems.length > 0 && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPos.top}px`,
            right: `${menuPos.right}px`,
          }}
          className="z-50 w-28 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {activeMenuItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] hover:bg-slate-50 ${
                item.className || ''
              }`}
              onClick={() => {
                item.action()
                setOpenMenuForId(null)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}