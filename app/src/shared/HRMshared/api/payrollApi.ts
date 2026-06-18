import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  HRPayrollReadDto,
  HRPayrollSnapshotReadDto,
  PayrollGenerateDto,
  PayrollQueryParams,
  PayrollSnapshotQueryParams,
  PaginatedPayroll,
  PaginatedPayrollSnapshots,
} from '../../../models/HRMmodels/Payroll';

const BASE_PATH = 'hr/HRPayroll';

export const payrollApi = {
  generatePayroll: async (payload: PayrollGenerateDto, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'POST',
      path: `${BASE_PATH}/generate`,
      body: payload,
      signal,
    });
    return unwrapApiResponse<void>(response);
  },

  reviewPayroll: async (id: string, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'PUT',
      path: `${BASE_PATH}/${id}/review`,
      signal,
    });
    return unwrapApiResponse<void>(response);
  },

  getPayrolls: async (params?: PayrollQueryParams, signal?: AbortSignal) => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.EmployeeId) searchParams.append('EmployeeId', params.EmployeeId);
      if (params.Month !== undefined) searchParams.append('Month', params.Month.toString());
      if (params.Year !== undefined) searchParams.append('Year', params.Year.toString());
      if (params.Status) searchParams.append('Status', params.Status);
      if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString());
      if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString());
      if (params.SearchTerm) searchParams.append('SearchTerm', params.SearchTerm);
      if (params.SortBy) searchParams.append('SortBy', params.SortBy);
      if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection);
      
      const qStr = searchParams.toString();
      if (qStr) query = `?${qStr}`;
    }

    const response = await apiRequest<unknown>({
      method: 'GET',
      path: `${BASE_PATH}${query}`,
      signal,
    });
    return unwrapApiResponse<PaginatedPayroll>(response);
  },

  getPayrollSnapshots: async (params?: PayrollSnapshotQueryParams, signal?: AbortSignal) => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.EmployeeId) searchParams.append('EmployeeId', params.EmployeeId);
      if (params.EmployeeName) searchParams.append('EmployeeName', params.EmployeeName);
      if (params.DepartmentId) searchParams.append('DepartmentId', params.DepartmentId);
      if (params.PositionId) searchParams.append('PositionId', params.PositionId);
      if (params.PayrollId) searchParams.append('PayrollId', params.PayrollId);
      if (params.Month !== undefined) searchParams.append('Month', params.Month.toString());
      if (params.Year !== undefined) searchParams.append('Year', params.Year.toString());
      if (params.MinNetSalary !== undefined) searchParams.append('MinNetSalary', params.MinNetSalary.toString());
      if (params.MaxNetSalary !== undefined) searchParams.append('MaxNetSalary', params.MaxNetSalary.toString());
      if (params.FromDate) searchParams.append('FromDate', params.FromDate);
      if (params.ToDate) searchParams.append('ToDate', params.ToDate);
      if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString());
      if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString());
      if (params.SearchTerm) searchParams.append('SearchTerm', params.SearchTerm);
      if (params.SortBy) searchParams.append('SortBy', params.SortBy);
      if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection);

      const qStr = searchParams.toString();
      if (qStr) query = `?${qStr}`;
    }

    const response = await apiRequest<unknown>({
      method: 'GET',
      path: `${BASE_PATH}/snapshots${query}`,
      signal,
    });
    return unwrapApiResponse<PaginatedPayrollSnapshots>(response);
  },

  getPayrollSnapshotById: async (id: string, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'GET',
      path: `${BASE_PATH}/snapshots/${id}`,
      signal,
    });
    return unwrapApiResponse<HRPayrollSnapshotReadDto>(response);
  },
};
