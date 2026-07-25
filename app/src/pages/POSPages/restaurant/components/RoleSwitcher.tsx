import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, ChefHat, CircleUserRound, ShieldCheck } from 'lucide-react'
import type { RestaurantRole } from '../data/restaurantPOSData'

type RoleSwitcherProps = {
  role: RestaurantRole
  onRoleChange: (role: RestaurantRole) => void
  adminPreview: RestaurantRole
  onAdminPreviewChange: (preview: RestaurantRole) => void
}

const roleOptions: Array<{
  value: RestaurantRole
  label: string
  helper: string
  icon: typeof BadgeCheck
}> = [
  { value: 'cashier', label: 'Cashier', helper: 'Order entry view', icon: CircleUserRound },
  { value: 'chef', label: 'Chef', helper: 'Kitchen board view', icon: ChefHat },
  { value: 'admin', label: 'Admin', helper: 'Admin dashboard', icon: ShieldCheck },
]

export function RoleSwitcher({ role, onRoleChange, adminPreview, onAdminPreviewChange }: RoleSwitcherProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target || panelRef.current?.contains(target)) return
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div ref={panelRef} className="fixed bottom-3 right-3 z-[80] flex items-end justify-end">
      {open ? (
        <div
          className="mb-7 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">Preview role</div>
            <div className="text-xs text-slate-500">Temporary until backend roles are ready</div>
          </div>
          <div className="p-2">
            {roleOptions.map((option) => {
              const Icon = option.icon
              const isSelected = option.value === role

              return (
                <button
                  key={option.value}
                  type="button"
                  className={[
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                    isSelected ? 'bg-[#EEF4FF] text-[#0B4EA2]' : 'text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                  onClick={() => {
                    onRoleChange(option.value)
                    if (option.value === 'admin') onAdminPreviewChange('admin')
                    setOpen(false)
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="block text-xs text-slate-500">{option.helper}</span>
                  </span>
                  {isSelected ? <BadgeCheck className="h-4 w-4 flex-shrink-0" /> : null}
                </button>
              )
            })}
          </div>
          {role === 'admin' ? (
            <div className="border-t border-slate-100 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin preview</div>
              <div className="grid grid-cols-3 rounded-full bg-slate-100 p-1">
                {(['admin', 'cashier', 'chef'] as const).map((preview) => (
                  <button
                    key={preview}
                    type="button"
                    className={[
                      'h-8 rounded-full text-xs font-semibold capitalize transition-colors',
                      adminPreview === preview ? 'bg-white text-[#0B4EA2] shadow-sm' : 'text-slate-500 hover:text-slate-800',
                    ].join(' ')}
                    onClick={() => onAdminPreviewChange(preview)}
                  >
                    {preview}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Open role switcher"
        title="Preview role"
        className={[
          'h-5 w-5 rounded-full border border-white/70 bg-[#0B4EA2] shadow-lg ring-2 ring-[#0B4EA2]/15 transition-all',
          open ? 'scale-110 opacity-100' : 'opacity-20 hover:scale-125 hover:opacity-100',
        ].join(' ')}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
      />
    </div>
  )
}
