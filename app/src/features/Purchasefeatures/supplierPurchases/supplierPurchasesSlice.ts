import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supplierPurchasesApi } from '../../../shared/Purchaseshared/api/supplierPurchasesApi';
import type {
  SupplierPurchaseListItem,
  SupplierPurchaseDetails,
  SupplierPurchasesQueryParams,
  PaginatedSupplierPurchases,
  CreateSupplierPurchaseDto,
  CreateSupplierPurchaseResponse,
  UpdateSupplierPurchaseDto,
} from '../../../models/Purchasemodels/SupplierPurchase';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface SupplierPurchasesState {
  purchases: SupplierPurchaseListItem[];
  selectedPurchase: SupplierPurchaseListItem | null;
  selectedPurchaseDetails: SupplierPurchaseDetails | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  filters: {
    supplierId?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  status: AsyncStatus;
  detailsStatus: AsyncStatus;
  actionStatus: AsyncStatus;
  error: string | null;
}

const initialState: SupplierPurchasesState = {
  purchases: [],
  selectedPurchase: null,
  selectedPurchaseDetails: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  filters: {},
  status: 'idle',
  detailsStatus: 'idle',
  actionStatus: 'idle',
  error: null,
};

// Async Thunks
export const fetchSupplierPurchases = createAsyncThunk(
  'supplierPurchases/fetchSupplierPurchases',
  async (params: SupplierPurchasesQueryParams | undefined, { rejectWithValue, signal }) => {
    try {
      return await supplierPurchasesApi.getSupplierPurchases(params, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch supplier purchases');
    }
  }
);

export const fetchSupplierPurchaseById = createAsyncThunk(
  'supplierPurchases/fetchSupplierPurchaseById',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      return await supplierPurchasesApi.getSupplierPurchaseById(id, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchase details');
    }
  }
);

export const fetchSupplierPurchaseDetails = createAsyncThunk(
  'supplierPurchases/fetchSupplierPurchaseDetails',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      return await supplierPurchasesApi.getSupplierPurchaseDetails(id, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch purchase items');
    }
  }
);

export const createSupplierPurchase = createAsyncThunk(
  'supplierPurchases/createSupplierPurchase',
  async (payload: CreateSupplierPurchaseDto, { rejectWithValue, signal }) => {
    try {
      return await supplierPurchasesApi.createSupplierPurchase(payload, signal);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create supplier purchase order');
    }
  }
);

export const updateSupplierPurchase = createAsyncThunk(
  'supplierPurchases/updateSupplierPurchase',
  async (
    { id, payload }: { id: number; payload: UpdateSupplierPurchaseDto },
    { rejectWithValue, signal }
  ) => {
    try {
      await supplierPurchasesApi.updateSupplierPurchase(id, payload, signal);
      return { id, payload };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update supplier purchase order');
    }
  }
);

export const deleteSupplierPurchase = createAsyncThunk(
  'supplierPurchases/deleteSupplierPurchase',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      await supplierPurchasesApi.deleteSupplierPurchase(id, signal);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete supplier purchase order');
    }
  }
);

export const receiveSupplierPurchase = createAsyncThunk(
  'supplierPurchases/receiveSupplierPurchase',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      await supplierPurchasesApi.receiveSupplierPurchase(id, signal);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to receive purchase order');
    }
  }
);

