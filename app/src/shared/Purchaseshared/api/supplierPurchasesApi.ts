import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  SupplierPurchaseListItem,
  SupplierPurchaseDetails,
  SupplierPurchasesQueryParams,
  PaginatedSupplierPurchases,
  CreateSupplierPurchaseDto,
  CreateSupplierPurchaseResponse,
  UpdateSupplierPurchaseDto,
  OperationSuccessResponse,
} from '../../../models/Purchasemodels/SupplierPurchase';

const BASE_PATH = 'purchasing/supplier-purchases';

export const supplierPurchasesApi = {
  /**
   * Get paginated supplier purchases list with optional filters
   */
  getSupplierPurchases: async (
    params?: SupplierPurchasesQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedSupplierPurchases> => {
    const searchParams = new URLSearchParams();
    const pageNum = params?.pageNumber && params.pageNumber > 0 ? params.pageNumber : 1;
    searchParams.append('PageNumber', pageNum.toString());

    const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    searchParams.append('PageSize', pageSize.toString());

    if (params?.supplierId !== undefined) {
      searchParams.append('SupplierId', params.supplierId.toString());
    }
    if (params?.status && params.status !== 'ALL' && params.status !== 'All') {
      searchParams.append('Status', params.status);
    }
    if (params?.dateFrom) {
      searchParams.append('DateFrom', params.dateFrom);
    }
    if (params?.dateTo) {
      searchParams.append('DateTo', params.dateTo);
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiRequest<unknown>({
      method: 'GET',
      path: `/${BASE_PATH}${query}`,
      signal,
    });
    const parsed = unwrapApiResponse<PaginatedSupplierPurchases>(res);
    const raw = parsed as any;
    const items = Array.isArray(raw)
      ? raw
      : raw?.items || raw?.Items || raw?.data?.items || raw?.data?.Items || raw?.data || [];
    const totalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
    const pageNumber = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : pageNum);
    const resolvedPageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : pageSize);
    const totalPages = Number(
      raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(totalCount / (resolvedPageSize || 1)))
    );

    return {
      items,
      totalCount,
      pageNumber,
      pageSize: resolvedPageSize,
      totalPages,
    };
  },

  /**
   * Get single supplier purchase summary by ID
   */
  getSupplierPurchaseById: async (
    id: number,
    signal?: AbortSignal
  ): Promise<SupplierPurchaseListItem> => {
    return unwrapApiResponse<SupplierPurchaseListItem>(
      await apiRequest<SupplierPurchaseListItem>({
        method: 'GET',
        path: `/${BASE_PATH}/${id}`,
        signal,
      })
    );
  },

  /**
   * Get full details of a supplier purchase (including nested line items)
   */
  getSupplierPurchaseDetails: async (
    id: number,
    signal?: AbortSignal
  ): Promise<SupplierPurchaseDetails> => {
    return unwrapApiResponse<SupplierPurchaseDetails>(
      await apiRequest<SupplierPurchaseDetails>({
        method: 'GET',
        path: `/${BASE_PATH}/${id}/details`,
        signal,
      })
    );
  },

  /**
   * Create a new supplier purchase order with items
   */
  createSupplierPurchase: async (
    payload: CreateSupplierPurchaseDto,
    signal?: AbortSignal
  ): Promise<CreateSupplierPurchaseResponse> => {
    return unwrapApiResponse<CreateSupplierPurchaseResponse>(
      await apiRequest<CreateSupplierPurchaseResponse>({
        method: 'POST',
        path: `/${BASE_PATH}`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Update header information for a supplier purchase
   */
  updateSupplierPurchase: async (
    id: number,
    payload: UpdateSupplierPurchaseDto,
    signal?: AbortSignal
  ): Promise<OperationSuccessResponse> => {
    return unwrapApiResponse<OperationSuccessResponse>(
      await apiRequest<OperationSuccessResponse>({
        method: 'PUT',
        path: `/${BASE_PATH}/${id}`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Delete a supplier purchase order
   */
  deleteSupplierPurchase: async (
    id: number,
    signal?: AbortSignal
  ): Promise<OperationSuccessResponse> => {
    return unwrapApiResponse<OperationSuccessResponse>(
      await apiRequest<OperationSuccessResponse>({
        method: 'DELETE',
        path: `/${BASE_PATH}/${id}`,
        signal,
      })
    );
  },

  /**
   * Mark a supplier purchase order as received
   */
  receiveSupplierPurchase: async (
    id: number,
    signal?: AbortSignal
  ): Promise<OperationSuccessResponse> => {
    return unwrapApiResponse<OperationSuccessResponse>(
      await apiRequest<OperationSuccessResponse>({
        method: 'POST',
        path: `/${BASE_PATH}/${id}/receive`,
        body: '',
        signal,
      })
    );
  },
};
