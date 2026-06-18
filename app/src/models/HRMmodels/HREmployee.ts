export type EmployeeGender = 'male' | 'female';
export type EmployeeRole = 'Manager' | 'Employee';

export interface HREmployeeReadDto {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  annualLeaveEntitlement: number;
  nationality: string;
  bankAccountNumber: string;
  gender: EmployeeGender;
  imageUrl: string;
  role: EmployeeRole;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  status: string;
  joiningDate: string;
  basicSalary: number;
  isActive: boolean;
  userId: string | null;
  createdAt: string;
}

export interface HREmployeeCreateDto {
  employeeCode: string;
  fullName: string;
  email: string;
  annualLeaveEntitlement: number;
  nationality: string;
  bankAccountNumber: string;
  gender: EmployeeGender;
  role: EmployeeRole;
  departmentId: string;
  positionId: string;
  joiningDate: string;
  basicSalary: number;
  // If role is 'Employee', this field should be sent as an empty string.
  password?: string;
}

export interface HREmployeeUpdateDto {
  fullName: string;
  email: string;
  departmentId: string;
  annualLeaveEntitlement: number;
  positionId: string;
  status: string;
}

export interface SalaryUpdateDto {
  newSalary: number;
  effectiveDate: string;
  reason: string;
}

export interface HREmployeesQueryParams {
  DepartmentId?: string;
  PositionId?: string;
  Role?: EmployeeRole;
  Status?: string;
  JoiningDateFrom?: string;
  JoiningDateTo?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface PaginatedHREmployees {
  pageNumber: number;
  pageSize: number;
  items: HREmployeeReadDto[];
  totalCount: number;
}
