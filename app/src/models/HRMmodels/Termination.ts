export interface TerminationCreateDto {
  employeeId: string;
  terminationDate: string;
  reason: string;
}

export interface TerminationReadDto {
  id: string;
  employeeId: string;
  employeeName: string;
  terminationDate: string;
  reason: string;
  createdAt: string;
}

export interface PaginatedTerminations {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  items: TerminationReadDto[];
}

export interface TerminationQueryParams {
  EmployeeId?: string;
  DateFrom?: string;
  DateTo?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
}
