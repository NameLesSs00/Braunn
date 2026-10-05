import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { routes } from '../../../../shared/lib/routes'

interface PosHeaderProfileProps {
  name: string
  role: string
  theme?: 'light' | 'dark'
}

export function PosHeaderProfile({ name, role, theme = 'light' }: PosHeaderProfileProps) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (profileOpen && !profileRef.current?.contains(target)) setProfileOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [profileOpen])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    navigate(routes.root)
  }

  const isDark = theme === 'dark'

  return (
    <div className="relative" ref={profileRef}>
      <button
        type="button"
        className={[
          'flex items-center gap-3 rounded-xl px-3 py-2 transition-colors',
          isDark 
            ? (profileOpen ? 'bg-white/15' : 'hover:bg-white/10')
            : (profileOpen ? 'bg-[#EEF4FF]' : 'hover:bg-slate-50')
        ].join(' ')}
        onClick={() => setProfileOpen((v) => !v)}
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#DCEBFF]">
          <User className="h-5 w-5 fill-slate-950 text-slate-950" />
        </div>
        <div className="leading-tight text-left">
          <div className={['text-[13px] font-semibold', isDark ? 'text-white' : 'text-slate-800'].join(' ')}>{name}</div>
          <div className={['text-[11px]', isDark ? 'text-white/65' : 'text-slate-500'].join(' ')}>{role}</div>
        </div>
      </button>

      {profileOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 bg-[#EEF4FF] px-4 py-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200">
              <User className="h-5 w-5 fill-slate-500 text-slate-500" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-slate-800">{name}</div>
              <div className="text-[11px] text-slate-500">{role}</div>
            </div>
          </div>
          <div className="py-2">
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
  )
}
