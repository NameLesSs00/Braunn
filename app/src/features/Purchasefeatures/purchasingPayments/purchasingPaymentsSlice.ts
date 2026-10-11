import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { purchasingPaymentsApi } from '../../../shared/Purchaseshared/api/purchasingPaymentsApi';
import type {
  CashPaymentDto,
  CashPaymentResponse,
  AdvancePaymentDto,
  AdvancePaymentResponse,
  MixedPaymentDto,
  MixedPaymentResponse,
} from '../../../models/Purchasemodels/PurchasingPayment';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PurchasingPaymentsState {
  actionStatus: AsyncStatus;
  lastTransaction: CashPaymentResponse | AdvancePaymentResponse | MixedPaymentResponse | null;
  error: string | null;
}

const initialState: PurchasingPaymentsState = {
  actionStatus: 'idle',
  lastTransaction: null,
  error: null,
};

export const processCashPayment = createAsyncThunk(
  'purchasingPayments/processCashPayment',
  async (payload: CashPaymentDto, { rejectWithValue, signal }) => {
    try {
      return await purchasingPaymentsApi.payCash(payload, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to process cash payment');
    }
  }
);

export const processAdvancePayment = createAsyncThunk(
  'purchasingPayments/processAdvancePayment',
  async (payload: AdvancePaymentDto, { rejectWithValue, signal }) => {
    try {
      return await purchasingPaymentsApi.payAdvance(payload, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to process advance payment');
    }
  }
);

export const processMixedPayment = createAsyncThunk(
  'purchasingPayments/processMixedPayment',
  async (payload: MixedPaymentDto, { rejectWithValue, signal }) => {
    try {
      return await purchasingPaymentsApi.payMixed(payload, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to process mixed payment');
    }
  }
);

const purchasingPaymentsSlice = createSlice({
  name: 'purchasingPayments',
  initialState,
  reducers: {
    resetPaymentActionStatus: (state) => {
      state.actionStatus = 'idle';
      state.error = null;
    },
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearLastTransaction: (state) => {
      state.lastTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cash payment
      .addCase(processCashPayment.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(
        processCashPayment.fulfilled,
        (state, action: PayloadAction<CashPaymentResponse>) => {
          state.actionStatus = 'succeeded';
          state.lastTransaction = action.payload;
        }
      )
      .addCase(processCashPayment.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to process cash payment';
      })

      // Advance payment
      .addCase(processAdvancePayment.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(
        processAdvancePayment.fulfilled,
        (state, action: PayloadAction<AdvancePaymentResponse>) => {
          state.actionStatus = 'succeeded';
          state.lastTransaction = action.payload;
        }
      )
      .addCase(processAdvancePayment.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to process advance payment';
      })

      // Mixed payment
      .addCase(processMixedPayment.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(
        processMixedPayment.fulfilled,
        (state, action: PayloadAction<MixedPaymentResponse>) => {
          state.actionStatus = 'succeeded';
          state.lastTransaction = action.payload;
        }
      )
      .addCase(processMixedPayment.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to process mixed payment';
      });
  },
});

export const { resetPaymentActionStatus, clearPaymentError, clearLastTransaction } =
  purchasingPaymentsSlice.actions;

export const purchasingPaymentsReducer = purchasingPaymentsSlice.reducer;
export default purchasingPaymentsSlice.reducer;
