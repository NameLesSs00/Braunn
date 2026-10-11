export interface CreateInstallmentPlanDto {
  supplierPurchaseId: number;
  totalAmount: number;
  downPayment: number;
  numberOfInstallments: number;
  startDate: string;
  notes?: string;
}

export interface PayInstallmentDto {
  installmentId: number;
  amount: number;
  paymentMethod: string;
  notes?: string;
  referenceNumber?: string;
}

export interface InstallmentScheduleItem {
  id: number;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Pending' | 'Paid' | 'PartiallyPaid' | string;
  paidAt?: string | null;
}

export interface InstallmentPlanDetails {
  planId: number;
  supplierPurchaseId: number;
  supplierId: number;
  supplierName: string;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  numberOfInstallments: number;
  startDate: string;
  endDate: string;
  status: 'Running' | 'Completed' | 'Defaulted' | string;
  totalPaid: number;
  paidInstallments: number;
  partiallyPaidInstallments: number;
  pendingInstallments: number;
  overdueInstallments: number;
  installments: InstallmentScheduleItem[];
  createdAt: string;
  lastModified: string;
}

export interface PurchasingInstallmentListItem {
  id: number;
  installmentPlanId: number;
  supplierId: number;
  supplierName: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Pending' | 'Paid' | 'PartiallyPaid' | string;
  isOverdue: boolean;
  paidAt?: string | null;
}

export interface PurchasingInstallmentsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  searchTerm?: string;
  planId?: number;
  supplierId?: number;
  status?: string;
  dueFrom?: string;
  dueTo?: string;
  showOnlyOverdue?: boolean;
  showOnlyUnpaid?: boolean;
}

export interface PaginatedPurchasingInstallments {
  data: PurchasingInstallmentListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
