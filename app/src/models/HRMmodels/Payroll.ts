export type PayrollStatus = 'Draft' | 'Pending' | 'Reviewed' | 'Approved' | 'Paid' | 'Processed';
export type PaymentMethod = 'Cash' | 'BankTransfer';

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

export interface PayrollProcessRequestDto {
  payrollIds: string[];
  paymentMethod: PaymentMethod;
}

export interface PayrollProcessResultDto {
  payrollId: string;
  processingId: string;
  status: string;
  totalAmount: number;
}

export interface PayrollProcessResponseDto {
  processingBatchId: string;
  processedCount: number;
  payrolls: PayrollProcessResultDto[];
}

export interface PayrollProcessingReadDto {
  id: string;
  payrollId: string;
  payrollNumber: string;
  employeeName: string;
  processingBatchId: string;
  paymentMethod: PaymentMethod;
  bankTransferNo: string | null;
  amount: number;
  createdAt: string;
  createdBy: string;
}

export interface PayrollProcessingBatchReadDto {
  processingBatchId: string;
  createdAt: string;
  createdBy: string;
  paymentMethod: PaymentMethod;
  bankTransferNo: string | null;
  totalPayrolls: number;
  processedPayrolls: number;
  payrolls: PayrollProcessingReadDto[];
}

export interface PayrollProcessingQueryParams {
  PaymentMethod?: PaymentMethod;
  PayrollId?: string;
  ProcessingBatchId?: string;
  CreatedBy?: string;
  FromDate?: string;
  ToDate?: string;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface PaginatedPayrollProcessing {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  items: PayrollProcessingReadDto[];
}
