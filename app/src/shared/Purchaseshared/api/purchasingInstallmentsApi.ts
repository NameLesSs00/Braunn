import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  CreateInstallmentPlanDto,
  PayInstallmentDto,
  InstallmentPlanDetails,
  PurchasingInstallmentsQueryParams,
  PaginatedPurchasingInstallments,
  PurchasingInstallmentListItem,
} from '../../../models/Purchasemodels/PurchasingInstallment';

const BASE_PATH = 'purchasing/installments';

export const purchasingInstallmentsApi = {
  /**
   * Create an installment plan for a supplier purchase order
   */
  createPlan: async (
    payload: CreateInstallmentPlanDto,
    signal?: AbortSignal
  ): Promise<void> => {
    return unwrapApiResponse<void>(
      await apiRequest<void>({
        method: 'POST',
        path: `/${BASE_PATH}/plan`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Make a payment towards a specific installment
   */
  payInstallment: async (
    payload: PayInstallmentDto,
    signal?: AbortSignal
  ): Promise<void> => {
    return unwrapApiResponse<void>(
      await apiRequest<void>({
        method: 'POST',
        path: `/${BASE_PATH}/pay`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Get installment plan details including full installment schedule
   */
  getPlanById: async (
    id: number,
    signal?: AbortSignal
  ): Promise<InstallmentPlanDetails> => {
    return unwrapApiResponse<InstallmentPlanDetails>(
      await apiRequest<InstallmentPlanDetails>({
        method: 'GET',
        path: `/${BASE_PATH}/plan/${id}`,
        signal,
      })
    );
  },

  /**
   * Get paginated installments list with filters (due date, overdue, unpaid, etc.)
   */
  getInstallments: async (
    params?: PurchasingInstallmentsQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedPurchasingInstallments> => {
    const searchParams = new URLSearchParams();
    const pageNum = params?.pageNumber && params.pageNumber > 0 ? params.pageNumber : 1;
    searchParams.append('PageNumber', pageNum.toString());

    const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 20;
    searchParams.append('PageSize', pageSize.toString());

    if (params?.sortBy) {
      searchParams.append('SortBy', params.sortBy);
    }
    if (params?.sortDirection) {
      searchParams.append('SortDirection', params.sortDirection);
    }
    if (params?.searchTerm) {
      searchParams.append('SearchTerm', params.searchTerm);
    }
    if (params?.planId !== undefined) {
      searchParams.append('PlanId', params.planId.toString());
    }
    if (params?.supplierId !== undefined) {
      searchParams.append('SupplierId', params.supplierId.toString());
    }
    if (params?.status && params.status !== 'ALL' && params.status !== 'All') {
      searchParams.append('Status', params.status);
    }
    if (params?.dueFrom) {
      searchParams.append('DueFrom', params.dueFrom);
    }
    if (params?.dueTo) {
      searchParams.append('DueTo', params.dueTo);
    }
    if (params?.showOnlyOverdue !== undefined) {
      searchParams.append('ShowOnlyOverdue', params.showOnlyOverdue.toString());
    }
    if (params?.showOnlyUnpaid !== undefined) {
      searchParams.append('ShowOnlyUnpaid', params.showOnlyUnpaid.toString());
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    const raw = await apiRequest<any>({
      method: 'GET',
      path: `/${BASE_PATH}${query}`,
      signal,
    });

    // Check if raw is already an error response
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

    // Handle nested response container if present
    let target = raw;
    if (raw && typeof raw === 'object' && ('data' in raw || 'Data' in raw)) {
      const inner = raw.data ?? raw.Data;
      if (
        inner &&
        typeof inner === 'object' &&
        ('data' in inner || 'items' in inner || 'Items' in inner || 'totalCount' in inner || 'TotalCount' in inner)
      ) {
        target = inner;
      }
    }

    if (target && typeof target === 'object') {
      const items: PurchasingInstallmentListItem[] = Array.isArray(target.items)
        ? target.items
        : Array.isArray(target.Items)
        ? target.Items
        : Array.isArray(target.data)
        ? target.data
        : Array.isArray(target.Data)
        ? target.Data
        : Array.isArray(target)
        ? target
        : [];
      const totalCount = Number(target.totalCount ?? target.TotalCount ?? items.length);
      const pageNumber = Number(
        target.pageNumber && target.pageNumber > 0
          ? target.pageNumber
          : target.PageNumber && target.PageNumber > 0
          ? target.PageNumber
          : pageNum
      );
      const resolvedPageSize = Number(
        target.pageSize && target.pageSize > 0
          ? target.pageSize
          : target.PageSize && target.PageSize > 0
          ? target.PageSize
          : pageSize
      );
      const totalPages = Number(
        target.totalPages ??
          target.TotalPages ??
          Math.max(1, Math.ceil(totalCount / (resolvedPageSize || 1)))
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
        pageSize: resolvedPageSize,
        totalPages,
        hasPreviousPage,
        hasNextPage,
      };
    }

    return {
      data: [],
      totalCount: 0,
      pageNumber: params?.pageNumber ?? 1,
      pageSize: params?.pageSize ?? 20,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },
};
