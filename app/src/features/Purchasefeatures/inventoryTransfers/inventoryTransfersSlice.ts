import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryTransfersApi } from '../../../shared/Purchaseshared/api/inventoryTransfersApi';
import type {
  InventoryTransfer,
  InventoryTransfersFilterQuery,
  CreateRestaurantTransferRequest,
  CreateAdHocTransferRequest,
  PurchasingInventoryItem,
  RestaurantMaterialRequest,
} from '../../../models/Purchasemodels/InventoryTransfer';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface InventoryTransfersState {
  transfers: InventoryTransfer[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  status: AsyncStatus;
  selectedTransfer: InventoryTransfer | null;
  detailStatus: AsyncStatus;
  actionStatus: AsyncStatus;
  purchasingInventory: PurchasingInventoryItem[];
  inventoryStatus: AsyncStatus;
  materialRequests: RestaurantMaterialRequest[];
  materialRequestsStatus: AsyncStatus;
  warehouses: Array<{ warehouseId: number; warehouseName: string; restaurantId: number; restaurantName: string }>;
  error: string | null;
}

const initialState: InventoryTransfersState = {
  transfers: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 1,
  status: 'idle',
  selectedTransfer: null,
  detailStatus: 'idle',
  actionStatus: 'idle',
  purchasingInventory: [],
  inventoryStatus: 'idle',
  materialRequests: [],
  materialRequestsStatus: 'idle',
  warehouses: [],
  error: null,
};

// Async Thunks
export const fetchTransfers = createAsyncThunk(
  'inventoryTransfers/fetchTransfers',
  async (params: InventoryTransfersFilterQuery | undefined, { rejectWithValue }) => {
    try {
      const res = await inventoryTransfersApi.getTransfers(params);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch inventory transfers';
      return rejectWithValue(msg);
    }
  }
);

export const fetchTransferById = createAsyncThunk(
  'inventoryTransfers/fetchTransferById',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await inventoryTransfersApi.getTransferById(id);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch transfer details';
      return rejectWithValue(msg);
    }
  }
);

export const createRestaurantTransfer = createAsyncThunk(
  'inventoryTransfers/createRestaurantTransfer',
  async (payload: CreateRestaurantTransferRequest, { rejectWithValue }) => {
    try {
      const res = await inventoryTransfersApi.createRestaurantTransfer(payload);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create restaurant transfer';
      return rejectWithValue(msg);
    }
  }
);

export const createAdHocTransfer = createAsyncThunk(
  'inventoryTransfers/createAdHocTransfer',
  async (payload: CreateAdHocTransferRequest, { rejectWithValue }) => {
    try {
      const res = await inventoryTransfersApi.createAdHocTransfer(payload);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create ad-hoc transfer';
      return rejectWithValue(msg);
    }
  }
);

export const confirmTransfer = createAsyncThunk(
  'inventoryTransfers/confirmTransfer',
  async (id: number, { rejectWithValue }) => {
    try {
      await inventoryTransfersApi.confirmTransfer(id);
      return id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm transfer';
      return rejectWithValue(msg);
    }
  }
);

export const cancelTransfer = createAsyncThunk(
  'inventoryTransfers/cancelTransfer',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      await inventoryTransfersApi.cancelTransfer(id, reason);
      return { id, reason };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel transfer';
      return rejectWithValue(msg);
    }
  }
);

export const fetchPurchasingInventory = createAsyncThunk(
  'inventoryTransfers/fetchPurchasingInventory',
  async (_, { rejectWithValue }) => {
    try {
      const items = await inventoryTransfersApi.getPurchasingInventory();
      return items;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch purchasing inventory';
      return rejectWithValue(msg);
    }
  }
);

export const fetchRestaurantMaterialRequests = createAsyncThunk(
  'inventoryTransfers/fetchRestaurantMaterialRequests',
  async (_, { rejectWithValue }) => {
    try {
      const requests = await inventoryTransfersApi.getRestaurantMaterialRequests();
      return requests;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch restaurant material requests';
      return rejectWithValue(msg);
    }
  }
);

