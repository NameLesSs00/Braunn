import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  TerminationCreateDto,
  TerminationReadDto,
  PaginatedTerminations,
  TerminationQueryParams,
} from '../../../models/HRMmodels/Termination';

const BASE_PATH = 'hr/HRManagement/terminations';

export const terminationsApi = {
  createTermination: async (payload: TerminationCreateDto, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'POST',
      path: BASE_PATH,
      body: payload,
      signal,
    });
    return unwrapApiResponse<TerminationReadDto>(response);
  },

  getTerminations: async (params?: TerminationQueryParams, signal?: AbortSignal) => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.EmployeeId) searchParams.append('EmployeeId', params.EmployeeId);
      if (params.DateFrom) searchParams.append('DateFrom', params.DateFrom);
      if (params.DateTo) searchParams.append('DateTo', params.DateTo);
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
    return unwrapApiResponse<PaginatedTerminations>(response);
  },

  deleteTermination: async (id: string, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'DELETE',
      path: `${BASE_PATH}/${id}`,
      signal,
    });
    return unwrapApiResponse<void>(response);
  },
};
