import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supplierFinanceApi } from '../../../shared/Purchaseshared/api/supplierFinanceApi';
import type {
  PurchasePaymentSummary,
  InstallmentWithPayments,
  FinanceTransactionListItem,
  FinanceTransactionsQueryParams,
  PaginatedFinanceTransactions,
} from '../../../models/Purchasemodels/SupplierFinance';
import {
  processCashPayment,
  processAdvancePayment,
  processMixedPayment,
} from '../purchasingPayments/purchasingPaymentsSlice';
import { paySingleInstallment, createInstallmentPlan } from '../purchasingInstallments/purchasingInstallmentsSlice';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface SupplierFinanceState {
  paymentSummariesByPurchaseId: Record<number, PurchasePaymentSummary>;
  summaryStatusByPurchaseId: Record<number, AsyncStatus>;
  summaryStatus: AsyncStatus;
  installmentPaymentsById: Record<number, InstallmentWithPayments>;
  installmentPaymentStatusById: Record<number, AsyncStatus>;
  installmentDetailsStatus: AsyncStatus;
  transactions: FinanceTransactionListItem[];
  transactionsTotalCount: number;
  totalCount: number;
  transactionsPage: number;
  transactionsPageSize: number;
  transactionsTotalPages: number;
  totalPages: number;
  transactionsFilters: FinanceTransactionsQueryParams;
  transactionsStatus: AsyncStatus;
  error: string | null;
}

const initialState: SupplierFinanceState = {
  paymentSummariesByPurchaseId: {},
  summaryStatusByPurchaseId: {},
  summaryStatus: 'idle',
  installmentPaymentsById: {},
  installmentPaymentStatusById: {},
  installmentDetailsStatus: 'idle',
  transactions: [],
  transactionsTotalCount: 0,
  totalCount: 0,
  transactionsPage: 1,
  transactionsPageSize: 20,
  transactionsTotalPages: 1,
  totalPages: 1,
  transactionsFilters: {},
  transactionsStatus: 'idle',
  error: null,
};