export const fetchRestaurantWarehouses = createAsyncThunk(
  'inventoryTransfers/fetchRestaurantWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const warehouses = await inventoryTransfersApi.getRestaurantInventory();
      return warehouses;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch restaurant warehouses';
      return rejectWithValue(msg);
    }
  }
);

export const inventoryTransfersSlice = createSlice({
  name: 'inventoryTransfers',
  initialState,
  reducers: {
    clearSelectedTransfer: (state) => {
      state.selectedTransfer = null;
      state.detailStatus = 'idle';
    },
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchTransfers
    builder
      .addCase(fetchTransfers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.transfers = action.payload.items || [];
        state.totalCount = action.payload.totalCount || 0;
        state.pageNumber = action.payload.pageNumber || 1;
        state.pageSize = action.payload.pageSize || 20;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to load transfers';
      });

    // fetchTransferById
    builder
      .addCase(fetchTransferById.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchTransferById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selectedTransfer = action.payload;
      })
      .addCase(fetchTransferById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to load transfer detail';
      });

    // createRestaurantTransfer
    builder
      .addCase(createRestaurantTransfer.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(createRestaurantTransfer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.transfers.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createRestaurantTransfer.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to create transfer';
      });

    // createAdHocTransfer
    builder
      .addCase(createAdHocTransfer.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(createAdHocTransfer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.transfers.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(createAdHocTransfer.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to create ad-hoc transfer';
      });

    // confirmTransfer
    builder
      .addCase(confirmTransfer.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(confirmTransfer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const id = action.payload;
        const target = state.transfers.find((t) => t.id === id);
        if (target) {
          target.status = 'Confirmed';
          target.confirmedAt = new Date().toISOString();
        }
        if (state.selectedTransfer && state.selectedTransfer.id === id) {
          state.selectedTransfer.status = 'Confirmed';
          state.selectedTransfer.confirmedAt = new Date().toISOString();
        }
      })
      .addCase(confirmTransfer.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to confirm transfer';
      });

    // cancelTransfer
    builder
      .addCase(cancelTransfer.pending, (state) => {
        state.actionStatus = 'loading';
      })
      .addCase(cancelTransfer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const { id } = action.payload;
        const target = state.transfers.find((t) => t.id === id);
        if (target) {
          target.status = 'Cancelled';
        }
        if (state.selectedTransfer && state.selectedTransfer.id === id) {
          state.selectedTransfer.status = 'Cancelled';
        }
      })
      .addCase(cancelTransfer.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to cancel transfer';
      });

    // fetchPurchasingInventory
    builder
      .addCase(fetchPurchasingInventory.pending, (state) => {
        state.inventoryStatus = 'loading';
      })
      .addCase(fetchPurchasingInventory.fulfilled, (state, action) => {
        state.inventoryStatus = 'succeeded';
        state.purchasingInventory = action.payload;
      })
      .addCase(fetchPurchasingInventory.rejected, (state) => {
        state.inventoryStatus = 'failed';
      });

    // fetchRestaurantMaterialRequests
    builder
      .addCase(fetchRestaurantMaterialRequests.pending, (state) => {
        state.materialRequestsStatus = 'loading';
      })
      .addCase(fetchRestaurantMaterialRequests.fulfilled, (state, action) => {
        state.materialRequestsStatus = 'succeeded';
        state.materialRequests = action.payload;
      })
      .addCase(fetchRestaurantMaterialRequests.rejected, (state) => {
        state.materialRequestsStatus = 'failed';
      });

    // fetchRestaurantWarehouses
    builder.addCase(fetchRestaurantWarehouses.fulfilled, (state, action) => {
      state.warehouses = action.payload;
    });
  },
});

export const { clearSelectedTransfer, resetActionStatus } = inventoryTransfersSlice.actions;
export const inventoryTransfersReducer = inventoryTransfersSlice.reducer;
