export interface CashPaymentDto {
  supplierId: number;
  supplierPurchaseId: number;
  amount: number;
  paymentMethod: string;
  notes?: string;
  referenceNumber?: string;
}

export interface CashPaymentResponse {
  transactionId: number;
  transactionType: string;
  amount: number;
  transactionDate: string;
  referenceNumber?: string;
}

export interface AdvancePaymentDto {
  supplierId: number;
  advanceId: number;
  supplierPurchaseId: number;
  amount: number;
  paymentMethod?: string;
  notes?: string;
  referenceNumber?: string;
}

export interface AdvancePaymentResponse {
  transactionId: number;
  transactionType: string;
  amount: number;
  remainingAdvance: number;
  transactionDate: string;
}

export interface MixedPaymentDto {
  supplierPurchaseId: number;
  advanceId?: number;
  advanceAmount?: number;
  cashAmount?: number;
  installmentIds?: number[];
  installmentAmounts?: number[];
}

export interface MixedPaymentResponse {
  success: boolean;
  message?: string;
  createdTransactionIds: number[];
  totalApplied: number;
  remainingBalance: number;
  processedAt: string;
}

export type PaymentMode = 'cash' | 'advance' | 'plan' | 'mixed';
