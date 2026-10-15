export type PurchasingDepartmentType =
  | 'Room'
  | 'Restaurant'
  | 'Laundry'
  | 'Housekeeping'
  | 'ExtraService'
  | 'Manual'
  | 'Package'
  | 'Meal'
  | 'Service'
  | 'MealPlan'
  | 'Maintenance';

export const PURCHASING_DEPARTMENT_TYPES: readonly PurchasingDepartmentType[] = [
  'Room',
  'Restaurant',
  'Laundry',
  'Housekeeping',
  'ExtraService',
  'Manual',
  'Package',
  'Meal',
  'Service',
  'MealPlan',
  'Maintenance',
] as const;

export type PurchaseStatus = 'Pending' | 'Received';
export type PurchasePaymentStatus = 'Pending' | 'PartiallyPaid' | 'Paid';

export interface SupplierPurchaseListItem {
  id: number;
  supplierId: number;
  supplierName: string;
  purchaseDate: string;
  purchaseStatus: PurchaseStatus | string;
  paymentStatus: PurchasePaymentStatus | string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  notes: string;
  createdBy?: string | null;
  createdAt?: string | null;
  modifiedBy?: string | null;
  modifiedAt?: string | null;
}

export interface SupplierPurchaseItemDetail {
  id: number;
  supplierPurchaseId: number;
  departmentType: PurchasingDepartmentType | string;
  itemId: number;
  itemName: string;
  unitId: number;
  unit: string;
  conversionFactor: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string;
}

export interface SupplierPurchaseDetails extends SupplierPurchaseListItem {
  items: SupplierPurchaseItemDetail[];
}

export interface SupplierPurchasesQueryParams {
  pageNumber?: number;
  pageSize?: number;
  supplierId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedSupplierPurchases {
  items: SupplierPurchaseListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateSupplierPurchaseItemDto {
  departmentType: PurchasingDepartmentType;
  itemId: number;
  quantity: number;
  unitId: number | null;
  unitPrice: number;
  notes?: string;
}

export interface CreateSupplierPurchaseDto {
  supplierId: number;
  purchaseDate: string; // ISO date string e.g. 2026-10-10T12:50:43.713Z
  notes?: string;
  items: CreateSupplierPurchaseItemDto[];
}

export interface CreateSupplierPurchaseResponse {
  id: number;
}

export interface UpdateSupplierPurchaseDto {
  id: number;
  departmentType: PurchasingDepartmentType;
  purchaseDate: string;
  notes?: string;
}

export interface OperationSuccessResponse {
  success?: boolean;
}
