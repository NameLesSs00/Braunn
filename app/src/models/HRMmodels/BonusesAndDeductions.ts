export interface BonusDeductionQueryParams {
  EmployeeId?: string;
  DateFrom?: string;
  DateTo?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface BonusDeductionReadDto {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  effectiveDate: string;
  reason: string;
  createdAt: string;
}

export interface BonusDeductionCreateDto {
  employeeId: string;
  amount: number;
  effectiveDate: string;
  reason: string;
}

export interface BonusDeductionUpdateDto {
  amount: number;
  effectiveDate: string;
  reason: string;
}

export interface PaginatedBonusDeduction {
  pageNumber: number;
  pageSize: number;
  items: BonusDeductionReadDto[];
  totalCount: number;
}
