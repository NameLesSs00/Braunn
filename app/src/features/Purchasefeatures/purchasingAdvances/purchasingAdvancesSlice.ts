import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { purchasingAdvancesApi } from '../../../shared/Purchaseshared/api/purchasingAdvancesApi';
import type {
  PurchasingAdvance,
  PurchasingAdvancesQueryParams,
  PaginatedPurchasingAdvances,
  CreatePurchasingAdvanceDto,
  UpdatePurchasingAdvanceDto,
} from '../../../models/Purchasemodels/PurchasingAdvance';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PurchasingAdvancesFilters {
  supplierId?: number;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export interface PurchasingAdvancesState {
  advances: PurchasingAdvance[];
  selectedAdvance: PurchasingAdvance | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  filters: PurchasingAdvancesFilters;
  fetchStatus: AsyncStatus;
  detailsStatus: AsyncStatus;
  actionStatus: AsyncStatus;
  error: string | null;
}

const initialState: PurchasingAdvancesState = {
  advances: [],
  selectedAdvance: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
  filters: {},
  fetchStatus: 'idle',
  detailsStatus: 'idle',
  actionStatus: 'idle',
  error: null,
};

// Async Thunks
export const fetchPurchasingAdvances = createAsyncThunk(
  'purchasingAdvances/fetchPurchasingAdvances',
  async (params: PurchasingAdvancesQueryParams | undefined, { rejectWithValue, signal }) => {
    try {
      return await purchasingAdvancesApi.getAdvances(params, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchasing advances');
    }
  }
);

export const fetchPurchasingAdvanceById = createAsyncThunk(
  'purchasingAdvances/fetchPurchasingAdvanceById',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      return await purchasingAdvancesApi.getAdvanceById(id, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch advance details');
    }
  }
);

export const createPurchasingAdvance = createAsyncThunk(
  'purchasingAdvances/createPurchasingAdvance',
  async (payload: CreatePurchasingAdvanceDto, { rejectWithValue, signal }) => {
    try {
      return await purchasingAdvancesApi.createAdvance(payload, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create purchasing advance');
    }
  }
);

export const updatePurchasingAdvance = createAsyncThunk(
  'purchasingAdvances/updatePurchasingAdvance',
  async (
    { id, payload }: { id: number; payload: UpdatePurchasingAdvanceDto },
    { rejectWithValue, signal }
  ) => {
    try {
      await purchasingAdvancesApi.updateAdvance(id, payload, signal);
      return { id, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update purchasing advance');
    }
  }
);

export const cancelPurchasingAdvance = createAsyncThunk(
  'purchasingAdvances/cancelPurchasingAdvance',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      await purchasingAdvancesApi.cancelAdvance(id, signal);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel purchasing advance');
    }
  }
);

export const deletePurchasingAdvance = createAsyncThunk(
  'purchasingAdvances/deletePurchasingAdvance',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      await purchasingAdvancesApi.deleteAdvance(id, signal);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete purchasing advance');
    }
  }
);

