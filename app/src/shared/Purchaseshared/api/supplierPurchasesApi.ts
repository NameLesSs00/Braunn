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
    if (params?.dateFrom) {
      searchParams.append('DateFrom', params.dateFrom);
    }
    if (params?.dateTo) {
      searchParams.append('DateTo', params.dateTo);
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return unwrapApiResponse<PaginatedSupplierPurchases>(
      await apiRequest<PaginatedSupplierPurchases>({
        method: 'GET',
        path: `/${BASE_PATH}${query}`,
        signal,
      })
    );
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
