export interface ShiftAssignmentQueryParams {
  EmployeeId?: string;
  ShiftId?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface ShiftAssignmentReadDto {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftId: string;
  shiftName: string;
  from: string;
  to: string;
  reason: string;
}

export interface ShiftAssignmentCreateDto {
  employeeIds: string[];
  shiftId: string;
  from: string;
  to: string;
  reason: string;
}

export interface ShiftAssignmentUpdateDto {
  shiftId: string;
  from: string;
  to: string;
  reason: string;
}

export interface PaginatedShiftAssignment {
  pageNumber: number;
  pageSize: number;
  items: ShiftAssignmentReadDto[];
  totalCount: number;
}
