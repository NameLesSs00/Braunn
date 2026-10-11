export type PurchasingDepartment = 'Restaurant' | 'Laundry' | 'HKM' | 'Maintenance';

export const PURCHASING_DEPARTMENTS: readonly PurchasingDepartment[] = [
  'Restaurant',
  'Laundry',
  'HKM',
  'Maintenance',
] as const;

export interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  isActive: boolean;
  notes: string;
  departments: PurchasingDepartment[];
  createdBy?: string;
  createdAt?: string;
}

export interface CreateSupplierDto {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  isActive: boolean;
  notes?: string;
  departments: PurchasingDepartment[];
}

export interface CreateSupplierResponse {
  id: number;
}

export interface UpdateSupplierDto {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  isActive: boolean;
  notes?: string;
}

export interface UpdateSupplierDepartmentsDto {
  supplierId: number;
  departments: PurchasingDepartment[];
}

export interface SuppliersQueryParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedSuppliers {
  items: Supplier[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OperationSuccessResponse {
  success: boolean;
}
