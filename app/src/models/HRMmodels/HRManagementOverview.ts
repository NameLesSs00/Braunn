export interface DepartmentOverview {
  departmentName: string;
  employeeCount: number;
}

export interface HRMOverviewData {
  totalEmployees: number;
  employeesOnLeave: number;
  departments: DepartmentOverview[];
}

export interface HRMOverviewResponse {
  isSuccess: boolean;
  message: string;
  data: HRMOverviewData;
  errors: string[];
}

export interface ShiftOverview {
  shiftName: string;
  employeeCount: number;
}

export interface ShiftManagementOverviewData {
  activeEmployeesCount: number;
  shifts: ShiftOverview[];
}

export interface ShiftManagementOverviewResponse {
  isSuccess: boolean;
  message: string;
  data: ShiftManagementOverviewData;
  errors: string[];
}
