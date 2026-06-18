export type LeaveType = 'Annual' | 'Sick' | 'Emergency' | 'Unpaid'
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'

export interface LeaveReadDto {
  id: string
  employeeId: string
  employeeName: string
  type: LeaveType
  status: LeaveStatus
  fromDate: string
  toDate: string
  reason: string
  createdAt: string
}

export interface LeaveCreateDto {
  employeeId: string
  type: LeaveType
  fromDate: string // ISO date-time
  toDate: string   // ISO date-time
  reason: string
}

export interface LeaveUpdateStatusDto {
  status: LeaveStatus
}

export interface LeavesQueryParams {
  EmployeeId?: string
  Status?: LeaveStatus
  LeaveType?: LeaveType
  DateFrom?: string
  DateTo?: string
  PageNumber?: number
  PageSize?: number
  SearchTerm?: string
  SortBy?: string
  SortDirection?: string
}

export interface PaginatedLeaves {
  pageNumber: number
  pageSize: number
  items: LeaveReadDto[]
  totalCount: number
}
