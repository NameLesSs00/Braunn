export type MaintenanceSource = 'HK' | 'Reception' | 'Sys'

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical' | 'Emergency'

export type MaintenanceRequestImage = {
  id: number
  imageUrl: string
}


export type MaintenanceRequestListItem = {
  id: number
  location: string
  source: MaintenanceSource
  roomNo?: string
  itemName?: string
  notes?: string
  priorityLevel: PriorityLevel
  status: string
  createdAt: string
  requestNo?: string
}

export type MaintenanceRequestDetails = MaintenanceRequestListItem & {
  itemId?: number
  updatedAt?: string
  images: MaintenanceRequestImage[]
  currentAssignedEmployeeName?: string
  reassignHistory: ReassignHistoryItem[]
}

export type CreateMaintenanceRequest = {
  location: string
  source: MaintenanceSource
  roomId?: string
  itemId?: number
  priorityLevel: PriorityLevel
  notes?: string
}

export type AssignEmployeeRequest = {
  employeeId: string
}

export type ReassignEmployeeRequest = {
  newEmployeeId: string
}
export interface ReassignHistoryItem {
  id: number
  oldEmployeeId: string
  oldEmployeeName: string
  newEmployeeId: string
  newEmployeeName: string
  reassignedAt: string
}
export type PagedMaintenanceRequestsResponse = {
  items: MaintenanceRequestListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
