import { apiRequest, unwrapApiResponse } from '../../apis/apiClient';
import type {
  PaginatedPayrollProcessing,
  PayrollProcessRequestDto,
  PayrollProcessResponseDto,
  PayrollProcessingBatchReadDto,
  PayrollProcessingQueryParams,
  PayrollProcessingReadDto,
} from '../../../models/HRMmodels/Payroll';

const BASE_PATH = 'payroll-processing';

function buildQuery(params?: PayrollProcessingQueryParams) {
  const query = new URLSearchParams();
  if (params?.PaymentMethod) query.append('PaymentMethod', params.PaymentMethod);
  if (params?.PayrollId) query.append('PayrollId', params.PayrollId);
  if (params?.ProcessingBatchId) query.append('ProcessingBatchId', params.ProcessingBatchId);
  if (params?.CreatedBy) query.append('CreatedBy', params.CreatedBy);
  if (params?.FromDate) query.append('FromDate', params.FromDate);
  if (params?.ToDate) query.append('ToDate', params.ToDate);
  if (params?.SearchTerm) query.append('SearchTerm', params.SearchTerm);
  if (params?.SortBy) query.append('SortBy', params.SortBy);
  if (params?.SortDirection) query.append('SortDirection', params.SortDirection);
  if (params?.PageNumber !== undefined) query.append('PageNumber', params.PageNumber.toString());
  if (params?.PageSize !== undefined) query.append('PageSize', params.PageSize.toString());

  const qStr = query.toString();
  return qStr ? `?${qStr}` : '';
}

export const payrollProcessingApi = {
  processPayrolls: async (payload: PayrollProcessRequestDto, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'POST',
      path: `${BASE_PATH}/process`,
      body: payload,
      signal,
    });
    return unwrapApiResponse<PayrollProcessResponseDto>(response);
  },

  getProcessingRecords: async (params?: PayrollProcessingQueryParams, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'GET',
      path: `${BASE_PATH}${buildQuery(params)}`,
      signal,
    });
    return unwrapApiResponse<PaginatedPayrollProcessing>(response);
  },

  getProcessingById: async (id: string, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'GET',
      path: `${BASE_PATH}/${id}`,
      signal,
    });
    return unwrapApiResponse<PayrollProcessingReadDto>(response);
  },

  getProcessingByPayrollId: async (payrollId: string, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'GET',
      path: `${BASE_PATH}/payroll/${payrollId}`,
      signal,
    });
    return unwrapApiResponse<PayrollProcessingReadDto>(response);
  },

  getProcessingBatch: async (processingBatchId: string, signal?: AbortSignal) => {
    const response = await apiRequest<unknown>({
      method: 'GET',
      path: `${BASE_PATH}/batch/${processingBatchId}`,
      signal,
    });
    return unwrapApiResponse<PayrollProcessingBatchReadDto>(response);
  },
};
