export type PurchasingAdvanceStatus = 'Active' | 'Cancelled' | 'Consumed' | string;

export interface PurchasingAdvance {
  id: number;
  supplierId: number;
  supplierName: string;
  amount: number;
  remainingAmount: number;
  notes: string;
  status: PurchasingAdvanceStatus;
  createdAt: string;
}

export interface PurchasingAdvancesQueryParams {
  supplierId?: number;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedPurchasingAdvances {
  data: PurchasingAdvance[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreatePurchasingAdvanceDto {
  supplierId: number;
  amount: number;
  notes: string;
}

export interface UpdatePurchasingAdvanceDto {
  amount: number;
  notes: string;
}
