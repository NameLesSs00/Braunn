import { Check, ChevronDown, ChevronUp, Clock3, Hammer, Wrench } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../shared/lib/routes'

const workOrders = [
  {
    code: 'WO-2024-001',
    title: 'AC Repair - Room 301',
    description: 'Replace refrigerant and repair AC unit in room 301.',
    status: 'In Progress',
    statusTone: 'orange',
    priority: 'High',
    priorityTone: 'yellow',
    personnel: 'Ahmed Al-Rashidi, James Kofi',
    due: 'Due: Jun 9, 12:00 PM',
    accent: 'yellow',
    expanded: false,
    labor: '$275',
    parts: '$850',
    estHours: '6h',
    actualHours: '5.5',
  },
  {
    code: 'WO-2024-002',
    title: 'Emergency Elevator Rescue',
    description: 'Emergency rescue and repair of stuck elevator between 3F and 4F.',
    status: 'In Progress',
    statusTone: 'orange',
    priority: 'Emergency',
    priorityTone: 'darkRed',
    personnel: 'Ahmed Al-Rashidi, James Kofi, David Smith',
    due: 'Due: Jun 9, 12:00 PM',
    accent: 'red',
    expanded: true,
    labor: '$275',
    parts: '$850',
    estHours: '6h',
    actualHours: '5.5',
  },
]

export function WorkOrderDashboardPage() {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState('WO-2024-002')

  return (
    <div className="space-y-6 py-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(routes.maintenance.dashboard)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50">
            <ChevronDown className="h-4 w-4 rotate-90" />
          </button>
          <div>
            <h1 className="text-[28px] font-semibold text-slate-800">Work Orders</h1>
            <p className="text-sm text-slate-500">4 work orders · 2 in progress</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#EAF2FF] text-[#0B4EA2]">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[20px] font-bold text-slate-800">4</div>
              <div className="text-sm text-slate-500">Total Orders</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFF2E8] text-[#D97706]">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[20px] font-bold text-slate-800">2</div>
              <div className="text-sm text-slate-500">In Progress</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {workOrders.map((item) => {
          const isExpanded = expandedId === item.code
          return (
            <div key={item.code} className="rounded-2xl bg-white shadow-sm">
              <button type="button" onClick={() => setExpandedId(isExpanded ? '' : item.code)} className="flex w-full items-start gap-4 px-5 py-4 text-left">
                <div className={['grid h-12 w-12 shrink-0 place-items-center rounded-full', item.accent === 'red' ? 'bg-[#F7D6DA] text-[#9F0712]' : 'bg-[#FEECCB] text-[#D97706]'].join(' ')}>
                  <Wrench className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-semibold text-slate-500">{item.code}</span>
                    <span className={['rounded-full px-2.5 py-1 font-semibold', item.statusTone === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'].join(' ')}>{item.status}</span>
                    <span className={['rounded-full px-2.5 py-1 font-semibold', item.priorityTone === 'darkRed' ? 'bg-[#F7D6DA] text-[#9F0712]' : 'bg-yellow-100 text-yellow-800'].join(' ')}>{item.priority}</span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-800">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.description}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span>Assigned personnel: {item.personnel}</span>
                    <span>{item.due}</span>
                  </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500">
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase text-slate-400">Labor Cost</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{item.labor}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase text-slate-400">Parts Cost</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{item.parts}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase text-slate-400">Est. Hours</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{item.estHours}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[11px] font-semibold uppercase text-slate-400">Actual Hours</div>
                      <div className="mt-1 text-sm font-semibold text-slate-800">{item.actualHours}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2 text-sm font-semibold text-white">
                      <Check className="h-4 w-4" />
                      Mark Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
