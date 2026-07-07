import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks'
import { Notification, removeNotification } from '../../../features/notifications/notificationsSlice'
import { IoPerson } from 'react-icons/io5'
import { FaBell } from 'react-icons/fa6'
import { IconImage } from '../../../shared/ui/IconImage'
import { ShiftCloseModal } from '../../../features/shiftClose'
import { ShiftStartModal } from '../../../features/shiftStart'
import { selectIsShiftActive } from '../../../features/shift/shiftSlice'

export function LaundryHeader() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const notifications = useAppSelector((state) => state.notifications.items)
  const isShiftActive = useAppSelector(selectIsShiftActive)

  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [shiftCloseOpen, setShiftCloseOpen] = useState(false)
  const [shiftStartOpen, setShiftStartOpen] = useState(false)

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
    dispatch(removeNotification(notification.id))
    setNotificationsOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    navigate(routes.login)
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-4">
        <h1 className="text-[22px] font-semibold text-slate-800">Overview</h1>

        <div className="flex items-center gap-4">
          {/* Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-white border border-slate-200 shadow-sm transition-colors hover:bg-slate-50"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((v) => !v)}
            >
              <IconImage src={FaBell} alt="Notifications" className="h-5 w-5 text-slate-500" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                  <div className="text-sm font-bold text-slate-800">Notifications</div>
                  {notifications.length > 0 && (
                    <div className="rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-bold text-[#0B4EA2]">
                      {notifications.length} NEW
                    </div>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full flex-col gap-1 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                          onClick={() => handleNotificationClick(item)}
                        >
                          <div className="text-[13px] font-medium text-slate-800">Notification</div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="text-sm text-slate-400">No notifications</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className={[
                'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors',
                profileOpen ? 'bg-[#EEF4FF]' : 'hover:bg-slate-50',
              ].join(' ')}
              onClick={() => setProfileOpen((v) => !v)}
            >
              <div className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-200">
                <IconImage src={IoPerson} alt="User" className="h-5 w-5" />
                {isShiftActive && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>
              <div className="leading-tight text-left">
                <div className="text-[13px] font-semibold text-slate-800">Name Housekeeping</div>
                <div className="text-[11px] text-slate-500">Morning Shift</div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center gap-2 bg-[#EEF4FF] px-4 py-3">
                  <div className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-200">
                    <IconImage src={IoPerson} alt="User" className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-800">Name Housekeeping</div>
                    <div className="text-[11px] text-slate-500">Morning Shift</div>
                  </div>
                </div>
                <div className="py-2">
                  <button type="button" className="w-full px-5 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50">
                    My profile
                  </button>
                  <div className="mx-4 my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    className={['w-full px-5 py-2 text-left text-[13px] transition-colors', isShiftActive ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-50'].join(' ')}
                    disabled={isShiftActive}
                    onClick={() => { setShiftStartOpen(true); setProfileOpen(false) }}
                  >
                    Start shift
                  </button>
                  <div className="mx-4 my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    className={['w-full px-5 py-2 text-left text-[13px] transition-colors', !isShiftActive ? 'cursor-not-allowed text-slate-300' : 'text-slate-700 hover:bg-slate-50'].join(' ')}
                    disabled={!isShiftActive}
                    onClick={() => { setShiftCloseOpen(true); setProfileOpen(false) }}
                  >
                    Close shift
                  </button>
                  <div className="mx-4 my-1 h-px bg-slate-100" />
                  <button
                    type="button"
                    className="w-full px-5 py-2 text-left text-[13px] text-rose-600 hover:bg-rose-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ShiftCloseModal open={shiftCloseOpen} onClose={() => setShiftCloseOpen(false)} />
      <ShiftStartModal open={shiftStartOpen} onClose={() => setShiftStartOpen(false)} />
    </>
  )
}
