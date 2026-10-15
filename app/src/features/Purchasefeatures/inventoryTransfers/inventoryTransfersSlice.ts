import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { inventoryTransfersApi } from '../../../shared/Purchaseshared/api/inventoryTransfersApi';
import { getLaundryPurchases } from '../../../shared/Laundryshared/api/laundryPurchasesApi';
import { getHkmPurchases } from '../../../shared/HKshared/api/hkmPurchasesApi';
import { getMaintenancePurchases } from '../../../shared/apis/maintenancePurchasesApi';
import type {
  InventoryTransfer,
  InventoryTransfersFilterQuery,
  CreateRestaurantTransferRequest,
  CreateAdHocTransferRequest,
  PurchasingInventoryItem,
  PurchasingInventoryDetail,
  PurchasingInventoryFilterQuery,
  RestaurantMaterialRequest,
  RestaurantMaterialRequestFilterQuery,
  UnifiedDepartmentRequest,
} from '../../../models/Purchasemodels/InventoryTransfer';

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface InventoryTransfersState {
  // Navigation
  activeTab: 'stock' | 'transfers' | 'requests';

  // Central Inventory Stock
  inventoryItems: PurchasingInventoryItem[];
  inventoryTotalCount: number;
  inventoryPage: number;
  inventoryPageSize: number;
  inventoryTotalPages: number;
  totalValuation: number;
  inventoryStatus: AsyncStatus;
  selectedInventoryItem: PurchasingInventoryDetail | null;
  inventoryDetailStatus: AsyncStatus;

  // Inventory Transfers
  transfers: InventoryTransfer[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  status: AsyncStatus;
  selectedTransfer: InventoryTransfer | null;
  detailStatus: AsyncStatus;
  actionStatus: AsyncStatus;

  // Lookups & Integrations
  purchasingInventory: PurchasingInventoryItem[];
  materialRequests: RestaurantMaterialRequest[];
  materialRequestsTotalCount: number;
  materialRequestsStatus: AsyncStatus;
  warehouses: Array<{ warehouseId: number; warehouseName: string; restaurantId: number; restaurantName: string }>;

  // Cross-department incoming purchase requests
  departmentRequests: UnifiedDepartmentRequest[];
  departmentRequestsStatus: AsyncStatus;

  // General error
  error: string | null;
}

const initialState: InventoryTransfersState = {
  activeTab: 'stock',

  inventoryItems: [],
  inventoryTotalCount: 0,
  inventoryPage: 1,
  inventoryPageSize: 20,
  inventoryTotalPages: 1,
  totalValuation: 0,
  inventoryStatus: 'idle',
  selectedInventoryItem: null,
  inventoryDetailStatus: 'idle',

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
  materialRequests: [],
  materialRequestsTotalCount: 0,
  materialRequestsStatus: 'idle',
  warehouses: [],

  departmentRequests: [],
  departmentRequestsStatus: 'idle',

  error: null,
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchMainInventory = createAsyncThunk(
  'inventoryTransfers/fetchMainInventory',
  async (params: PurchasingInventoryFilterQuery | undefined, { rejectWithValue }) => {
    try {
      const res = await inventoryTransfersApi.getMainInventory(params);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch main inventory stock';
      return rejectWithValue(msg);
    }
  }
);

export const fetchMainInventoryItemById = createAsyncThunk(
  'inventoryTransfers/fetchMainInventoryItemById',
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await inventoryTransfersApi.getMainInventoryItemById(id);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch inventory item details';
      return rejectWithValue(msg);
    }
  }
);

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
  async (params: RestaurantMaterialRequestFilterQuery | undefined, { rejectWithValue }) => {
    try {
      const res = await inventoryTransfersApi.getRestaurantMaterialRequests(params);
      return res;
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

export const fetchDepartmentRequests = createAsyncThunk(
  'inventoryTransfers/fetchDepartmentRequests',
  async (_, { rejectWithValue }) => {
    try {
      const results = await Promise.allSettled([
        getLaundryPurchases({ Status: 'Pending', PageSize: 50 }),
        getHkmPurchases({ Status: 'Pending', PageSize: 50 }),
        getMaintenancePurchases({ status: 'Pending', pageSize: 50 }),
        inventoryTransfersApi.getRestaurantMaterialRequests({ status: 'Pending' }),
      ]);

      const unified: UnifiedDepartmentRequest[] = [];

      // 1. Laundry
      if (results[0].status === 'fulfilled') {
        const laundryData = results[0].value;
        const items = Array.isArray(laundryData?.items) ? laundryData.items : [];
        items.forEach((p) => {
          const rawItems = Array.isArray(p.items) ? p.items : (p as any).purchaseItems || [];
          unified.push({
            id: p.id,
            department: 'Laundry',
            referenceCode: `#LND-${p.id}`,
            requesterName:
              p.createdByName ||
              (p.createdBy && !/^[0-9a-fA-F-]{32,36}$/.test(p.createdBy)
                ? p.createdBy
                : 'Laundry Staff'),
            requiredDate: p.requiredDate || p.createdAt,
            status: p.status,
            itemsCount: rawItems.length,
            items: rawItems.map((it: any) => ({
              itemId: it.itemId || it.id || 0,
              itemName: it.itemName || it.name || `Laundry item #${it.itemId || it.id}`,
              quantity: it.quantity || 1,
              priority: it.priority || 'Normal',
            })),
            rawRequest: p,
          });
        });
      }

      // 2. Housekeeping
      if (results[1].status === 'fulfilled') {
        const hkData = results[1].value;
        const items = Array.isArray(hkData?.items) ? hkData.items : [];
        items.forEach((p) => {
          const rawItems = Array.isArray(p.items) ? p.items : (p as any).purchaseItems || [];
          unified.push({
            id: p.id,
            department: 'Housekeeping',
            referenceCode: `#HK-${p.id}`,
            requesterName:
              p.createdByName ||
              (p.createdBy && !/^[0-9a-fA-F-]{32,36}$/.test(p.createdBy)
                ? p.createdBy
                : 'Housekeeping Staff'),
            requiredDate: p.requiredDate || p.createdAt,
            status: p.status,
            itemsCount: rawItems.length,
            items: rawItems.map((it: any) => ({
              itemId: it.itemId || it.id || 0,
              itemName: it.itemName || it.name || `Housekeeping item #${it.itemId || it.id}`,
              quantity: it.quantity || 1,
              priority: it.priority || 'Normal',
            })),
            rawRequest: p,
          });
        });
      }

      // 3. Maintenance
      if (results[2].status === 'fulfilled') {
        const mntData = results[2].value;
        const items = Array.isArray(mntData?.items) ? mntData.items : [];
        items.forEach((p) => {
          const rawItems = Array.isArray((p as any).items) ? (p as any).items : [];
          unified.push({
            id: p.id,
            department: 'Maintenance',
            referenceCode: `#MNT-${p.id}`,
            requesterName:
              p.createdByName ||
              (p.createdBy && !/^[0-9a-fA-F-]{32,36}$/.test(p.createdBy)
                ? p.createdBy
                : 'Maintenance Staff'),
            requiredDate: p.requiredDate || p.createdAt,
            status: p.status,
            itemsCount: rawItems.length || p.itemCount || 1,
            items:
              rawItems.length > 0
                ? rawItems.map((it: any) => ({
                    itemId: it.itemId || it.id || 0,
                    itemName: it.itemName || it.name || `Maintenance item #${it.itemId || it.id}`,
                    quantity: it.quantity || 1,
                    priority: it.priority || 'Normal',
                  }))
                : [
                    {
                      itemId: p.id,
                      itemName: p.reason || `Maintenance request #${p.id}`,
                      quantity: p.itemCount || 1,
                      priority: 'Normal',
                    },
                  ],
            rawRequest: p,
          });
        });
      }

      // 4. Restaurant
      if (results[3].status === 'fulfilled') {
        const restData = results[3].value;
        const items = Array.isArray(restData) ? restData : (restData as any)?.items || [];
        items.forEach((r: any) => {
          const rawItems = Array.isArray(r.items) ? r.items : [];
          unified.push({
            id: r.id,
            department: 'Restaurant',
            referenceCode: r.requestNumber || `#REST-${r.id}`,
            requesterName: r.restaurantName || r.createdBy || 'Kitchen Staff',
            requiredDate: r.requestDate || r.createdAt,
            status: r.status,
            itemsCount: rawItems.length,
            items: rawItems.map((it: any) => ({
              itemId: it.materialId || it.id || 0,
              itemName: it.materialName || `Material #${it.materialId}`,
              quantity: it.requestedQuantity || 1,
              unitId: it.unitId,
              unitSymbol: it.unitSymbol,
            })),
            rawRequest: r,
          });
        });
      }

      return unified;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch department requests';
      return rejectWithValue(msg);
    }
  }
);

// ==========================================
// SLICE
// ==========================================

export const inventoryTransfersSlice = createSlice({
  name: 'inventoryTransfers',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'stock' | 'transfers' | 'requests'>) => {
      state.activeTab = action.payload;
    },
    clearSelectedTransfer: (state) => {
      state.selectedTransfer = null;
      state.detailStatus = 'idle';
    },
    clearSelectedInventoryItem: (state) => {
      state.selectedInventoryItem = null;
      state.inventoryDetailStatus = 'idle';
    },
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMainInventory
    builder
      .addCase(fetchMainInventory.pending, (state) => {
        state.inventoryStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchMainInventory.fulfilled, (state, action) => {
        state.inventoryStatus = 'succeeded';
        const raw = action.payload as any;
        const items = Array.isArray(raw)
          ? raw
          : raw?.items || raw?.Items || raw?.data?.items || raw?.data?.Items || raw?.data || [];
        state.inventoryItems = items;
        state.inventoryTotalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
        state.inventoryPage = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : 1);
        state.inventoryPageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : 20);
        state.inventoryTotalPages = Number(raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(state.inventoryTotalCount / (state.inventoryPageSize || 1))));
        state.totalValuation = Number(raw?.totalValuation ?? raw?.TotalValuation ?? 0);
      })
      .addCase(fetchMainInventory.rejected, (state, action) => {
        state.inventoryStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to load main inventory';
      });

    // fetchMainInventoryItemById
    builder
      .addCase(fetchMainInventoryItemById.pending, (state) => {
        state.inventoryDetailStatus = 'loading';
      })
      .addCase(fetchMainInventoryItemById.fulfilled, (state, action) => {
        state.inventoryDetailStatus = 'succeeded';
        state.selectedInventoryItem = action.payload;
      })
      .addCase(fetchMainInventoryItemById.rejected, (state, action) => {
        state.inventoryDetailStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to load inventory item details';
      });

    // fetchTransfers
    builder
      .addCase(fetchTransfers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const raw = action.payload as any;
        const items = Array.isArray(raw)
          ? raw
          : raw?.items || raw?.Items || raw?.data?.items || raw?.data?.Items || raw?.data || [];
        state.transfers = items;
        state.totalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
        state.pageNumber = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : 1);
        state.pageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : 20);
        state.totalPages = Number(raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(state.totalCount / (state.pageSize || 1))));
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
        state.error = null;
      })
      .addCase(createRestaurantTransfer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.transfers.unshift(action.payload);
        state.totalCount += 1;

        // Instantly remove fulfilled material request from pending list
        const fulfilledReqId =
          action.payload.materialRequestId || action.meta.arg.materialRequestId;
        if (fulfilledReqId) {
          state.materialRequests = state.materialRequests.filter(
            (r) => r.id !== fulfilledReqId
          );
          if (state.materialRequestsTotalCount > 0) {
            state.materialRequestsTotalCount -= 1;
          }
        }

        // Deduct transferred stock from central storage
        if (action.payload.items && action.payload.items.length > 0) {
          action.payload.items.forEach((transferredItem) => {
            const found = state.purchasingInventory.find(
              (p) => p.itemId === transferredItem.materialId
            );
            if (found) {
              found.quantity = Math.max(0, found.quantity - transferredItem.transferredQuantity);
            }
            const foundInCatalog = state.inventoryItems.find(
              (p) => (p.itemId || p.id) === transferredItem.materialId
            );
            if (foundInCatalog) {
              foundInCatalog.quantity = Math.max(
                0,
                foundInCatalog.quantity - transferredItem.transferredQuantity
              );
            }
          });
        }
      })
      .addCase(createRestaurantTransfer.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to create transfer';
      });

    // createAdHocTransfer
    builder
      .addCase(createAdHocTransfer.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(createAdHocTransfer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.transfers.unshift(action.payload);
        state.totalCount += 1;

        // Deduct transferred quantity from central storage
        const transferredItemId = action.meta.arg.itemId;
        const transferredQty = action.meta.arg.quantity || 0;

        const found = state.purchasingInventory.find(
          (p) => p.itemId === transferredItemId
        );
        if (found) {
          found.quantity = Math.max(0, found.quantity - transferredQty);
        }
        const foundInCatalog = state.inventoryItems.find(
          (p) => (p.itemId || p.id) === transferredItemId
        );
        if (foundInCatalog) {
          foundInCatalog.quantity = Math.max(
            0,
            foundInCatalog.quantity - transferredQty
          );
        }
      })
      .addCase(createAdHocTransfer.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to create transfer';
      });

    // confirmTransfer
    builder
      .addCase(confirmTransfer.pending, (state) => {
        state.actionStatus = 'loading';
        state.error = null;
      })
      .addCase(confirmTransfer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const item = state.transfers.find((t) => t.id === action.payload);
        if (item) {
          item.status = 'Confirmed';
        }
        if (state.selectedTransfer && state.selectedTransfer.id === action.payload) {
          state.selectedTransfer.status = 'Confirmed';
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
        state.error = null;
      })
      .addCase(cancelTransfer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const item = state.transfers.find((t) => t.id === action.payload.id);
        if (item) {
          item.status = 'Cancelled';
        }
        if (state.selectedTransfer && state.selectedTransfer.id === action.payload.id) {
          state.selectedTransfer.status = 'Cancelled';
        }
      })
      .addCase(cancelTransfer.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to cancel transfer';
      });

    // fetchPurchasingInventory
    builder
      .addCase(fetchPurchasingInventory.fulfilled, (state, action) => {
        state.purchasingInventory = action.payload;
      });

    // fetchRestaurantMaterialRequests
    builder
      .addCase(fetchRestaurantMaterialRequests.pending, (state) => {
        state.materialRequestsStatus = 'loading';
      })
      .addCase(fetchRestaurantMaterialRequests.fulfilled, (state, action) => {
        state.materialRequestsStatus = 'succeeded';
        state.materialRequests = action.payload.items;
        state.materialRequestsTotalCount = action.payload.totalCount;
      })
      .addCase(fetchRestaurantMaterialRequests.rejected, (state) => {
        state.materialRequestsStatus = 'failed';
      });

    // fetchRestaurantWarehouses
    builder
      .addCase(fetchRestaurantWarehouses.fulfilled, (state, action) => {
        state.warehouses = action.payload;
      });

    // fetchDepartmentRequests
    builder
      .addCase(fetchDepartmentRequests.pending, (state) => {
        state.departmentRequestsStatus = 'loading';
      })
      .addCase(fetchDepartmentRequests.fulfilled, (state, action) => {
        state.departmentRequestsStatus = 'succeeded';
        state.departmentRequests = action.payload;
      })
      .addCase(fetchDepartmentRequests.rejected, (state, action) => {
        state.departmentRequestsStatus = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch department requests';
      });
  },
});

export const {
  setActiveTab,
  clearSelectedTransfer,
  clearSelectedInventoryItem,
  resetActionStatus,
} = inventoryTransfersSlice.actions;

export const inventoryTransfersReducer = inventoryTransfersSlice.reducer;
export default inventoryTransfersSlice.reducer;
