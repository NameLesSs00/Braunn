export type PayrollStatus = 'Pending' | 'Reviewed' | 'Approved' | 'Paid';

export interface HRPayrollReadDto {
  id: string;
  employeeId: string;
  employeeName: string;
  year: number;
  month: number;
  basicSalary: number;
  totalBonuses: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  createdAt: string;
  snapshots: unknown[];
}

export interface HRPayrollSnapshotReadDto {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  email: string;
  departmentName: string;
  positionName: string;
  basicSalary: number;
  totalBonuses: number;
  totalDeductions: number;
  advanceTotal: number;
  netSalary: number;
  advanceDetailsJson: string | null;
  month: number;
  year: number;
  snapshotDate: string;
}

export interface PayrollGenerateDto {
  year: number;
  month: number;
}

export interface PayrollQueryParams {
  EmployeeId?: string;
  Month?: number;
  Year?: number;
  Status?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface PayrollSnapshotQueryParams {
  EmployeeId?: string;
  EmployeeName?: string;
  DepartmentId?: string;
  PositionId?: string;
  PayrollId?: string;
  Month?: number;
  Year?: number;
  MinNetSalary?: number;
  MaxNetSalary?: number;
  FromDate?: string;
  ToDate?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface PaginatedPayroll {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  items: HRPayrollReadDto[];
}

export interface PaginatedPayrollSnapshots {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  items: HRPayrollSnapshotReadDto[];
}
