export interface HkmReceptionAssignmentReadDto {
  id: number
  roomId: string
  employeeId: string
  note?: string
  createdAt: string
  createdBy: string
}

export interface HkmReceptionAssignmentCreateDto {
  roomId: string
  employeeId: string
  note?: string
}

export interface HkmReceptionAssignmentUpdateDto {
  roomId: string
  employeeId: string
  note?: string
}

export interface HkmReceptionAssignmentsListDto {
  items: HkmReceptionAssignmentReadDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface HkmReceptionAssignmentsParams {
  PageNumber?: number
  PageSize?: number
  RequestId?: number
  EmployeeId?: string
}
