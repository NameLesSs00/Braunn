import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  HREmployeeReadDto,
  HREmployeeCreateDto,
  HREmployeeUpdateDto,
  SalaryUpdateDto,
  HREmployeesQueryParams,
  PaginatedHREmployees,
} from '../../../models/HRMmodels/HREmployee';

const BASE_PATH = 'hr/HREmployees';

export const hrEmployeesApi = {
  fetchEmployees: async (params?: HREmployeesQueryParams, signal?: AbortSignal) => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.DepartmentId) searchParams.append('DepartmentId', params.DepartmentId);
      if (params.PositionId) searchParams.append('PositionId', params.PositionId);
      if (params.Role) searchParams.append('Role', params.Role);
      if (params.Status) searchParams.append('Status', params.Status);
      if (params.JoiningDateFrom) searchParams.append('JoiningDateFrom', params.JoiningDateFrom);
      if (params.JoiningDateTo) searchParams.append('JoiningDateTo', params.JoiningDateTo);
      if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString());
      if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString());
      if (params.SearchTerm) searchParams.append('SearchTerm', params.SearchTerm);
      if (params.SortBy) searchParams.append('SortBy', params.SortBy);
      if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection);

      const qStr = searchParams.toString();
      if (qStr) {
        query = `?${qStr}`;
      }
    }

    const response = await apiRequest<PaginatedHREmployees>({ method: 'GET', path: `${BASE_PATH}${query}`, signal });
    return unwrapApiResponse(response);
  },

  fetchEmployeeById: async (id: string, signal?: AbortSignal) => {
    const response = await apiRequest<HREmployeeReadDto>({ method: 'GET', path: `${BASE_PATH}/${id}`, signal });
    return unwrapApiResponse(response);
  },

  createEmployee: async (payload: HREmployeeCreateDto, signal?: AbortSignal) => {
    // If role is Employee, ensure password is empty
    const sanitizedPayload = { ...payload };
    if (sanitizedPayload.role === 'Employee') {
      sanitizedPayload.password = '';
    }

    const response = await apiRequest<HREmployeeReadDto>({ method: 'POST', path: BASE_PATH, body: sanitizedPayload, signal });
    return unwrapApiResponse(response);
  },

  updateEmployee: async (id: string, payload: HREmployeeUpdateDto, signal?: AbortSignal) => {
    const response = await apiRequest<HREmployeeReadDto>({ method: 'PUT', path: `${BASE_PATH}/${id}`, body: payload, signal });
    return unwrapApiResponse(response);
  },

  deleteEmployee: async (id: string, signal?: AbortSignal) => {
    const response = await apiRequest<void>({ method: 'DELETE', path: `${BASE_PATH}/${id}`, signal });
    return unwrapApiResponse(response);
  },

  updateEmployeeSalary: async (id: string, payload: SalaryUpdateDto, signal?: AbortSignal) => {
    const response = await apiRequest<void>({ method: 'POST', path: `${BASE_PATH}/${id}/salary`, body: payload, signal });
    return unwrapApiResponse(response);
  },

  uploadEmployeeImage: async (employeeId: string, file: File, signal?: AbortSignal) => {
    // Since apiRequest defaults to application/json, we need to use a custom fetch for multipart/form-data
    // Note: apiRequest from apiClient.ts currently doesn't natively support FormData cleanly without overriding headers
    // We will construct the fetch request directly here or adapt apiRequest if possible.
    const url = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';
    const endpoint = url.endsWith('/') ? `${url.slice(0, -1)}/${BASE_PATH}/upload` : `${url}/${BASE_PATH}/upload`;
    
    const formData = new FormData();
    formData.append('EmployeeId', employeeId);
    formData.append('Image', file);

    const token = localStorage.getItem('access_token');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Do NOT set Content-Type header manually, let browser set it with boundary for FormData
      },
      body: formData,
      signal,
    });

    if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
    }

    // Assuming the API might return void or a simple response
    if (res.status !== 204) {
        const text = await res.text();
        if (text) return JSON.parse(text);
    }
  },

  fetchEmployeeSalaryHistory: async (id: string, params?: { PageNumber?: number, PageSize?: number, SearchTerm?: string, SortBy?: string, SortDirection?: string }, signal?: AbortSignal) => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.PageNumber !== undefined) searchParams.append('PageNumber', params.PageNumber.toString());
      if (params.PageSize !== undefined) searchParams.append('PageSize', params.PageSize.toString());
      if (params.SearchTerm) searchParams.append('SearchTerm', params.SearchTerm);
      if (params.SortBy) searchParams.append('SortBy', params.SortBy);
      if (params.SortDirection) searchParams.append('SortDirection', params.SortDirection);

      const qStr = searchParams.toString();
      if (qStr) {
        query = `?${qStr}`;
      }
    }
    const response = await apiRequest<unknown>({ method: 'GET', path: `${BASE_PATH}/${id}/salary-history${query}`, signal });
    return unwrapApiResponse(response);
  }
};
