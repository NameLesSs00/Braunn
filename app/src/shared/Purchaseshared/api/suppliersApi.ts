import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  Supplier,
  CreateSupplierDto,
  CreateSupplierResponse,
  UpdateSupplierDto,
  UpdateSupplierDepartmentsDto,
  SuppliersQueryParams,
  PaginatedSuppliers,
  PurchasingDepartment,
  OperationSuccessResponse,
} from '../../../models/Purchasemodels/Supplier';

const BASE_PATH = 'purchasing/suppliers';

export const suppliersApi = {
  /**
   * Get paginated suppliers list
   */
  getSuppliers: async (params?: SuppliersQueryParams, signal?: AbortSignal): Promise<PaginatedSuppliers> => {
    const searchParams = new URLSearchParams();
    const pageNum = params?.pageNumber && params.pageNumber > 0 ? params.pageNumber : 1;
    searchParams.append('PageNumber', pageNum.toString());

    const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 10;
    searchParams.append('PageSize', pageSize.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiRequest<unknown>({
      method: 'GET',
      path: `/${BASE_PATH}${query}`,
      signal,
    });
    const parsed = unwrapApiResponse<PaginatedSuppliers>(res);
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
    const hasPreviousPage = Boolean(
      raw?.hasPreviousPage ?? raw?.HasPreviousPage ?? pageNumber > 1
    );
    const hasNextPage = Boolean(
      raw?.hasNextPage ?? raw?.HasNextPage ?? pageNumber < totalPages
    );

    return {
      items,
      totalCount,
      pageNumber,
      pageSize: resolvedPageSize,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    };
  },

  /**
   * Get single supplier by ID
   */
  getSupplierById: async (id: number, signal?: AbortSignal): Promise<Supplier> => {
    return unwrapApiResponse<Supplier>(
      await apiRequest<Supplier>({
        method: 'GET',
        path: `/${BASE_PATH}/${id}`,
        signal,
      })
    );
  },

  /**
   * Get suppliers filtered by department
   */
  getSuppliersByDepartment: async (
    department: PurchasingDepartment,
    signal?: AbortSignal
  ): Promise<Supplier[]> => {
    return unwrapApiResponse<Supplier[]>(
      await apiRequest<Supplier[]>({
        method: 'GET',
        path: `/${BASE_PATH}/by-department/${encodeURIComponent(department)}`,
        signal,
      })
    );
  },

  /**
   * Create a new supplier
   */
  createSupplier: async (payload: CreateSupplierDto, signal?: AbortSignal): Promise<CreateSupplierResponse> => {
    return unwrapApiResponse<CreateSupplierResponse>(
      await apiRequest<CreateSupplierResponse>({
        method: 'POST',
        path: `/${BASE_PATH}`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Update supplier details
   */
  updateSupplier: async (
    id: number,
    payload: UpdateSupplierDto,
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
   * Update supplier departments
   */
  updateSupplierDepartments: async (
    id: number,
    payload: UpdateSupplierDepartmentsDto,
    signal?: AbortSignal
  ): Promise<OperationSuccessResponse> => {
    return unwrapApiResponse<OperationSuccessResponse>(
      await apiRequest<OperationSuccessResponse>({
        method: 'PUT',
        path: `/${BASE_PATH}/${id}/departments`,
        body: payload,
        signal,
      })
    );
  },

  /**
   * Delete supplier by ID
   */
  deleteSupplier: async (id: number, signal?: AbortSignal): Promise<OperationSuccessResponse> => {
    return unwrapApiResponse<OperationSuccessResponse>(
      await apiRequest<OperationSuccessResponse>({
        method: 'DELETE',
        path: `/${BASE_PATH}/${id}`,
        signal,
      })
    );
  },
};
