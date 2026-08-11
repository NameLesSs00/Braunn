import { useNavigate } from 'react-router-dom'
import {
  BedDouble,
  Hotel,
  LayoutDashboard,
  LogOut,
  Shirt,
  UsersRound,
  Utensils,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { routes } from '../../shared/lib/routes'
import { SystemTranslationBoundary } from './components/SystemTranslationBoundary'

type SystemOption = {
  title: string
  description: string
  route: string
  icon: LucideIcon
  tone: string
  iconTone: string
}

const systems: SystemOption[] = [
  {
    title: 'Property Management',
    description: 'Front office dashboard, reservations, guests, rooms, reports, and policies',
    route: routes.dashboard,
    icon: Hotel,
    tone: 'border-blue-100 hover:border-blue-300',
    iconTone: 'bg-blue-50 text-[#0B4EA2]',
  },
  {
    title: 'HRM',
    description: 'Employees, attendance, shifts, leave management, payroll, and settings',
    route: routes.hrm.dashboard,
    icon: UsersRound,
    tone: 'border-indigo-100 hover:border-indigo-300',
    iconTone: 'bg-indigo-50 text-indigo-700',
  },
  {
    title: 'Housekeeping',
    description: 'Room status, cleaning tasks, guest requests, lost and found, and inventory',
    route: routes.hk.dashboard,
    icon: BedDouble,
    tone: 'border-cyan-100 hover:border-cyan-300',
    iconTone: 'bg-cyan-50 text-cyan-700',
  },
  {
    title: 'Maintenance',
    description: 'Requests, work orders, preventive maintenance, assets, and inventory',
    route: routes.maintenance.dashboard,
    icon: Wrench,
    tone: 'border-amber-100 hover:border-amber-300',
    iconTone: 'bg-amber-50 text-amber-700',
  },
  {
    title: 'Laundry',
    description: 'Overview, room requests, laundry inventory, and system settings',
    route: routes.laundry.overview,
    icon: Shirt,
    tone: 'border-violet-100 hover:border-violet-300',
    iconTone: 'bg-violet-50 text-violet-700',
  },
  {
    title: 'Restaurant POS',
    description: 'Menu ordering, live orders, table reservations, guest meals, and kitchen views',
    route: routes.pos.menu,
    icon: Utensils,
    tone: 'border-rose-100 hover:border-rose-300',
    iconTone: 'bg-rose-50 text-rose-700',
  },
]

export function SystemSelectionPage() {
  const navigate = useNavigate()

  return (
    <SystemTranslationBoundary>
      <div className="min-h-screen bg-[#F6F8FC] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <main className="mx-auto flex min-h-[calc(100vh-48px)] max-w-5xl items-center justify-center">
          <section className="w-full overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-2xl shadow-slate-300/40">
            <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-4">
                <img src="/assets/Asset 9 1.svg" alt="Braun" className="h-11 w-auto" />
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <h1 className="text-2xl font-bold text-[#004bb4]">Select System</h1>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Choose the system you want to view and continue your work.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                onClick={() => {
                  localStorage.removeItem('isAuthenticated')
                  localStorage.removeItem('user')
                  localStorage.removeItem('access_token')
                  navigate(routes.root)
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>

            <div className="bg-slate-50/60 px-6 py-8 sm:px-8">
              <div className="mx-auto mb-7 grid h-14 w-14 place-items-center rounded-full bg-[#EEF4FF] text-[#0B4EA2]">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {systems.map((system) => {
                    const Icon = system.icon

                    return (
                      <button
                        key={system.title}
                        type="button"
                        className={[
                          'group flex min-h-[190px] flex-col items-center justify-center rounded-2xl border bg-white p-6 text-center shadow-sm transition-all',
                          'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70 focus:outline-none focus:ring-2 focus:ring-[#0B4EA2]/20',
                          system.tone,
                        ].join(' ')}
                        onClick={() => navigate(system.route)}
                      >
                        <span className={['mb-4 grid h-16 w-16 place-items-center rounded-full transition-transform group-hover:scale-110', system.iconTone].join(' ')}>
                          <Icon className="h-8 w-8" />
                        </span>
                        <span className="text-lg font-bold text-slate-800">{system.title}</span>
                        <span className="mt-2 max-w-[210px] text-xs leading-5 text-slate-500">{system.description}</span>
                      </button>
                    )
                  })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </SystemTranslationBoundary>
  )
}
