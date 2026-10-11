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
    if (params?.pageNumber !== undefined) {
      searchParams.append('pageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize !== undefined) {
      searchParams.append('pageSize', params.pageSize.toString());
    }

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return unwrapApiResponse<PaginatedSuppliers>(
      await apiRequest<PaginatedSuppliers>({
        method: 'GET',
        path: `/${BASE_PATH}${query}`,
        signal,
      })
    );
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
