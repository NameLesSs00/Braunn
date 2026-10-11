export interface InstallmentPaymentTransaction {
  transactionId?: number;
  id?: number;
  transactionNumber?: string;
  amount: number;
  paymentMethod: string;
  transactionDate?: string;
  paymentDate?: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface InstallmentWithPayments {
  id: number;
  installmentPlanId: number;
  planInstallmentNumber?: number;
  installmentNumber?: number;
  supplierId: number;
  supplierName: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Pending' | 'Paid' | 'PartiallyPaid' | string;
  isOverdue?: boolean;
  paidAt?: string | null;
  notes?: string | null;
  payments: InstallmentPaymentTransaction[];
}

export interface SummaryInstallmentItem {
  id: number;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Pending' | 'Paid' | 'PartiallyPaid' | string;
  isOverdue?: boolean;
  paidAt?: string | null;
}

export interface PurchasePaymentSummary {
  supplierPurchaseId: number;
  supplierId: number;
  supplierName: string;
  invoiceTotal: number;
  advanceUsed: number;
  cashPaid: number;
  installmentsPaid: number;
  totalPaid: number;
  remainingBalance: number;
  paymentStatus: 'Pending' | 'PartiallyPaid' | 'Paid' | string;
  lastPaymentDate?: string | null;
  activeInstallmentPlanId?: number | null;
  totalInstallments: number;
  paidInstallments: number;
  installments: SummaryInstallmentItem[];
  calculatedAt: string;
}

export interface FinanceTransactionListItem {
  id: number;
  transactionNumber?: string;
  supplierId: number;
  supplierName: string;
  transactionType: string;
  paymentMethod: string;
  amount: number;
  transactionDate: string;
  supplierPurchaseId?: number | null;
  advanceId?: number | null;
  installmentId?: number | null;
  installmentPlanId?: number | null;
  installmentNumber?: number | null;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface FinanceTransactionsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  supplierId?: number;
  supplierPurchaseId?: number;
  transactionType?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface PaginatedFinanceTransactions {
  data: FinanceTransactionListItem[];
  items?: FinanceTransactionListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
