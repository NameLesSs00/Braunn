import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { purchasingInstallmentsApi } from '../../../shared/Purchaseshared/api/purchasingInstallmentsApi';
import type {
  CreateInstallmentPlanDto,
  PayInstallmentDto,
  InstallmentPlanDetails,
  PurchasingInstallmentListItem,
  PurchasingInstallmentsQueryParams,
  PaginatedPurchasingInstallments,
} from '../../../models/Purchasemodels/PurchasingInstallment';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PurchasingInstallmentsState {
  installments: PurchasingInstallmentListItem[];
  selectedPlan: InstallmentPlanDetails | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  filters: PurchasingInstallmentsQueryParams;
  fetchStatus: AsyncStatus;
  planStatus: AsyncStatus;
  actionStatus: AsyncStatus;
  error: string | null;
}

const initialState: PurchasingInstallmentsState = {
  installments: [],
  selectedPlan: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
  filters: {},
  fetchStatus: 'idle',
  planStatus: 'idle',
  actionStatus: 'idle',
  error: null,
};

// Async Thunks
export const fetchPurchasingInstallments = createAsyncThunk(
  'purchasingInstallments/fetchPurchasingInstallments',
  async (params: PurchasingInstallmentsQueryParams | undefined, { rejectWithValue, signal }) => {
    try {
      return await purchasingInstallmentsApi.getInstallments(params, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch installments');
    }
  }
);

export const fetchInstallmentPlanById = createAsyncThunk(
  'purchasingInstallments/fetchInstallmentPlanById',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      return await purchasingInstallmentsApi.getPlanById(id, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch installment plan');
    }
  }
);

export const createInstallmentPlan = createAsyncThunk(
  'purchasingInstallments/createInstallmentPlan',
  async (payload: CreateInstallmentPlanDto, { rejectWithValue, signal }) => {
    try {
      return await purchasingInstallmentsApi.createPlan(payload, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create installment plan');
    }
  }
);

export const paySingleInstallment = createAsyncThunk(
  'purchasingInstallments/paySingleInstallment',
  async (payload: PayInstallmentDto, { rejectWithValue, signal }) => {
    try {
      await purchasingInstallmentsApi.payInstallment(payload, signal);
      return payload;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to process installment payment');
    }
  }
);

const purchasingInstallmentsSlice = createSlice({
  name: 'purchasingInstallments',
  initialState,
  reducers: {
    setInstallmentFilters: (
      state,
      action: PayloadAction<PurchasingInstallmentsQueryParams>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pageNumber = 1;
    },
    resetInstallmentFilters: (state) => {
      state.filters = {};
      state.pageNumber = 1;
    },
    setInstallmentPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
    setInstallmentPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.pageNumber = 1;
    },
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
    resetInstallmentActionStatus: (state) => {
      state.actionStatus = 'idle';
      state.error = null;
    },
    clearInstallmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPurchasingInstallments
      .addCase(fetchPurchasingInstallments.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(
        fetchPurchasingInstallments.fulfilled,
        (state, action: PayloadAction<PaginatedPurchasingInstallments>) => {
          state.fetchStatus = 'succeeded';
          state.installments = action.payload.data;
          state.totalCount = action.payload.totalCount;
          state.pageNumber = action.payload.pageNumber;
          state.pageSize = action.payload.pageSize;
          state.totalPages = action.payload.totalPages;
          state.hasPreviousPage = action.payload.hasPreviousPage;
          state.hasNextPage = action.payload.hasNextPage;
        }
      )
      .addCase(fetchPurchasingInstallments.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch installments';
      })

      // fetchInstallmentPlanById
      .addCase(fetchInstallmentPlanById.pending, (state) => {
        state.planStatus = 'loading';
        state.error = null;
      })
      .addCase(
        fetchInstallmentPlanById.fulfilled,
        (state, action: PayloadAction<InstallmentPlanDetails>) => {
          state.planStatus = 'succeeded';
          state.selectedPlan = action.payload;
        }
      )
      .addCase(fetchInstallmentPlanById.rejected, (state, action) => {
        state.planStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch installment plan';
      })

      // createInstallmentPlan
      .addCase(createInstallmentPlan.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createInstallmentPlan.fulfilled, (state) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(createInstallmentPlan.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to create installment plan';
      })

      // paySingleInstallment
      .addCase(paySingleInstallment.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(
        paySingleInstallment.fulfilled,
        (state, action: PayloadAction<PayInstallmentDto>) => {
          state.actionStatus = 'succeeded';
          // Optimistically update installment in state list if found
          const itemIndex = state.installments.findIndex((i) => i.id === action.payload.installmentId);
          if (itemIndex !== -1) {
            const currentItem = state.installments[itemIndex];
            const newPaid = currentItem.paidAmount + action.payload.amount;
            const newRem = Math.max(0, currentItem.amount - newPaid);
            state.installments[itemIndex] = {
              ...currentItem,
              paidAmount: newPaid,
              remainingAmount: newRem,
              status: newRem <= 0 ? 'Paid' : 'PartiallyPaid',
            };
          }
          // Optimistically update installment inside selectedPlan if currently open
          if (state.selectedPlan) {
            const planInstIdx = state.selectedPlan.installments.findIndex(
              (i) => i.id === action.payload.installmentId
            );
            if (planInstIdx !== -1) {
              const currentItem = state.selectedPlan.installments[planInstIdx];
              const newPaid = currentItem.paidAmount + action.payload.amount;
              const newRem = Math.max(0, currentItem.amount - newPaid);
              state.selectedPlan.installments[planInstIdx] = {
                ...currentItem,
                paidAmount: newPaid,
                remainingAmount: newRem,
                status: newRem <= 0 ? 'Paid' : 'PartiallyPaid',
              };
              state.selectedPlan.totalPaid += action.payload.amount;
              state.selectedPlan.remainingAmount = Math.max(0, state.selectedPlan.remainingAmount - action.payload.amount);
            }
          }
        }
      )
      .addCase(paySingleInstallment.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to process installment payment';
      });
  },
});

export const {
  setInstallmentFilters,
  resetInstallmentFilters,
  setInstallmentPageNumber,
  setInstallmentPageSize,
  clearSelectedPlan,
  resetInstallmentActionStatus,
  clearInstallmentError,
} = purchasingInstallmentsSlice.actions;

export const purchasingInstallmentsReducer = purchasingInstallmentsSlice.reducer;
export default purchasingInstallmentsSlice.reducer;
