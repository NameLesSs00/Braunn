import React, { useEffect, useRef, useState } from 'react'
import {
  Plus,
  Search,
  Calendar,
  RotateCcw,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Clock,
  FileText,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import { MaintenanceHeader } from '../../widgets/layout/MaintenanceHeader/MaintenanceHeader'
import { appAlert } from '../../shared/ui/AppAlert'
import { useAppDispatch, useAppSelector } from '../../shared/apis/hooks'
import {
  activatePreventiveMaintenancePlan,
  cancelPreventiveMaintenancePlan,
  completePreventiveMaintenanceRequest,
  createPreventiveMaintenancePlan,
  fetchPreventiveMaintenancePlans,
  fetchPreventiveMaintenanceRequests,
  startPreventiveMaintenanceRequest,
  updatePreventiveMaintenancePlan,
  assignPreventiveMaintenanceRequest,
  reassignPreventiveMaintenanceRequest,
} from '../../features/maintenance/preventiveMaintenanceSlice'
import type {
  PreventiveMaintenancePlan,
  PreventiveMaintenancePlanPayload,
  PreventiveMaintenanceRequest,
  PreventiveMaintenanceAssignPayload,
  PreventiveMaintenanceRequestPayload,
} from '../../models/PreventiveMaintenance'
import { maintenanceCategoriesApi } from '../../shared/apis/maintenanceCategoriesApi'
import { useOnPreventiveMaintenanceRequestCreated } from '../../hooks/useNotifications'

import { getMaintenanceItems } from '../../shared/apis/maintenanceItemsApi'
import { hrEmployeesApi } from '../../shared/HRMshared/api/hrEmployeesApi'
import type { MaintenanceCategory } from '../../models/MaintenanceCategory'
import type { MaintenanceItem } from '../../models/MaintenanceItem'
import type { HREmployeeReadDto } from '../../models/HRMmodels/HREmployee'

const TABS = [
  { id: 'plans', label: 'Maintenance Plans' },
  { id: 'requests', label: 'Maintenance Requests' },
] as const

type TabId = (typeof TABS)[number]['id']

type CategoryOption = Pick<MaintenanceCategory, 'id' | 'name'>
type ItemOption = Pick<MaintenanceItem, 'id' | 'name' | 'categoryId' | 'categoryName'>
type EmployeeOption = Pick<HREmployeeReadDto, 'id' | 'fullName'>

type PlanFilters = {
  search: string
  itemId: string
  categoryId: string
  employeeId: string
  frequency: string
  status: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortDirection: string
}

type RequestFilters = {
  search: string
  status: string
  employeeId: string
  planId: string
  itemId: string
  scheduledDateFrom: string
  scheduledDateTo: string
  startedDateFrom: string
  startedDateTo: string
  completedDateFrom: string
  completedDateTo: string
  sortBy: string
  sortDirection: string
}

const defaultPlanFilters: PlanFilters = {
  search: '',
  itemId: '',
  categoryId: '',
  employeeId: '',
  frequency: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

const defaultRequestFilters: RequestFilters = {
  search: '',
  status: '',
  employeeId: '',
  planId: '',
  itemId: '',
  scheduledDateFrom: '',
  scheduledDateTo: '',
  startedDateFrom: '',
  startedDateTo: '',
  completedDateFrom: '',
  completedDateTo: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

const frequencyOptions = ['Weekly', 'Monthly', 'Yearly']
const planStatusOptions = ['Pending', 'Active', 'Paused', 'Cancelled']
const requestStatusOptions = ['Pending', 'Assigned', 'InProgress', 'Completed']

function formatDateValue(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB')
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-GB')
}

function toIsoDateTime(value: string) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

function getStatusBadgeClass(status?: string) {
  const normalized = (status || '').toLowerCase()
  if (normalized === 'active' || normalized === 'completed' || normalized === 'assigned' || normalized === 'inprogress') {
    return 'bg-emerald-50 text-emerald-700'
  }
  if (normalized === 'pending') {
    return 'bg-amber-50 text-amber-700'
  }
  if (normalized === 'paused' || normalized === 'cancelled' || normalized === 'in progress') {
    return 'bg-slate-100 text-slate-700'
  }
  return 'bg-slate-100 text-slate-700'
}

export function PreventiveMaintenancePageContent() {
  const dispatch = useAppDispatch()
  const {
    plans,
    plansTotalCount,
    plansPageSize,
    plansStatus,
    requests,
    requestsTotalCount,
    requestsPageSize,
    requestsStatus,
    creatingPlan,
    updatingPlan,
    activatingPlan,
    cancelingPlan,
    completingRequest,
    assigningRequest,
  } = useAppSelector((state) => state.preventiveMaintenance)

  const [activeTab, setActiveTab] = useState<TabId>('plans')
  const [planFilters, setPlanFilters] = useState<PlanFilters>(defaultPlanFilters)
  const [requestFilters, setRequestFilters] = useState<RequestFilters>(defaultRequestFilters)
  const [planPage, setPlanPage] = useState(1)
  const [requestPage, setRequestPage] = useState(1)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [items, setItems] = useState<ItemOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PreventiveMaintenancePlan | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<PreventiveMaintenanceRequest | null>(null)
  const [requestMenuId, setRequestMenuId] = useState<number | string | null>(null)
  const requestMenuRef = useRef<HTMLDivElement | null>(null)

  const activePlans = plans.filter((plan) => (plan.status || '').toLowerCase() === 'active').length
  const inactivePlans = plans.filter((plan) => (plan.status || '').toLowerCase() !== 'active').length
  const completedRequests = requests.filter((request) => (request.status || '').toLowerCase() === 'completed').length

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [categoryResult, itemResult, employeeResult] = await Promise.all([
          maintenanceCategoriesApi.getAll({ pageNumber: 1, pageSize: 100 }),
          getMaintenanceItems(),
          hrEmployeesApi.fetchEmployees({ PageNumber: 1, PageSize: 100 }),
        ])

        const categoryList = (categoryResult as { items?: MaintenanceCategory[] }).items ?? []
        const itemList = (itemResult as { items?: MaintenanceItem[] }).items ?? []
        const employeeList = (employeeResult as { items?: HREmployeeReadDto[] }).items ?? []

        setCategories(categoryList.map((category) => ({ id: category.id, name: category.name })))
        setItems(itemList.map((item) => ({ id: item.id, name: item.name, categoryId: item.categoryId, categoryName: item.categoryName })))
        setEmployees(employeeList.map((employee) => ({ id: employee.id, fullName: employee.fullName })))
      } catch (error) {
        appAlert.fire({ icon: 'error', title: 'Failed to load lookups', text: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    void fetchLookups()
  }, [])

  useEffect(() => {
    const params = {
      PageNumber: planPage,
      PageSize: plansPageSize,
      Search: planFilters.search || undefined,
      ItemId: planFilters.itemId || undefined,
      CategoryId: planFilters.categoryId || undefined,
      EmployeeId: planFilters.employeeId || undefined,
      Frequency: planFilters.frequency || undefined,
      Status: planFilters.status || undefined,
      DateFrom: planFilters.dateFrom || undefined,
      DateTo: planFilters.dateTo || undefined,
      SortBy: planFilters.sortBy || undefined,
      SortDirection: planFilters.sortDirection || undefined,
    }

    void dispatch(fetchPreventiveMaintenancePlans(params))
  }, [dispatch, planPage, plansPageSize, planFilters.search, planFilters.itemId, planFilters.categoryId, planFilters.employeeId, planFilters.frequency, planFilters.status, planFilters.dateFrom, planFilters.dateTo, planFilters.sortBy, planFilters.sortDirection])

  useEffect(() => {
    if (!requestMenuId) return

    const handleClickOutside = (event: MouseEvent) => {
      if (requestMenuRef.current && !requestMenuRef.current.contains(event.target as Node)) {
        setRequestMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [requestMenuId])

  useEffect(() => {
    const params = {
      PageNumber: requestPage,
      PageSize: requestsPageSize,
      Search: requestFilters.search || undefined,
      Status: requestFilters.status || undefined,
      EmployeeId: requestFilters.employeeId || undefined,
      PlanId: requestFilters.planId || undefined,
      ItemId: requestFilters.itemId || undefined,
      ScheduledDateFrom: requestFilters.scheduledDateFrom || undefined,
      ScheduledDateTo: requestFilters.scheduledDateTo || undefined,
      StartedDateFrom: requestFilters.startedDateFrom || undefined,
      StartedDateTo: requestFilters.startedDateTo || undefined,
      CompletedDateFrom: requestFilters.completedDateFrom || undefined,
      CompletedDateTo: requestFilters.completedDateTo || undefined,
      SortBy: requestFilters.sortBy || undefined,
      SortDirection: requestFilters.sortDirection || undefined,
    }

    void dispatch(fetchPreventiveMaintenanceRequests(params))
  }, [dispatch, requestPage, requestsPageSize, requestFilters.search, requestFilters.status, requestFilters.employeeId, requestFilters.planId, requestFilters.itemId, requestFilters.scheduledDateFrom, requestFilters.scheduledDateTo, requestFilters.startedDateFrom, requestFilters.startedDateTo, requestFilters.completedDateFrom, requestFilters.completedDateTo, requestFilters.sortBy, requestFilters.sortDirection])

  // Automatically refresh list on real-time SignalR PreventiveMaintenanceRequestCreated notification if open
  useOnPreventiveMaintenanceRequestCreated(() => {
    if (activeTab === 'requests') {
      const params = {
        PageNumber: requestPage,
        PageSize: requestsPageSize,
        Search: requestFilters.search || undefined,
        Status: requestFilters.status || undefined,
        EmployeeId: requestFilters.employeeId || undefined,
        PlanId: requestFilters.planId || undefined,
        ItemId: requestFilters.itemId || undefined,
        ScheduledDateFrom: requestFilters.scheduledDateFrom || undefined,
        ScheduledDateTo: requestFilters.scheduledDateTo || undefined,
        StartedDateFrom: requestFilters.startedDateFrom || undefined,
        StartedDateTo: requestFilters.startedDateTo || undefined,
        CompletedDateFrom: requestFilters.completedDateFrom || undefined,
        CompletedDateTo: requestFilters.completedDateTo || undefined,
        SortBy: requestFilters.sortBy || undefined,
        SortDirection: requestFilters.sortDirection || undefined,
      }
      void dispatch(fetchPreventiveMaintenanceRequests(params))
    }
  })


  const totalPlanPages = Math.max(1, Math.ceil(plansTotalCount / plansPageSize))
  const totalRequestPages = Math.max(1, Math.ceil(requestsTotalCount / requestsPageSize))

  const handleResetFilters = () => {
    setPlanFilters(defaultPlanFilters)
    setRequestFilters(defaultRequestFilters)
    setPlanPage(1)
    setRequestPage(1)
  }

  const handleOpenAddModal = () => {
    setSelectedPlan(null)
    setIsAddModalOpen(true)
  }

  const handleOpenEditModal = (plan: PreventiveMaintenancePlan) => {
    setSelectedPlan(plan)
    setIsEditModalOpen(true)
  }

  const handleOpenDetailsModal = (request: PreventiveMaintenanceRequest) => {
    setSelectedRequest(request)
    setIsDetailsModalOpen(true)
  }

  const handleOpenCompleteModal = (request: PreventiveMaintenanceRequest) => {
    setSelectedRequest(request)
    setIsCompleteModalOpen(true)
  }

  const handleOpenAssignModal = (request: PreventiveMaintenanceRequest) => {
    setSelectedRequest(request)
    setIsAssignModalOpen(true)
  }

  const handleCreatePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload: PreventiveMaintenancePlanPayload = {
      name: String(formData.get('name') || '').trim(),
      categoryId: String(formData.get('categoryId') || '') || undefined,
      itemId: String(formData.get('itemId') || '') || undefined,
      frequency: String(formData.get('frequency') || '') || undefined,
      estimatedDuration: String(formData.get('estimatedDuration') || '') || undefined,
      firstDueDate: formData.get('firstDueDate') ? toIsoDateTime(String(formData.get('firstDueDate'))) : undefined,
      employeeId: String(formData.get('employeeId') || '') || undefined,
      notes: String(formData.get('notes') || '') || undefined,
      isActive: formData.get('isActive') === 'on',
    }

    if (!payload.name || !payload.categoryId || !payload.itemId || !payload.frequency || !payload.firstDueDate) {
      appAlert.fire({ icon: 'warning', title: 'Please fill all required fields' })
      return
    }

    try {
      const createdPlan = await dispatch(createPreventiveMaintenancePlan({ payload })).unwrap()
      if (payload.isActive && createdPlan?.id) {
        await dispatch(activatePreventiveMaintenancePlan(createdPlan.id)).unwrap()
      }
      appAlert.fire({ icon: 'success', title: 'Plan created successfully' })
      setIsAddModalOpen(false)
      setPlanPage(1)
      void dispatch(fetchPreventiveMaintenancePlans({ PageNumber: 1, PageSize: plansPageSize }))
      void dispatch(fetchPreventiveMaintenanceRequests({ PageNumber: 1, PageSize: requestsPageSize }))
    } catch (error) {
      appAlert.fire({ icon: 'error', title: 'Failed to create plan', text: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleUpdatePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedPlan?.id) return
    const formData = new FormData(event.currentTarget)
    const payload: PreventiveMaintenancePlanPayload = {
      name: String(formData.get('name') || '').trim(),
      categoryId: String(formData.get('categoryId') || '') || undefined,
      itemId: String(formData.get('itemId') || '') || undefined,
      frequency: String(formData.get('frequency') || '') || undefined,
      estimatedDuration: String(formData.get('estimatedDuration') || '') || undefined,
      firstDueDate: formData.get('firstDueDate') ? toIsoDateTime(String(formData.get('firstDueDate'))) : undefined,
      employeeId: String(formData.get('employeeId') || '') || undefined,
      notes: String(formData.get('notes') || '') || undefined,
      isActive: formData.get('isActive') === 'on',
    }

    if (!payload.name || !payload.categoryId || !payload.itemId || !payload.frequency || !payload.firstDueDate) {
      appAlert.fire({ icon: 'warning', title: 'Please fill all required fields' })
      return
    }

    try {
      await dispatch(updatePreventiveMaintenancePlan({ id: selectedPlan.id, payload })).unwrap()
      appAlert.fire({ icon: 'success', title: 'Plan updated successfully' })
      setIsEditModalOpen(false)
      setSelectedPlan(null)
      void dispatch(fetchPreventiveMaintenancePlans({ PageNumber: planPage, PageSize: plansPageSize }))
    } catch (error) {
      appAlert.fire({ icon: 'error', title: 'Failed to update plan', text: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleActivatePlan = async (plan: PreventiveMaintenancePlan) => {
    if (!plan.id) return
    const result = await appAlert.fire({
      icon: 'question',
      title: 'Activate Maintenance Plan',
      text: `Are you sure you want to activate plan "${plan.name || ''}"?`,
      showConfirmButton: true,
      confirmButtonText: 'Yes, Activate',
    })
    if (!result.isConfirmed) return

    try {
      await dispatch(activatePreventiveMaintenancePlan(plan.id)).unwrap()
      appAlert.fire({ icon: 'success', title: 'Plan activated successfully' })
      void dispatch(fetchPreventiveMaintenancePlans({ PageNumber: planPage, PageSize: plansPageSize }))
    } catch (error) {
      appAlert.fire({ icon: 'error', title: 'Failed to activate plan', text: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleCancelPlan = async (plan: PreventiveMaintenancePlan) => {
    if (!plan.id) return
    const result = await appAlert.fire({
      icon: 'warning',
      title: 'Cancel Maintenance Plan',
      text: `Are you sure you want to cancel plan "${plan.name || ''}"?`,
      showConfirmButton: true,
      confirmButtonText: 'Yes, Cancel',
    })
    if (!result.isConfirmed) return

    try {
      await dispatch(cancelPreventiveMaintenancePlan(plan.id)).unwrap()
      appAlert.fire({ icon: 'success', title: 'Plan cancelled successfully' })
      void dispatch(fetchPreventiveMaintenancePlans({ PageNumber: planPage, PageSize: plansPageSize }))
    } catch (error) {
      appAlert.fire({ icon: 'error', title: 'Failed to cancel plan', text: error instanceof Error ? error.message : 'Unknown error' })
    }
  }


  const handleStartRequest = async (request: PreventiveMaintenanceRequest) => {
    if (!request.id) return
    const result = await appAlert.fire({
      icon: 'question',
      title: 'Start Maintenance Request',
      text: `Are you sure you want to start this maintenance request?`,
      showConfirmButton: true,
      confirmButtonText: 'Yes, Start',
    })
    if (!result.isConfirmed) return

    try {
      await dispatch(startPreventiveMaintenanceRequest(request.id)).unwrap()
      appAlert.fire({ icon: 'success', title: 'Request started successfully' })
      setRequestMenuId(null)
      void dispatch(fetchPreventiveMaintenanceRequests({ PageNumber: requestPage, PageSize: requestsPageSize }))
    } catch (error) {
      appAlert.fire({ icon: 'error', title: 'Failed to start request', text: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleCompleteRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedRequest?.id) return
    const formData = new FormData(event.currentTarget)
    const payload: PreventiveMaintenanceRequestPayload = {
      notes: String(formData.get('notes') || '').trim() || undefined,
    }

    try {
      await dispatch(completePreventiveMaintenanceRequest({ id: selectedRequest.id, payload })).unwrap()
      appAlert.fire({ icon: 'success', title: 'Request completed successfully' })
      setIsCompleteModalOpen(false)
      setSelectedRequest(null)
      void dispatch(fetchPreventiveMaintenanceRequests({ PageNumber: requestPage, PageSize: requestsPageSize }))
    } catch (error) {
      appAlert.fire({ icon: 'error', title: 'Failed to complete request', text: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const handleAssignRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedRequest?.id) return
    const formData = new FormData(event.currentTarget)
    const employeeId = String(formData.get('employeeId') || '').trim()
    const payload: PreventiveMaintenanceAssignPayload = { employeeId: employeeId || undefined }

    if (!payload.employeeId) {
      appAlert.fire({ icon: 'warning', title: 'Please select an employee' })
      return
    }

    try {
      if (selectedRequest.employeeId || selectedRequest.assignedEmployeeId) {
        await dispatch(reassignPreventiveMaintenanceRequest({ id: selectedRequest.id, payload })).unwrap()
      } else {
        await dispatch(assignPreventiveMaintenanceRequest({ id: selectedRequest.id, payload })).unwrap()
      }
      appAlert.fire({ icon: 'success', title: 'Assignment updated successfully' })
      setIsAssignModalOpen(false)
      setSelectedRequest(null)
      void dispatch(fetchPreventiveMaintenanceRequests({ PageNumber: requestPage, PageSize: requestsPageSize }))
    } catch (error) {
      appAlert.fire({ icon: 'error', title: 'Failed to update assignment', text: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const renderPagination = (currentPage: number, totalPages: number, totalItems: number, onPageChange: (page: number) => void, label: string) => {
    const start = totalItems === 0 ? 0 : (currentPage - 1) * plansPageSize + 1
    const end = Math.min(currentPage * plansPageSize, totalItems)
    const pages = [] as Array<number | string>
    if (totalPages <= 5) {
      for (let index = 1; index <= totalPages; index += 1) pages.push(index)
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage, '...', totalPages)
    }

    return (
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm md:flex-row">
        <div className="text-sm font-medium text-slate-500">
          Showing <span className="text-slate-800 font-semibold">{start}</span> to <span className="text-slate-800 font-semibold">{end}</span> of{' '}
          <span className="text-slate-800 font-semibold">{totalItems}</span> {label}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pages.map((pageNum, index) => {
            if (pageNum === '...') {
              return <span key={`dots-${index}`} className="px-2 text-slate-400">...</span>
            }
            const isActive = pageNum === currentPage
            return (
              <button key={`page-${pageNum}`} type="button" onClick={() => onPageChange(Number(pageNum))} className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${isActive ? 'border-[#0242A6] bg-[#0242A6] text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                {pageNum}
              </button>
            )
          })}
          <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <MaintenanceHeader NameMaintenance="Preventive Maintenance" />

      <div className="mx-auto max-w-[1600px] space-y-6 py-6">
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Preventive Maintenance</h1>
            <p className="mt-0.5 text-[14px] text-slate-500">Scheduled maintenance plans and requests</p>
          </div>
          <button type="button" onClick={handleOpenAddModal} className="inline-flex items-center gap-2 rounded-lg bg-[#0242A6] px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-800">
            <Plus className="h-5 w-5" />
            <span>New Maintenance Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-[#F8FAFC] p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><FileText className="h-6 w-6" /></div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-slate-900">{plansTotalCount}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Plans</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-[#EBF5FF] p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#0242A6]"><Calendar className="h-6 w-6" /></div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-slate-900">{activePlans}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Plans</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-[#F3F4F6] p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-700"><Clock className="h-6 w-6" /></div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-slate-900">{inactivePlans}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inactive Plans</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-[#ECFDF5] p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-[#047857]"><CheckCircle className="h-6 w-6" /></div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-[#047857]">{completedRequests}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</div>
            </div>
          </div>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm">
          {TABS.map((tab) => (
            <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setPlanPage(1); setRequestPage(1); setRequestMenuId(null) }} className={`border-b-2 px-6 py-4 text-sm font-semibold transition-all ${activeTab === tab.id ? 'border-[#00479F] text-[#00479F]' : 'border-transparent text-slate-600 hover:text-[#00479F]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-visible">
          <div className="border-b border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative w-full max-w-[280px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={activeTab === 'plans' ? planFilters.search : requestFilters.search} onChange={(event) => activeTab === 'plans' ? setPlanFilters((prev) => ({ ...prev, search: event.target.value })) : setRequestFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder={activeTab === 'plans' ? 'Search plans or assets...' : 'Search requests or assets...'} className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-sm outline-none focus:border-[#0242A6]" />
                </div>
                {activeTab === 'plans' ? (
                  <>
                    <div className="relative">
                      <select value={planFilters.categoryId} onChange={(event) => setPlanFilters((prev) => ({ ...prev, categoryId: event.target.value }))} className="h-10 min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="">Category: All</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select value={planFilters.itemId} onChange={(event) => setPlanFilters((prev) => ({ ...prev, itemId: event.target.value }))} className="h-10 min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="">Asset: All</option>
                        {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select value={planFilters.frequency} onChange={(event) => setPlanFilters((prev) => ({ ...prev, frequency: event.target.value }))} className="h-10 min-w-[120px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="">Frequency: All</option>
                        {frequencyOptions.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select value={planFilters.status} onChange={(event) => setPlanFilters((prev) => ({ ...prev, status: event.target.value }))} className="h-10 min-w-[120px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="">Status: All</option>
                        {planStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="date" value={planFilters.dateFrom} onChange={(event) => setPlanFilters((prev) => ({ ...prev, dateFrom: event.target.value }))} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                      <span className="text-slate-400">to</span>
                      <input type="date" value={planFilters.dateTo} onChange={(event) => setPlanFilters((prev) => ({ ...prev, dateTo: event.target.value }))} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                    </div>
                    <div className="relative">
                      <select value={`${planFilters.sortBy}:${planFilters.sortDirection}`} onChange={(event) => {
                        const [sortBy, sortDirection] = event.target.value.split(':')
                        setPlanFilters((prev) => ({ ...prev, sortBy, sortDirection }))
                      }} className="h-10 min-w-[160px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="createdAt:desc">Newest first</option>
                        <option value="createdAt:asc">Oldest first</option>
                        <option value="name:asc">Name A-Z</option>
                        <option value="name:desc">Name Z-A</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <select value={requestFilters.status} onChange={(event) => setRequestFilters((prev) => ({ ...prev, status: event.target.value }))} className="h-10 min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="">Status: All</option>
                        {requestStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select value={requestFilters.employeeId} onChange={(event) => setRequestFilters((prev) => ({ ...prev, employeeId: event.target.value }))} className="h-10 min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="">Employee: All</option>
                        {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="relative">
                      <select value={requestFilters.planId} onChange={(event) => setRequestFilters((prev) => ({ ...prev, planId: event.target.value }))} className="h-10 min-w-[120px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="">Plan: All</option>
                        {plans.map((plan) => <option key={plan.id} value={String(plan.id)}>{plan.name}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="date" value={requestFilters.scheduledDateFrom} onChange={(event) => setRequestFilters((prev) => ({ ...prev, scheduledDateFrom: event.target.value }))} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                      <span className="text-slate-400">to</span>
                      <input type="date" value={requestFilters.scheduledDateTo} onChange={(event) => setRequestFilters((prev) => ({ ...prev, scheduledDateTo: event.target.value }))} className="h-10 rounded-lg border border-slate-200 px-3 text-sm" />
                    </div>
                    <div className="relative">
                      <select value={`${requestFilters.sortBy}:${requestFilters.sortDirection}`} onChange={(event) => {
                        const [sortBy, sortDirection] = event.target.value.split(':')
                        setRequestFilters((prev) => ({ ...prev, sortBy, sortDirection }))
                      }} className="h-10 min-w-[160px] appearance-none rounded-lg border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-700 outline-none focus:border-[#0242A6]">
                        <option value="createdAt:desc">Newest first</option>
                        <option value="createdAt:asc">Oldest first</option>
                        <option value="scheduledDate:asc">Scheduled date</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </>
                )}
              </div>
              <button type="button" onClick={handleResetFilters} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {activeTab === 'plans' ? (
            <div className="w-full">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Plan Name</th>
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Frequency</th>
                    <th className="px-4 py-3 font-semibold">Next Due</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plansStatus === 'loading' ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400"><div className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading plans…</div></td></tr>
                  ) : plans.length > 0 ? plans.map((plan) => {
                    const planStatusStr = (plan.status || '').toLowerCase();
                    const isPlanActive = planStatusStr === 'active';
                    const isPlanCancelled = planStatusStr === 'cancelled';
                    return (
                    <tr key={plan.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-bold text-slate-900">{plan.name}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-700">{plan.itemName || plan.assetName || '-'}</div>
                        <div className="text-[12px] text-slate-400">{plan.itemId || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{plan.categoryName || '-'}</td>
                      <td className="px-4 py-3"><span className="inline-flex rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-semibold text-[#4F46E5]">{plan.frequency || '-'}</span></td>
                      <td className="px-4 py-3"><div className="font-medium text-slate-700">{formatDateValue(plan.nextMaintenanceDate)}</div><div className="text-[12px] text-slate-400">{plan.nextDueDate ? 'Next due' : '-'}</div></td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(plan.status)}`}>{plan.status || 'Pending'}</span></td>
                      <td className="px-4 py-3 text-slate-500">{formatDateValue(plan.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => handleOpenEditModal(plan)} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300" title="Edit"><Edit className="h-4 w-4" /></button>
                          
                          {isPlanActive ? (
                            <button type="button" disabled className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white opacity-60 cursor-not-allowed">Active</button>
                          ) : (
                            <button type="button" onClick={() => handleActivatePlan(plan)} disabled={activatingPlan || cancelingPlan || isPlanCancelled} className="rounded-lg bg-[#0242A6] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50">Activate</button>
                          )}
                          
                          {isPlanCancelled ? (
                            <button type="button" disabled className="rounded-lg bg-slate-400 px-3 py-1.5 text-xs font-semibold text-white opacity-60 cursor-not-allowed">Cancelled</button>
                          ) : (
                            <button type="button" onClick={() => handleCancelPlan(plan)} disabled={cancelingPlan || activatingPlan} className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50">Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}) : (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">No maintenance plans found matching filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full min-h-[200px]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Asset</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Frequency</th>
                    <th className="px-4 py-3 font-semibold">Scheduled</th>
                    <th className="px-4 py-3 font-semibold">Employee</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsStatus === 'loading' ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400"><div className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading requests…</div></td></tr>
                  ) : requests.length > 0 ? requests.map((request) => {
                    const reqStatus = (request.status || '').toLowerCase();
                    const isPending = reqStatus === 'pending';
                    const isAssigned = reqStatus === 'assigned';
                    const isInProgress = reqStatus === 'inprogress' || reqStatus === 'in progress';
                    const isCompleted = reqStatus === 'completed';
                    const isCancelled = reqStatus === 'cancelled';
                    return (
                    <tr key={request.id} className="relative border-t border-slate-100 transition hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{request.itemName || request.assetName || '-'}</div>
                        <div className="text-[12px] text-slate-400">{request.itemId || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{request.categoryName || '-'}</td>
                      <td className="px-4 py-3"><span className="inline-flex rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-semibold text-[#4F46E5]">{request.frequency || '-'}</span></td>
                      <td className="px-4 py-3"><div className="font-semibold text-slate-700">{formatDateValue(request.scheduledDate)}</div><div className="text-[12px] text-slate-400">{request.scheduledDate ? 'Scheduled' : '-'}</div></td>
                      <td className="px-4 py-3 font-medium text-slate-700">{request.employeeName || request.assignedEmployeeName || '-'}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(request.status)}`}>{request.status || 'Pending'}</span></td>
                      <td className="px-4 py-3 text-right">
                        <div ref={requestMenuId === request.id ? requestMenuRef : null} className=" flex items-center justify-end" onClick={(event) => event.stopPropagation()}>
                          <button type="button" onClick={() => setRequestMenuId((currentId) => (currentId === request.id ? null : request.id ?? null))} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-200" title="More actions">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {requestMenuId === request.id && (
                            <div className="absolute right-10 top-8 z-50 w-36 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                              <button type="button" onClick={() => { setRequestMenuId(null); handleOpenDetailsModal(request) }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50">Details</button>
                              {isPending && (
                                <button type="button" onClick={() => { setRequestMenuId(null); handleOpenAssignModal(request) }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50">Assign</button>
                              )}
                              {isAssigned && (
                                <button type="button" onClick={() => { setRequestMenuId(null); handleStartRequest(request) }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50">Start</button>
                              )}
                              {isInProgress && (
                                <button type="button" onClick={() => { setRequestMenuId(null); handleOpenCompleteModal(request) }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50">Complete</button>
                              )}
                              {!isPending && !isCompleted && (
                                <button type="button" onClick={() => { setRequestMenuId(null); handleOpenAssignModal(request) }} className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50">Reassign</button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}) : (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No maintenance requests found matching filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-gray-200 bg-white p-6">
            {activeTab === 'plans' ? renderPagination(planPage, totalPlanPages, plansTotalCount, setPlanPage, 'plans') : renderPagination(requestPage, totalRequestPages, requestsTotalCount, setRequestPage, 'requests')}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#0242A6] px-6 py-5 text-white">
              <div>
                <h3 className="text-lg font-bold">Create Preventive Maintenance Plan</h3>
                <p className="mt-0.5 text-xs text-blue-100">Add a new recurring maintenance plan</p>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-full p-1 text-white transition hover:bg-blue-800"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Name *</label>
                <input type="text" name="name" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Category *</label>
                  <select name="categoryId" required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0242A6]">
                    <option value="">Select category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Asset *</label>
                  <select name="itemId" required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0242A6]">
                    <option value="">Select asset</option>
                    {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Frequency *</label>
                  <select name="frequency" required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0242A6]">
                    {frequencyOptions.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Duration</label>
                  <input type="text" name="estimatedDuration" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">First Due Date *</label>
                  <input type="date" name="firstDueDate" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
                </div>
       
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Activate after creation</div>
                  <div className="text-xs text-slate-400">Send the activation call immediately after creating the plan</div>
                </div>
                <input type="checkbox" name="isActive" defaultChecked className="h-5 w-5 rounded border-slate-200 text-[#0242A6] focus:ring-[#0242A6]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Notes</label>
                <textarea name="notes" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={creatingPlan} className="inline-flex items-center gap-2 rounded-lg bg-[#0242A6] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50">
                  {creatingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#0242A6] px-6 py-5 text-white">
              <div>
                <h3 className="text-lg font-bold">Update Preventive Maintenance Plan</h3>
                <p className="mt-0.5 text-xs text-blue-100">Edit the selected maintenance plan</p>
              </div>
              <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedPlan(null) }} className="rounded-full p-1 text-white transition hover:bg-blue-800"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpdatePlan} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Name *</label>
                <input type="text" name="name" defaultValue={selectedPlan.name || ''} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Category *</label>
                  <select name="categoryId" required defaultValue={selectedPlan.categoryId || ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0242A6]">
                    <option value="">Select category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Asset *</label>
                  <select name="itemId" required defaultValue={selectedPlan.itemId || ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0242A6]">
                    <option value="">Select asset</option>
                    {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Frequency *</label>
                  <select name="frequency" required defaultValue={selectedPlan.frequency || ''} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0242A6]">
                    {frequencyOptions.map((frequency) => <option key={frequency} value={frequency}>{frequency}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Duration</label>
                  <input type="text" name="estimatedDuration" defaultValue={selectedPlan.estimatedDuration || ''} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">First Due Date *</label>
                  <input type="date" name="firstDueDate" required defaultValue={selectedPlan.firstDueDate ? selectedPlan.firstDueDate.split('T')[0] : ''} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
                </div>
             
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Active plan</div>
                  <div className="text-xs text-slate-400">Mark the plan as active</div>
                </div>
                <input type="checkbox" name="isActive" defaultChecked={(selectedPlan.status || '').toLowerCase() === 'active'} className="h-5 w-5 rounded border-slate-200 text-[#0242A6] focus:ring-[#0242A6]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Notes</label>
                <textarea name="notes" defaultValue={selectedPlan.notes || ''} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedPlan(null) }} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={updatingPlan} className="inline-flex items-center gap-2 rounded-lg bg-[#0242A6] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50">
                  {updatingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
              <div>
                <h3 className="text-[17px] font-bold text-slate-800">Maintenance Request Details</h3>
                <p className="text-xs text-slate-400">Request #{selectedRequest.id}</p>
              </div>
              <button type="button" onClick={() => { setIsDetailsModalOpen(false); setSelectedRequest(null) }} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:grid-cols-2">
                <div><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Asset</div><div className="mt-1 font-semibold text-slate-800">{selectedRequest.itemName || selectedRequest.assetName || '-'}</div></div>
                <div><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Category</div><div className="mt-1 font-semibold text-slate-800">{selectedRequest.categoryName || '-'}</div></div>
                <div><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Frequency</div><div className="mt-1 font-semibold text-slate-800">{selectedRequest.frequency || '-'}</div></div>
                <div><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</div><div className="mt-1"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(selectedRequest.status)}`}>{selectedRequest.status || '-'}</span></div></div>
                <div><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Scheduled Date</div><div className="mt-1 font-semibold text-slate-800">{formatDateTime(selectedRequest.scheduledDate)}</div></div>
                <div><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Employee</div><div className="mt-1 font-semibold text-slate-800">{selectedRequest.employeeName || selectedRequest.assignedEmployeeName || '-'}</div></div>
                <div className="sm:col-span-2"><div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Notes</div><div className="mt-1 text-sm text-slate-600">{selectedRequest.notes || 'No notes provided.'}</div></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button type="button" onClick={() => { setIsDetailsModalOpen(false); setSelectedRequest(null) }} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {isCompleteModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#0242A6] px-6 py-5 text-white">
              <div>
                <h3 className="text-lg font-bold">Complete Maintenance Request</h3>
                <p className="mt-0.5 text-xs text-blue-100">Add completion notes</p>
              </div>
              <button type="button" onClick={() => { setIsCompleteModalOpen(false); setSelectedRequest(null) }} className="rounded-full p-1 text-white transition hover:bg-blue-800"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCompleteRequest} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Notes</label>
                <textarea name="notes" rows={5} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0242A6]" />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => { setIsCompleteModalOpen(false); setSelectedRequest(null) }} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={completingRequest} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50">
                  {completingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAssignModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-[#0242A6] px-6 py-5 text-white">
              <div>
                <h3 className="text-lg font-bold">{selectedRequest.employeeId || selectedRequest.assignedEmployeeId ? 'Reassign Maintenance Request' : 'Assign Maintenance Request'}</h3>
                <p className="mt-0.5 text-xs text-blue-100">Select an employee</p>
              </div>
              <button type="button" onClick={() => { setIsAssignModalOpen(false); setSelectedRequest(null) }} className="rounded-full p-1 text-white transition hover:bg-blue-800"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAssignRequest} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Employee *</label>
                <select name="employeeId" required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0242A6]">
                  <option value="">Select employee</option>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => { setIsAssignModalOpen(false); setSelectedRequest(null) }} className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={assigningRequest} className="inline-flex items-center gap-2 rounded-lg bg-[#0242A6] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50">
                  {assigningRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {selectedRequest.employeeId || selectedRequest.assignedEmployeeId ? 'Reassign' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
