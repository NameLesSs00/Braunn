import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  InstallmentWithPayments,
  PurchasePaymentSummary,
  FinanceTransactionsQueryParams,
  PaginatedFinanceTransactions,
  FinanceTransactionListItem,
} from '../../../models/Purchasemodels/SupplierFinance';

const BASE_PATH = 'purchasing/supplier-finance';

export const supplierFinanceApi = {
  /**
   * Get detailed installment with payment transaction history
   */
  getInstallmentWithPayments: async (
    id: number,
    signal?: AbortSignal
  ): Promise<InstallmentWithPayments> => {
    return unwrapApiResponse<InstallmentWithPayments>(
      await apiRequest<InstallmentWithPayments>({
        method: 'GET',
        path: `/${BASE_PATH}/installments/${id}`,
        signal,
      })
    );
  },

  /**
   * Get purchase payment summary with complete payment analytics and active installment schedule
   */
  getPurchasePaymentSummary: async (
    supplierPurchaseId: number,
    signal?: AbortSignal
  ): Promise<PurchasePaymentSummary> => {
    return unwrapApiResponse<PurchasePaymentSummary>(
      await apiRequest<PurchasePaymentSummary>({
        method: 'POST',
        path: `/${BASE_PATH}/analytics/purchase-payment-summary`,
        body: { supplierPurchaseId },
        signal,
      })
    );
  },

  /**
   * Get paginated finance transactions journal with advanced filters
   */
  getTransactions: async (
    params?: FinanceTransactionsQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedFinanceTransactions> => {
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
    if (params?.supplierPurchaseId !== undefined) {
      searchParams.append('SupplierPurchaseId', params.supplierPurchaseId.toString());
    }
    if (params?.transactionType) {
      searchParams.append('TransactionType', params.transactionType);
    }
    if (params?.paymentMethod) {
      searchParams.append('PaymentMethod', params.paymentMethod);
    }
    if (params?.dateFrom) {
      searchParams.append('DateFrom', params.dateFrom);
    }
    if (params?.dateTo) {
      searchParams.append('DateTo', params.dateTo);
    }
    if (params?.amountFrom !== undefined) {
      searchParams.append('AmountFrom', params.amountFrom.toString());
    }
    if (params?.amountTo !== undefined) {
      searchParams.append('AmountTo', params.amountTo.toString());
    }
    if (params?.searchTerm) {
      searchParams.append('SearchTerm', params.searchTerm);
    }
    if (params?.sortBy) {
      searchParams.append('SortBy', params.sortBy);
    }
    if (params?.sortDirection) {
      searchParams.append('SortDirection', params.sortDirection);
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    const raw = await apiRequest<any>({
      method: 'GET',
      path: `/${BASE_PATH}/transactions${query}`,
      signal,
    });

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
      const items: FinanceTransactionListItem[] = Array.isArray(target.data)
        ? target.data
        : Array.isArray(target.Data)
        ? target.Data
        : Array.isArray(target)
        ? target
        : [];
      const totalCount = Number(target.totalCount ?? target.TotalCount ?? items.length);
      const pageNumber = Number(target.pageNumber ?? target.PageNumber ?? params?.pageNumber ?? 1);
      const pageSize = Number(target.pageSize ?? target.PageSize ?? params?.pageSize ?? 20);
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
      pageSize: params?.pageSize ?? 20,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },
};