const supplierPurchasesSlice = createSlice({
  name: 'supplierPurchases',
  initialState,
  reducers: {
    clearSupplierPurchasesError: (state) => {
      state.error = null;
    },
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
    },
    setSelectedPurchase: (state, action: PayloadAction<SupplierPurchaseListItem | null>) => {
      state.selectedPurchase = action.payload;
    },
    clearSelectedPurchase: (state) => {
      state.selectedPurchase = null;
    },
    clearSelectedPurchaseDetails: (state) => {
      state.selectedPurchaseDetails = null;
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<{
        supplierId?: number;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
      }>
    ) => {
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
      // fetchSupplierPurchases
      .addCase(fetchSupplierPurchases.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchSupplierPurchases.fulfilled,
        (state, action: PayloadAction<PaginatedSupplierPurchases>) => {
          state.status = 'succeeded';
          const raw = action.payload as any;
          const items = Array.isArray(raw)
            ? raw
            : raw?.items || raw?.Items || raw?.data?.items || raw?.data?.Items || raw?.data || [];
          state.purchases = items;
          state.totalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
          state.pageNumber = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : 1);
          state.pageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : 10);
          state.totalPages = Number(raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 1))));
        }
      )
      .addCase(fetchSupplierPurchases.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchSupplierPurchaseById
      .addCase(fetchSupplierPurchaseById.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(
        fetchSupplierPurchaseById.fulfilled,
        (state, action: PayloadAction<SupplierPurchaseListItem>) => {
          state.actionStatus = 'succeeded';
          state.selectedPurchase = action.payload;
        }
      )
      .addCase(fetchSupplierPurchaseById.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      })

      // fetchSupplierPurchaseDetails
      .addCase(fetchSupplierPurchaseDetails.pending, (state) => {
        state.detailsStatus = 'loading';
        state.error = null;
      })
      .addCase(
        fetchSupplierPurchaseDetails.fulfilled,
        (state, action: PayloadAction<SupplierPurchaseDetails>) => {
          state.detailsStatus = 'succeeded';
          state.selectedPurchaseDetails = action.payload;
        }
      )
      .addCase(fetchSupplierPurchaseDetails.rejected, (state, action) => {
        state.detailsStatus = 'failed';
        state.error = action.payload as string;
      })

      // createSupplierPurchase
      .addCase(createSupplierPurchase.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(
        createSupplierPurchase.fulfilled,
        (state, _action: PayloadAction<CreateSupplierPurchaseResponse>) => {
          state.actionStatus = 'succeeded';
        }
      )
      .addCase(createSupplierPurchase.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      })

      // updateSupplierPurchase
      .addCase(updateSupplierPurchase.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(updateSupplierPurchase.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const { id, payload } = action.payload;
        const index = state.purchases.findIndex((p) => p.id === id);
        if (index !== -1) {
          state.purchases[index] = {
            ...state.purchases[index],
            purchaseDate: payload.purchaseDate,
            notes: payload.notes ?? state.purchases[index].notes,
          };
        }
        if (state.selectedPurchase && state.selectedPurchase.id === id) {
          state.selectedPurchase = {
            ...state.selectedPurchase,
            purchaseDate: payload.purchaseDate,
            notes: payload.notes ?? state.selectedPurchase.notes,
          };
        }
        if (state.selectedPurchaseDetails && state.selectedPurchaseDetails.id === id) {
          state.selectedPurchaseDetails = {
            ...state.selectedPurchaseDetails,
            purchaseDate: payload.purchaseDate,
            notes: payload.notes ?? state.selectedPurchaseDetails.notes,
          };
        }
      })
      .addCase(updateSupplierPurchase.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      })

      // deleteSupplierPurchase
      .addCase(deleteSupplierPurchase.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteSupplierPurchase.fulfilled, (state, action: PayloadAction<number>) => {
        state.actionStatus = 'succeeded';
        state.purchases = state.purchases.filter((p) => p.id !== action.payload);
        state.totalCount = Math.max(0, state.totalCount - 1);
        if (state.selectedPurchase?.id === action.payload) {
          state.selectedPurchase = null;
        }
        if (state.selectedPurchaseDetails?.id === action.payload) {
          state.selectedPurchaseDetails = null;
        }
      })
      .addCase(deleteSupplierPurchase.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      })

      // receiveSupplierPurchase
      .addCase(receiveSupplierPurchase.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(receiveSupplierPurchase.fulfilled, (state, action: PayloadAction<number>) => {
        state.actionStatus = 'succeeded';
        const index = state.purchases.findIndex((p) => p.id === action.payload);
        if (index !== -1) {
          state.purchases[index].purchaseStatus = 'Received';
        }
        if (state.selectedPurchase && state.selectedPurchase.id === action.payload) {
          state.selectedPurchase.purchaseStatus = 'Received';
        }
        if (state.selectedPurchaseDetails && state.selectedPurchaseDetails.id === action.payload) {
          state.selectedPurchaseDetails.purchaseStatus = 'Received';
        }
      })
      .addCase(receiveSupplierPurchase.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {
  clearSupplierPurchasesError,
  resetActionStatus,
  setSelectedPurchase,
  clearSelectedPurchase,
  clearSelectedPurchaseDetails,
  setPageNumber,
  setPageSize,
  setFilters,
  resetFilters,
} = supplierPurchasesSlice.actions;

export const supplierPurchasesReducer = supplierPurchasesSlice.reducer;
