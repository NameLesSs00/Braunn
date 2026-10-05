import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../../shared/lib/routes'
import { useAppDispatch } from '../../../shared/apis/hooks'
import { IoPerson } from 'react-icons/io5'
import { FaBell } from 'react-icons/fa6'
import { IconImage } from '../../../shared/ui/IconImage'
import { ShiftCloseModal } from '../../../features/shiftClose'
import { ShiftStartModal } from '../../../features/shiftStart'

type Props = {
  title: string
}

export function GenericModuleHeader({ title }: Props) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [shiftCloseOpen, setShiftCloseOpen] = useState(false)
  const [shiftStartOpen, setShiftStartOpen] = useState(false)
  
  // Hardcoded for scaffolding, would normally come from Redux
  const isShiftActive = true 
  const notifications: any[] = []

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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    navigate(routes.root)
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-4">
        <h1 className="text-[22px] font-semibold text-slate-800">{title}</h1>

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
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="text-sm text-slate-400">No notifications</div>
                  </div>
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
                <div className="text-[13px] font-semibold text-slate-800">Admin</div>
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
                    <div className="text-[13px] font-semibold text-slate-800">Admin</div>
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
                    className="w-full px-5 py-2 text-left text-[13px] text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setProfileOpen(false)
                      navigate(routes.systems)
                    }}
                  >
                    Switch system
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