const purchasingAdvancesSlice = createSlice({
  name: 'purchasingAdvances',
  initialState,
  reducers: {
    clearPurchasingAdvancesError: (state) => {
      state.error = null;
    },
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
    },
    setSelectedAdvance: (state, action: PayloadAction<PurchasingAdvance | null>) => {
      state.selectedAdvance = action.payload;
    },
    clearSelectedAdvance: (state) => {
      state.selectedAdvance = null;
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.pageNumber = 1;
    },
    setFilters: (state, action: PayloadAction<PurchasingAdvancesFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pageNumber = 1;
    },
    resetFilters: (state) => {
      state.filters = {};
      state.pageNumber = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPurchasingAdvances
      .addCase(fetchPurchasingAdvances.pending, (state) => {
        state.fetchStatus = 'loading';
        state.error = null;
      })
      .addCase(
        fetchPurchasingAdvances.fulfilled,
        (state, action: PayloadAction<PaginatedPurchasingAdvances>) => {
          state.fetchStatus = 'succeeded';
          const raw = action.payload as any;
          const items = Array.isArray(raw)
            ? raw
            : raw?.data || raw?.Data || raw?.items || raw?.Items || [];
          state.advances = items;
          state.totalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
          state.pageNumber = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : 1);
          state.pageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : 10);
          state.totalPages = Number(raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 1))));
          state.hasPreviousPage = Boolean(raw?.hasPreviousPage ?? (state.pageNumber > 1));
          state.hasNextPage = Boolean(raw?.hasNextPage ?? (state.pageNumber < state.totalPages));
        }
      )
      .addCase(fetchPurchasingAdvances.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch purchasing advances';
      })

      // fetchPurchasingAdvanceById
      .addCase(fetchPurchasingAdvanceById.pending, (state) => {
        state.detailsStatus = 'loading';
        state.error = null;
      })
      .addCase(
        fetchPurchasingAdvanceById.fulfilled,
        (state, action: PayloadAction<PurchasingAdvance>) => {
          state.detailsStatus = 'succeeded';
          state.selectedAdvance = action.payload;
        }
      )
      .addCase(fetchPurchasingAdvanceById.rejected, (state, action) => {
        state.detailsStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch advance details';
      })

      // createPurchasingAdvance
      .addCase(createPurchasingAdvance.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(
        createPurchasingAdvance.fulfilled,
        (state, action: PayloadAction<PurchasingAdvance>) => {
          state.actionStatus = 'succeeded';
          state.advances.unshift(action.payload);
          state.totalCount += 1;
        }
      )
      .addCase(createPurchasingAdvance.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to create purchasing advance';
      })

      // updatePurchasingAdvance
      .addCase(updatePurchasingAdvance.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(
        updatePurchasingAdvance.fulfilled,
        (state, action: PayloadAction<{ id: number; payload: UpdatePurchasingAdvanceDto }>) => {
          state.actionStatus = 'succeeded';
          const index = state.advances.findIndex((a) => a.id === action.payload.id);
          if (index !== -1) {
            state.advances[index] = {
              ...state.advances[index],
              amount: action.payload.payload.amount,
              notes: action.payload.payload.notes,
            };
          }
          if (state.selectedAdvance?.id === action.payload.id) {
            state.selectedAdvance = {
              ...state.selectedAdvance,
              amount: action.payload.payload.amount,
              notes: action.payload.payload.notes,
            };
          }
        }
      )
      .addCase(updatePurchasingAdvance.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to update purchasing advance';
      })

      // cancelPurchasingAdvance
      .addCase(cancelPurchasingAdvance.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(cancelPurchasingAdvance.fulfilled, (state, action: PayloadAction<number>) => {
        state.actionStatus = 'succeeded';
        const index = state.advances.findIndex((a) => a.id === action.payload);
        if (index !== -1) {
          state.advances[index] = {
            ...state.advances[index],
            status: 'Cancelled',
          };
        }
        if (state.selectedAdvance?.id === action.payload) {
          state.selectedAdvance = {
            ...state.selectedAdvance,
            status: 'Cancelled',
          };
        }
      })
      .addCase(cancelPurchasingAdvance.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to cancel purchasing advance';
      })

      // deletePurchasingAdvance
      .addCase(deletePurchasingAdvance.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(deletePurchasingAdvance.fulfilled, (state, action: PayloadAction<number>) => {
        state.actionStatus = 'succeeded';
        state.advances = state.advances.filter((a) => a.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.selectedAdvance?.id === action.payload) {
          state.selectedAdvance = null;
        }
      })
      .addCase(deletePurchasingAdvance.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to delete purchasing advance';
      });
  },
});

export const {
  clearPurchasingAdvancesError,
  resetActionStatus,
  setSelectedAdvance,
  clearSelectedAdvance,
  setPageNumber,
  setPageSize,
  setFilters,
  resetFilters,
} = purchasingAdvancesSlice.actions;

export const purchasingAdvancesReducer = purchasingAdvancesSlice.reducer;
export default purchasingAdvancesSlice.reducer;
