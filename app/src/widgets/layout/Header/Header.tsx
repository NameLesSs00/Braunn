import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { useNewReservationModal } from '../../layout/DashboardLayout/NewReservationModalContext'
import { setDraft } from '../../../features/reservations/draftSlice'
import {
  Notification,
  removeGroupReservationDraftNotification,
  removeNotification,
  removeReservationDraftNotification,
} from '../../../features/notifications/notificationsSlice'
import { getSavedReservationDraft } from '../../../features/reservations/reservationDraftStorage'
import { getSavedGroupReservationDraft } from '../../../features/reservations/groupReservationDraftStorage'

import { IconImage } from '../../../shared/ui/IconImage'
import { ShiftCloseModal } from '../../../features/shiftClose'
import { ShiftStartModal } from '../../../features/shiftStart'
import { selectIsShiftActive } from '../../../features/shift/shiftSlice'
import { IoPerson } from "react-icons/io5";
import { FaBell } from "react-icons/fa6";

type Props = {
  title: string
  onAddReservationClick?: () => void
  onOpenGroupReservationDraft?: (draftId: string) => void
}

export function Header({ title, onAddReservationClick, onOpenGroupReservationDraft }: Props) {
  const dispatch = useAppDispatch()
  const { openNewReservation } = useNewReservationModal()
  const notifications = useAppSelector((state) => state.notifications.items)
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [shiftCloseOpen, setShiftCloseOpen] = useState(false)
  const [shiftStartOpen, setShiftStartOpen] = useState(false)

  const isShiftActive = useAppSelector(selectIsShiftActive)

  const profileRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (profileOpen && !profileRef.current?.contains(target)) setProfileOpen(false)
      if (notificationsOpen && !notificationsRef.current?.contains(target)) setNotificationsOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false)
        setNotificationsOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [profileOpen, notificationsOpen])

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'reservation_draft') {
      if (!notification.draftId) return

      const savedDraft = getSavedReservationDraft(notification.draftId)
      if (!savedDraft) {
        dispatch(removeReservationDraftNotification(notification.draftId))
        setNotificationsOpen(false)
        return
      }

      dispatch(setDraft(savedDraft.draft))
      openNewReservation({
        draftId: savedDraft.id,
        step: savedDraft.step,
        step4Page: savedDraft.step4Page,
      })
    } else if (notification.type === 'group_reservation_draft') {
      if (!notification.draftId) return

      const savedDraft = getSavedGroupReservationDraft(notification.draftId)
      if (!savedDraft) {
        dispatch(removeGroupReservationDraftNotification(notification.draftId))
        setNotificationsOpen(false)
        return
      }

      onOpenGroupReservationDraft?.(savedDraft.id)
    } else if (notification.type === 'shift_start') {
      setShiftStartOpen(true)
      dispatch(removeNotification(notification.id))
    } else if (notification.type === 'corporate_reservation_created') {
      dispatch(removeNotification(notification.id))
    }
    setNotificationsOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    navigate(routes.login)
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4 px-8 py-6">
        <h1 className="text-[22px] font-semibold text-slate-800">{title}</h1>

        <div className="flex items-center gap-5">
          {onAddReservationClick ? (
            <button
              type="button"
              onClick={onAddReservationClick}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#093d81] active:scale-95"
            >
              <span className="text-lg leading-none">+</span>
              Add Reservation
            </button>
          ) : null}

          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              className={[
                'relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm transition-colors',
                notificationsOpen ? 'bg-slate-50' : 'hover:bg-slate-50',
              ].join(' ')}
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((v) => !v)}
            >
              <IconImage src={FaBell} alt="Notifications" className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-[#F6F8FC]">
                  {notifications.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[350px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                  <div className="text-sm font-bold text-slate-800">Notifications</div>
                  {notifications.length > 0 && (
                    <div className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-bold text-[#0B4EA2]">
                      {notifications.length} NEW
                    </div>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full flex-col gap-1 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                          onClick={() => handleNotificationClick(item)}
                        >
                          {item.type === 'reservation_draft' ? (
                            <>
                              <div className="text-[13px] font-medium text-slate-800">
                                {item.isOptional ? 'you have a optional reservation under the name of ' : 'you have uncompleted reservation under the name of '}
                                <span className="font-bold text-[#0B4EA2]">
                                  {item.firstName} {item.surName}
                                </span>
                                {item.isOptional && '. would you like to complete it'}
                              </div>
                            </>
                          ) : item.type === 'group_reservation_draft' ? (
                            <div className="text-[13px] font-medium text-slate-800">
                              you have uncompleted group reservation
                              <span className="font-bold text-[#0B4EA2]">
                                {' '}
                                {item.groupName || item.contactName || 'Group'}
                              </span>
                            </div>
                          ) : item.type === 'corporate_reservation_created' ? (
                            <div className="text-[13px] font-medium text-slate-800">
                              Corporate reservation sent for{' '}
                              <span className="font-bold text-[#0B4EA2]">{item.guestName || 'Corporate guest'}</span>
                              {item.bookingReference ? (
                                <>
                                  {' '}with booking reference{' '}
                                  <span className="font-bold text-[#0B4EA2]">{item.bookingReference}</span>
                                </>
                              ) : null}
                              {typeof item.grandTotal === 'number' ? (
                                <>
                                  {' '}for{' '}
                                  <span className="font-bold text-[#0B4EA2]">
                                    {item.currency || ''} {item.grandTotal.toFixed(2)}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          ) : (
                            <div className="text-[13px] font-medium text-slate-800">
                              You must <span className="font-bold text-amber-600">start your shift</span> now to continue working.
                            </div>
                          )}
                          <div className="text-[11px] text-slate-500">
                            {new Date(item.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-slate-50 text-slate-300">
                        <IconImage src={FaBell} alt="No notifications" className="h-6 w-6 opacity-40 grayscale" />
                      </div>
                      <div className="text-sm font-medium text-slate-500">No uncompleted reservations</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className={[
                'flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors',
                profileOpen ? 'bg-[#EEF4FF]' : 'hover:bg-slate-50',
              ].join(' ')}
              onClick={() => setProfileOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-slate-200">
                <IconImage src={IoPerson} alt="User" className="h-6 w-6" />
                {isShiftActive && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#F6F8FC]" title="Shift Started" />
                )}
              </div>
              <div className="leading-tight text-left">
                <div className="text-[13px] font-semibold text-slate-800">Name receptionist</div>
                <div className="text-[11px] text-slate-500">Morning Shift</div>
              </div>
            </button>

            {profileOpen ? (
              <div
                className="absolute right-0 top-full z-50 mt-2 w-[250px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                role="menu"
              >
                <div className="flex items-center gap-2 bg-[#EEF4FF] px-4 py-3">
                  <div className="relative grid h-10 w-10 place-items-center rounded-full bg-slate-200">
                    <IconImage src={IoPerson} alt="User" className="h-6 w-6" />
                    {isShiftActive && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#EEF4FF]" title="Shift Started" />
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[13px] font-semibold text-slate-800">Name receptionist</div>
                    <div className="text-[11px] text-slate-500">example@gmail.com</div>
                  </div>
                </div>

                <div className="py-2">
                  <button type="button" className="w-full px-5 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50" role="menuitem">
                    My profile
                  </button>
                  <div className="mx-4 my-2 h-px bg-slate-200" />

                  <button type="button" className="w-full px-5 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50" role="menuitem">
                    setting
                  </button>
                  <div className="mx-4 my-2 h-px bg-slate-200" />

                  <button
                    type="button"
                    className={[
                      'w-full px-5 py-2 text-left text-[13px] transition-colors',
                      isShiftActive ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                    role="menuitem"
                    disabled={isShiftActive}
                    onClick={() => {
                      setShiftStartOpen(true)
                      setProfileOpen(false)
                    }}
                  >
                    start shift
                  </button>
                  <div className="mx-4 my-2 h-px bg-slate-200" />

                  <button
                    type="button"
                    className={[
                      'w-full px-5 py-2 text-left text-[13px] transition-colors',
                      !isShiftActive ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                    role="menuitem"
                    disabled={!isShiftActive}
                    onClick={() => {
                      setShiftCloseOpen(true)
                      setProfileOpen(false)
                    }}
                  >
                    shift close
                  </button>
                  <div className="mx-4 my-2 h-px bg-slate-200" />

                  <button type="button" className="w-full px-5 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50" role="menuitem">
                    Help & support
                  </button>
                  <div className="mx-4 my-2 h-px bg-slate-200" />

                  <button
                    type="button"
                    className="w-full px-5 py-2 text-left text-[13px] text-rose-600 hover:bg-rose-50"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <ShiftCloseModal open={shiftCloseOpen} onClose={() => setShiftCloseOpen(false)} />
      <ShiftStartModal open={shiftStartOpen} onClose={() => setShiftStartOpen(false)} />
    </>
  )
}
