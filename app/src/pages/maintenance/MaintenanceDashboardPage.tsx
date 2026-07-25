import { ChevronRight, Clock3, ClipboardList, Gauge, ShieldAlert, UserRoundPlus, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../shared/lib/routes';
import { MaintenanceHeader } from '../../widgets/layout/MaintenanceHeader/MaintenanceHeader';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMaintenanceItems, fetchLowStockItems } from '../../features/maintenance/maintenanceItemsSlice';
import { fetchMaintenanceRequests } from '../../features/maintenance/maintenanceRequestsSlice';
import { hrEmployeesApi } from '../../shared/HRMshared/api/hrEmployeesApi';
import { appAlert } from '../../shared/ui/AppAlert';

// Technician status will be rendered from fetched employees

function getStatusPillClass(tone: 'yellow' | 'green' | 'red' | 'darkRed' | 'blue' | 'orange' | 'purple') {
  const classes = {
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    darkRed: 'bg-[#F7D6DA] text-[#9F0712]',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-violet-100 text-violet-700',
  }

  return classes[tone]
}

function getPriorityTone(priority: string): keyof ReturnType<typeof getStatusPillClass> {
  const map: Record<string, keyof ReturnType<typeof getStatusPillClass>> = {
    Low: 'green',
    Medium: 'blue',
    High: 'yellow',
    Critical: 'red',
    Emergency: 'darkRed',
  };
  return (map[priority] ?? 'gray') as any;
}

function getStatusTone(status: string): keyof ReturnType<typeof getStatusPillClass> {
  const map: Record<string, keyof ReturnType<typeof getStatusPillClass>> = {
    New: 'purple',
    Pending: 'orange',
    "In Progress": 'blue',
    Assigned: 'yellow',
    Completed: 'green',
  };
  return (map[status] ?? 'gray') as any;
}

// Helper to get dot color class based on tone
function getDotClass(tone: string): string {
  const classes: Record<string, string> = {
    gray: 'bg-gray-400',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    purple: 'bg-violet-500',
  };
  return classes[tone] ?? classes.gray;
}



export function MaintenanceDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items = [], lowStockItems = [] } = useAppSelector((state) => state.maintenanceItems);
  const { list: requests = [] } = useAppSelector((state) => state.maintenanceRequests);
  const [employees, setEmployees] = useState<{ id: string; fullName: string }[]>([]);

  useEffect(() => {
    dispatch(fetchMaintenanceItems());
    dispatch(fetchMaintenanceRequests());
    dispatch(fetchLowStockItems());
    (async () => {
      try {
        const res: any = await hrEmployeesApi.fetchEmployees({
          DepartmentId: '587160b2-eed8-4fdf-ba7d-4531885aa0f7',
          PageSize: 50,
        });
        const list = (res?.items ?? []).map((e: any) => ({ id: e.id, fullName: e.fullName }));
        setEmployees(list);
      } catch (e: any) {
        appAlert.fire({ icon: 'error', title: 'Failed to load employees', text: e?.message });
      }
    })();
  }, [dispatch]);

  return (
   
    <div className="space-y-6 py-6">
        <MaintenanceHeader NameMaintenance="Maintenance Dashboard" />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-semibold text-slate-800">Maintenance Dashboard</h1>
          <p className="text-sm text-slate-500">Track service requests, technician load, and urgent issues in one place.</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#EAF2FF] text-[#0B4EA2]">
              <UserRoundPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[20px] font-bold text-slate-800">{items.filter(i => i.type === 'Product').length}</div>
              <div className="text-sm text-slate-500">Total Items</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0B4EA2] p-5 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
                <div className="text-[20px] font-bold">{requests.filter(r => r.status === 'Pending').length}</div>
               <div className="text-sm text-white/80">Pending Requests</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#FDEAEA] text-[#9F0712]">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
               <div className="text-[20px] font-bold text-slate-800">{items.filter(i => i.status === 'OutStock').length}</div>
               <div className="text-sm text-slate-500">Out of Stock</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#124177] p-5 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
               <div className="text-[20px] font-bold">{lowStockItems.length}</div>
               <div className="text-sm text-white/80">Low Stock</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Recent Requests</h2>
            <button type="button" className="text-sm font-semibold text-[#0B4EA2]">View all &gt;</button>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 5).map((request) => (
              <button
                key={request.id}
                type="button"
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-left transition hover:border-[#0B4EA2] hover:bg-white"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={['rounded-full px-2.5 py-1 font-semibold', getStatusPillClass(getPriorityTone(request.priorityLevel))].join(' ')}>{request.priorityLevel}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-800">{request.requestNo}</div>
                <div className="mt-2 text-xs text-slate-600">Item Name : {request.itemName}</div>
                  <div className="mt-1 text-xs text-slate-500">Room No : {request.roomNo}</div>
                  <div className="mt-2 text-xs text-slate-600">Create At : {request.createdAt}</div>

                </div>

                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Technician Status</h2>
                <p className="text-xs text-slate-500">2 available now</p>
              </div>
              <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <Gauge className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {employees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
                    {emp.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-800">{emp.fullName}</div>
                    <div className="text-xs text-slate-500">0 active jobs</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className={['h-2.5 w-2.5 rounded-full', getDotClass('gray')].join(' ')} />
                    <Gauge className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate(routes.maintenance.newRequest)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A3F8B]"
              >
                <Wrench className="h-4 w-4" />
                New Maintenance Request
              </button>

           
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
