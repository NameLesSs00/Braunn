export interface PreventiveMaintenancePlan {
  id?: number | string
  name?: string
  categoryId?: number | string
  categoryName?: string
  itemId?: number | string
  assetId?: number | string
  assetName?: string
  itemName?: string
  frequency?: string
  estimatedDuration?: string | number
  firstDueDate?: string
  notes?: string
  isActive?: boolean
  status?: string
  createdAt?: string
  updatedAt?: string
  nextMaintenanceDate?: string
  lastRunDate?: string
  employeeId?: number | string
  employeeName?: string
}

export interface PreventiveMaintenancePlanListResponse {
  items: PreventiveMaintenancePlan[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages?: number
}

export interface PreventiveMaintenanceRequest {
  id?: number | string
  planId?: number | string
  planName?: string
  itemId?: number | string
  itemName?: string
  assetName?: string
  categoryName?: string
  frequency?: string
  estimatedDuration?: string | number
  scheduledDate?: string
  startedDate?: string
  completedDate?: string
  employeeId?: number | string
  employeeName?: string
  assignedEmployeeId?: number | string
  assignedEmployeeName?: string
  status?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface PreventiveMaintenanceRequestListResponse {
  items: PreventiveMaintenanceRequest[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages?: number
}

export interface PreventiveMaintenancePlanPayload {
  name: string
  categoryId?: number | string
  itemId?: number | string
  frequency?: string
  estimatedDuration?: string | number
  firstDueDate?: string
  employeeId?: number | string
  notes?: string
  isActive?: boolean
}

export interface PreventiveMaintenanceRequestPayload {
  notes?: string
}

export interface PreventiveMaintenanceAssignPayload {
  employeeId?: number | string
}
