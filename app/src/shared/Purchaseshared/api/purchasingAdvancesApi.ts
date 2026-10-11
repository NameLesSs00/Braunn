import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  PurchasingAdvance,
  PurchasingAdvancesQueryParams,
  PaginatedPurchasingAdvances,
  CreatePurchasingAdvanceDto,
  UpdatePurchasingAdvanceDto,
} from '../../../models/Purchasemodels/PurchasingAdvance';

const BASE_PATH = 'purchasing/advances';

export const purchasingAdvancesApi = {
  /**
   * Get paginated purchasing advances list with optional filters
   */
  getAdvances: async (
    params?: PurchasingAdvancesQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedPurchasingAdvances> => {
    const searchParams = new URLSearchParams();
    if (params?.pageNumber !== undefined) {
      searchParams.append('PageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize !== undefined) {
      searchParams.append('PageSize', params.pageSize.toString());
    }
    if (params?.supplierId !== undefined) {
      searchParams.append('SupplierId', params.supplierId.toString());
    }
    if (params?.status) {
      searchParams.append('Status', params.status);
    }
    if (params?.minAmount !== undefined) {
      searchParams.append('MinAmount', params.minAmount.toString());
    }
    if (params?.maxAmount !== undefined) {
      searchParams.append('MaxAmount', params.maxAmount.toString());
    }
    if (params?.fromDate) {
      searchParams.append('FromDate', params.fromDate);
    }
    if (params?.toDate) {
      searchParams.append('ToDate', params.toDate);
    }
    if (params?.search) {
      searchParams.append('Search', params.search);
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    const raw = await apiRequest<any>({
      method: 'GET',
      path: `/${BASE_PATH}${query}`,
      signal,
    });

    // Check if raw has isSuccess: false
    if (raw && typeof raw === 'object' && ('isSuccess' in raw || 'IsSuccess' in raw)) {
      const isSuccess = raw.isSuccess ?? raw.IsSuccess;
      if (!isSuccess) {
        const msg = raw.message || raw.Message || 'Operation failed';
        const errors = raw.errors || raw.Errors;
        const errorMsg =
          Array.isArray(errors) && errors.length > 0 ? `${msg}\n${errors.join('\n')}` : msg;
        throw new Error(errorMsg);
      }
    }

    // Handle nested data envelope if present
    let target = raw;
    if (raw && typeof raw === 'object' && ('data' in raw || 'Data' in raw)) {
      const inner = raw.data ?? raw.Data;
      if (
        inner &&
        typeof inner === 'object' &&
        ('data' in inner || 'totalCount' in inner || 'TotalCount' in inner)
      ) {
        target = inner;
      }
    }

    if (target && typeof target === 'object') {
      const items: PurchasingAdvance[] = Array.isArray(target.data)
        ? target.data
        : Array.isArray(target.Data)
        ? target.Data
        : Array.isArray(target)
        ? target
        : [];
      const totalCount = Number(target.totalCount ?? target.TotalCount ?? items.length);
      const pageNumber = Number(target.pageNumber ?? target.PageNumber ?? params?.pageNumber ?? 1);
      const pageSize = Number(target.pageSize ?? target.PageSize ?? params?.pageSize ?? 10);
      const totalPages = Number(
        target.totalPages ??
          target.TotalPages ??
          Math.max(1, Math.ceil(totalCount / (pageSize || 1)))
      );
      const hasPreviousPage = Boolean(
        target.hasPreviousPage ?? target.HasPreviousPage ?? pageNumber > 1
      );
      const hasNextPage = Boolean(
        target.hasNextPage ?? target.HasNextPage ?? pageNumber < totalPages
      );

      return {
        data: items,
        totalCount,
        pageNumber,
        pageSize,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      };
    }

    return {
      data: [],
      totalCount: 0,
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 10,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  /**
   * Get single purchasing advance by ID
   */
  getAdvanceById: async (
    id: number,
    signal?: AbortSignal
  ): Promise<PurchasingAdvance> => {
    return unwrapApiResponse<PurchasingAdvance>(
      await apiRequest<PurchasingAdvance>({
        method: 'GET',
        path: `/${BASE_PATH}/${id}`,
        signal,
      })
    );
  },

  /**
   * Create a new purchasing advance for a supplier
   */
  createAdvance: async (
    payload: CreatePurchasingAdvanceDto,
    signal?: AbortSignal
  ): Promise<PurchasingAdvance> => {
    return unwrapApiResponse<PurchasingAdvance>(
      await apiRequest<PurchasingAdvance>({
        method: 'POST',
        path: `/${BASE_PATH}`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Update an existing advance's amount and notes
   */
  updateAdvance: async (
    id: number,
    payload: UpdatePurchasingAdvanceDto,
    signal?: AbortSignal
  ): Promise<void> => {
    return unwrapApiResponse<void>(
      await apiRequest<void>({
        method: 'PUT',
        path: `/${BASE_PATH}/${id}`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Cancel an active advance
   */
  cancelAdvance: async (
    id: number,
    signal?: AbortSignal
  ): Promise<void> => {
    return unwrapApiResponse<void>(
      await apiRequest<void>({
        method: 'POST',
        path: `/${BASE_PATH}/${id}/cancel`,
        body: '',
        signal,
      })
    );
  },

  /**
   * Delete an advance (fails if already consumed)
   */
  deleteAdvance: async (
    id: number,
    signal?: AbortSignal
  ): Promise<void> => {
    return unwrapApiResponse<void>(
      await apiRequest<void>({
        method: 'DELETE',
        path: `/${BASE_PATH}/${id}`,
        signal,
      })
    );
  },
};