// Async Thunks
export const fetchPurchasePaymentSummary = createAsyncThunk(
  'supplierFinance/fetchPurchasePaymentSummary',
  async (
    {
      supplierPurchaseId,
      forceRefresh = false,
    }: {
      supplierPurchaseId: number;
      forceRefresh?: boolean;
    },
    { getState, rejectWithValue, signal }
  ) => {
    const state = getState() as { supplierFinance: SupplierFinanceState };
    // Reuse cached summary if already fetched and not forced
    if (!forceRefresh && state.supplierFinance.paymentSummariesByPurchaseId[supplierPurchaseId]) {
      return state.supplierFinance.paymentSummariesByPurchaseId[supplierPurchaseId];
    }
    try {
      return await supplierFinanceApi.getPurchasePaymentSummary(supplierPurchaseId, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchase payment summary');
    }
  }
);

export const fetchInstallmentWithPayments = createAsyncThunk(
  'supplierFinance/fetchInstallmentWithPayments',
  async (
    arg: { id?: number; installmentId?: number; forceRefresh?: boolean },
    { getState, rejectWithValue, signal }
  ) => {
    const targetId = arg.id ?? arg.installmentId;
    if (!targetId) return rejectWithValue('Missing installment id');
    const forceRefresh = arg.forceRefresh ?? false;
    const state = getState() as { supplierFinance: SupplierFinanceState };
    // Reuse cached installment details if already loaded
    if (!forceRefresh && state.supplierFinance.installmentPaymentsById[targetId]) {
      return state.supplierFinance.installmentPaymentsById[targetId];
    }
    try {
      return await supplierFinanceApi.getInstallmentWithPayments(targetId, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch installment payment history');
    }
  }
);

export const fetchFinanceTransactions = createAsyncThunk(
  'supplierFinance/fetchFinanceTransactions',
  async (params: FinanceTransactionsQueryParams | undefined, { rejectWithValue, signal }) => {
    try {
      return await supplierFinanceApi.getTransactions(params, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch finance transactions');
    }
  }
);

export const fetchTransactions = fetchFinanceTransactions;

const supplierFinanceSlice = createSlice({
  name: 'supplierFinance',
  initialState,
  reducers: {
    invalidatePurchasePaymentSummary: (state, action: PayloadAction<number>) => {
      delete state.paymentSummariesByPurchaseId[action.payload];
      delete state.summaryStatusByPurchaseId[action.payload];
    },
    invalidateInstallmentPayments: (state, action: PayloadAction<number>) => {
      delete state.installmentPaymentsById[action.payload];
      delete state.installmentPaymentStatusById[action.payload];
    },
    setTransactionFilters: (state, action: PayloadAction<FinanceTransactionsQueryParams>) => {
      state.transactionsFilters = { ...state.transactionsFilters, ...action.payload };
      state.transactionsPage = 1;
    },
    resetTransactionFilters: (state) => {
      state.transactionsFilters = {};
      state.transactionsPage = 1;
    },
    setTransactionPage: (state, action: PayloadAction<number>) => {
      state.transactionsPage = action.payload;
    },
    setTransactionPageSize: (state, action: PayloadAction<number>) => {
      state.transactionsPageSize = action.payload;
      state.transactionsPage = 1;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.transactionsTotalCount = 0;
      state.totalCount = 0;
      state.transactionsPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPurchasePaymentSummary
      .addCase(fetchPurchasePaymentSummary.pending, (state, action) => {
        const id = action.meta.arg.supplierPurchaseId;
        state.summaryStatusByPurchaseId[id] = 'loading';
        state.summaryStatus = 'loading';
      })
      .addCase(
        fetchPurchasePaymentSummary.fulfilled,
        (state, action: PayloadAction<PurchasePaymentSummary>) => {
          const id = action.payload.supplierPurchaseId;
          state.summaryStatusByPurchaseId[id] = 'succeeded';
          state.summaryStatus = 'succeeded';
          state.paymentSummariesByPurchaseId[id] = action.payload;
        }
      )
      .addCase(fetchPurchasePaymentSummary.rejected, (state, action) => {
        const id = action.meta.arg.supplierPurchaseId;
        state.summaryStatusByPurchaseId[id] = 'failed';
        state.summaryStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch summary';
      })

      // fetchInstallmentWithPayments
      .addCase(fetchInstallmentWithPayments.pending, (state, action) => {
        const targetId = action.meta.arg.id ?? action.meta.arg.installmentId;
        if (targetId) {
          state.installmentPaymentStatusById[targetId] = 'loading';
        }
        state.installmentDetailsStatus = 'loading';
      })
      .addCase(
        fetchInstallmentWithPayments.fulfilled,
        (state, action: PayloadAction<InstallmentWithPayments>) => {
          const id = action.payload.id;
          state.installmentPaymentStatusById[id] = 'succeeded';
          state.installmentDetailsStatus = 'succeeded';
          state.installmentPaymentsById[id] = action.payload;
        }
      )
      .addCase(fetchInstallmentWithPayments.rejected, (state, action) => {
        const targetId = action.meta.arg.id ?? action.meta.arg.installmentId;
        if (targetId) {
          state.installmentPaymentStatusById[targetId] = 'failed';
        }
        state.installmentDetailsStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch installment details';
      })

      // fetchFinanceTransactions
      .addCase(fetchFinanceTransactions.pending, (state) => {
        state.transactionsStatus = 'loading';
        state.error = null;
      })
      .addCase(
        fetchFinanceTransactions.fulfilled,
        (state, action: PayloadAction<PaginatedFinanceTransactions>) => {
          state.transactionsStatus = 'succeeded';
          const raw = action.payload as any;
          const items = Array.isArray(raw)
            ? raw
            : raw?.data || raw?.Data || raw?.items || raw?.Items || [];
          state.transactions = items;
          state.transactionsTotalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
          state.totalCount = state.transactionsTotalCount;
          state.transactionsPage = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : 1);
          state.transactionsPageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : 20);
          state.transactionsTotalPages = Number(raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(state.totalCount / (state.transactionsPageSize || 1))));
          state.totalPages = state.transactionsTotalPages;
        }
      )
      .addCase(fetchFinanceTransactions.rejected, (state, action) => {
        state.transactionsStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch transactions';
      })

      // Automatic cache invalidation when a payment is executed
      .addCase(processCashPayment.fulfilled, (state, action) => {
        const pId = action.meta.arg.supplierPurchaseId;
        delete state.paymentSummariesByPurchaseId[pId];
      })
      .addCase(processAdvancePayment.fulfilled, (state, action) => {
        const pId = action.meta.arg.supplierPurchaseId;
        delete state.paymentSummariesByPurchaseId[pId];
      })
      .addCase(processMixedPayment.fulfilled, (state, action) => {
        const pId = action.meta.arg.supplierPurchaseId;
        delete state.paymentSummariesByPurchaseId[pId];
      })
      .addCase(createInstallmentPlan.fulfilled, (state, action) => {
        const pId = action.meta.arg.supplierPurchaseId;
        delete state.paymentSummariesByPurchaseId[pId];
      })
      .addCase(paySingleInstallment.fulfilled, (state, action) => {
        delete state.installmentPaymentsById[action.payload.installmentId];
      });
  },
});

export const {
  invalidatePurchasePaymentSummary,
  invalidateInstallmentPayments,
  setTransactionFilters,
  resetTransactionFilters,
  setTransactionPage,
  setTransactionPageSize,
  clearTransactions,
} = supplierFinanceSlice.actions;

export const supplierFinanceReducer = supplierFinanceSlice.reducer;
export default supplierFinanceSlice.reducer;
