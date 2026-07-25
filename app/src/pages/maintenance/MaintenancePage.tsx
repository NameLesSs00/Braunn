import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { routes } from '../../shared/lib/routes'
import { useAppDispatch } from '../../store/hooks'
import { fetchMaintenanceRequests, assignEmployee, reassignEmployee, startMaintenanceRequest, completeMaintenanceRequest } from '../../features/maintenance/maintenanceRequestsSlice'
import { hrEmployeesApi } from '../../shared/HRMshared/api/hrEmployeesApi'
import { appAlert } from '../../shared/ui/AppAlert'
import type { RootState } from '../../store/store'
import type { MaintenanceRequestListItem } from '../../models/MaintenanceRequest'
import { SearchBar } from './components/SearchBar'
import { FilterBar } from './components/FilterBar'
import { MaintenanceTable } from './components/MaintenanceTable'
import { MaintenanceCard } from './components/MaintenanceCard'
import { EmployeeAssignModal } from './components/EmployeeAssignModal'
import { Pagination } from './components/Pagination'
import { MaintenanceHeader } from '../../widgets/layout/MaintenanceHeader/MaintenanceHeader'

const PAGE_SIZE = 4

export function MaintenancePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [assigningRequest, setAssigningRequest] = useState<MaintenanceRequestListItem | null>(null)
  const [assignMode, setAssignMode] = useState<'assign' | 'reassign'>('assign')
  const [employees, setEmployees] = useState<{ id: string; fullName: string }[]>([])

  const dispatch = useAppDispatch()
  const requests = useSelector((s: RootState) => s.maintenanceRequests.list ?? [])
  const totalCount = useSelector((s: RootState) => s.maintenanceRequests.totalCount ?? 0)

  const refreshRequests = () => {
    dispatch(fetchMaintenanceRequests({
      search: search || undefined,
      type: category !== 'all' ? category : undefined,
      priority: priority !== 'all' ? priority : undefined,
      status: status !== 'all' ? status : undefined,
      pageNumber: page,
      pageSize: PAGE_SIZE,
    }))
  }

  useEffect(() => {
    refreshRequests()
  }, [dispatch, search, page, category, priority, status])

  useEffect(() => {
    // load employees for assign modal (first page)
    let mounted = true
    ;(async () => {
      try {
        const res: any = await hrEmployeesApi.fetchEmployees({ PageSize: 50 })
        if (!mounted) return
        const list = (res?.items ?? []).map((e: any) => ({ id: e.id, fullName: e.fullName }))
        setEmployees(list)
      } catch (err) {
        // ignore employee load errors silently
      }
    })()
    return () => { mounted = false }
  }, [])

  const totalPages = Math.max(1, Math.ceil((totalCount || requests.length) / PAGE_SIZE))
  const paginatedRequests = Array.isArray(requests) ? requests : []

  const handleOpenAssign = (request: MaintenanceRequestListItem) => {
    setAssignMode('assign')
    setAssigningRequest(request)
  }

  const handleOpenReassign = (request: MaintenanceRequestListItem) => {
    setAssignMode('reassign')
    setAssigningRequest(request)
  }

  const handleAssign = async (employeeId: string) => {
    if (!assigningRequest) return

    try {
      if (assignMode === 'reassign') {
        await dispatch(reassignEmployee({ id: assigningRequest.id, newEmployeeId: employeeId })).unwrap()
        appAlert.fire({ icon: 'success', title: 'Employee reassigned successfully' })
      } else {
        await dispatch(assignEmployee({ id: assigningRequest.id, employeeId })).unwrap()
        appAlert.fire({ icon: 'success', title: 'Employee assigned successfully' })
      }
      refreshRequests()
      setAssigningRequest(null)
    } catch (e: any) {
      appAlert.fire({ icon: 'error', title: 'Failed to assign employee', text: e?.message || 'Unknown error' })
    }
  }

  const handleStart = async (id: number | string) => {
    try {
      await dispatch(startMaintenanceRequest(id)).unwrap()
      refreshRequests()
    } catch (e: any) {
      appAlert.fire({ icon: 'error', title: 'Failed to start request', text: e?.message || 'Unknown error' })
    }
  }

  const handleComplete = async (id: number | string) => {
    try {
      await dispatch(completeMaintenanceRequest(id)).unwrap()
      refreshRequests()
    } catch (e: any) {
      appAlert.fire({ icon: 'error', title: 'Failed to complete request', text: e?.message || 'Unknown error' })
    }
  }

  return (
    <>    <MaintenanceHeader NameMaintenance="Maintenance Request" />

      <div className="space-y-6 py-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Maintenance Requests</h1>
            <p className="text-sm text-slate-500">Track repair issues and assign team members for service.</p>
          </div>
             <button type="button" onClick={() => navigate(routes.maintenance.newRequest)} className="inline-flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />
            New Request 
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchBar value={search} onChange={(value) => { setSearch(value); setPage(1) }} />
          <FilterBar
            category={category}
            onCategoryChange={(value) => { setCategory(value); setPage(1) }}
            priority={priority}
            onPriorityChange={(value) => { setPriority(value); setPage(1) }}
            status={status}
            onStatusChange={(value) => { setStatus(value); setPage(1) }}
          />
        </div>
      </div>

      <div className="hidden xl:block">
        <MaintenanceTable
          requests={paginatedRequests}
          onAssign={handleOpenAssign as any}
          onReassign={handleOpenReassign as any}
          onView={(request) => navigate(`${routes.maintenance.requests}/${request.id}`)}
          onStart={handleStart}
          onComplete={handleComplete}
        />
      </div>

      <div className="grid gap-4 xl:hidden">
        {paginatedRequests.map((request) => (
          <MaintenanceCard
            key={request.id}
            request={request}
            onAssign={handleOpenAssign}
            onView={() => navigate(`${routes.maintenance.requests}/${request.id}`)}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={(value) => setPage(value)} />

      <EmployeeAssignModal
        open={Boolean(assigningRequest)}
        request={assigningRequest}
        employees={employees}
        mode={assignMode}
        onClose={() => setAssigningRequest(null)}
        onAssign={handleAssign}
      />
    </div>
    </>
  
  )
}
