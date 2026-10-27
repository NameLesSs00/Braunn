import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import { changeLaundryPurchaseStatus } from '../../Laundryshared/api/laundryPurchasesApi';
import { updateHkmPurchaseStatus } from '../../HKshared/api/hkmPurchasesApi';
import { updateMaintenancePurchaseStatus } from '../../apis/maintenancePurchasesApi';
import type {
  InventoryTransfer,
  InventoryTransfersFilterQuery,
  InventoryTransfersPaginatedResponse,
  CreateRestaurantTransferRequest,
  CreateAdHocTransferRequest,
  PurchasingInventoryItem,
  PurchasingInventoryDetail,
  PurchasingInventoryPaginatedResponse,
  PurchasingInventoryFilterQuery,
  RestaurantMaterialRequest,
  RestaurantMaterialRequestFilterQuery,
} from '../../../models/Purchasemodels/InventoryTransfer';

/**
 * Updates the status of a department purchase/requisition (e.g. to 'Viewed') when staged/dispatched via transfer.
 */
export async function updateDepartmentRequisitionStatus(
  department: 'Laundry' | 'Housekeeping' | 'Maintenance' | 'Restaurant' | string,
  requisitionId: number,
  action: string = 'view'
): Promise<void> {
  const dept = (department || '').trim().toLowerCase();
  if (dept === 'laundry') {
    await changeLaundryPurchaseStatus(requisitionId, action);
  } else if (dept === 'housekeeping') {
    await updateHkmPurchaseStatus(requisitionId, action);
  } else if (dept === 'maintenance') {
    await updateMaintenancePurchaseStatus(requisitionId, action);
  }
}

export const inventoryTransfersApi = {
  // ==========================================
  // CENTRAL MAIN INVENTORY (STOCK CATALOG)
  // ==========================================

  /**
   * Get paginated Central Purchasing Stock / Inventory
   */
  getMainInventory: async (
    params?: PurchasingInventoryFilterQuery,
    signal?: AbortSignal
  ): Promise<PurchasingInventoryPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    const pageNum = params?.pageNumber && params.pageNumber > 0 ? params.pageNumber : 1;
    searchParams.append('PageNumber', pageNum.toString());

    const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 20;
    searchParams.append('PageSize', pageSize.toString());

    if (params?.purchaseType && params.purchaseType !== 'ALL') {
      searchParams.append('PurchaseType', params.purchaseType);
    }
    if (params?.isActive !== undefined) {
      searchParams.append('IsActive', params.isActive.toString());
    }
    if (params?.lowStockOnly) {
      searchParams.append('LowStockOnly', 'true');
    }
    if (params?.search) {
      searchParams.append('Search', params.search);
    }

    const qs = searchParams.toString();
    const path = qs ? `purchasing/inventory?${qs}` : 'purchasing/inventory';

    const res = await apiRequest<unknown>({
      method: 'GET',
      path,
      signal,
    });

    const parsed = unwrapApiResponse<PurchasingInventoryPaginatedResponse>(res);
    const raw = parsed as any;
    const items = Array.isArray(raw)
      ? raw
      : raw?.items || raw?.Items || raw?.data?.items || raw?.data?.Items || raw?.data || [];
    const totalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
    const pageNumber = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : pageNum);
    const resolvedPageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : pageSize);
    const totalPages = Number(
      raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(totalCount / (resolvedPageSize || 1)))
    );
    const totalValuation = Number(raw?.totalValuation ?? raw?.TotalValuation ?? 0);

    return {
      items,
      totalCount,
      pageNumber,
      pageSize: resolvedPageSize,
      totalPages,
      totalValuation,
    };
  },

  /**
   * Get Central Purchasing Stock item by ID with Recent Transactions history
   */
  getMainInventoryItemById: async (
    id: number,
    signal?: AbortSignal
  ): Promise<PurchasingInventoryDetail> => {
    const res = await apiRequest<unknown>({
      method: 'GET',
      path: `purchasing/inventory/${id}`,
      signal,
    });

    return unwrapApiResponse<PurchasingInventoryDetail>(res);
  },

  /**
   * Quick lookup for purchasing inventory (for dropdowns)
   */
  getPurchasingInventory: async (
    signal?: AbortSignal
  ): Promise<PurchasingInventoryItem[]> => {
    const res = await apiRequest<unknown>({
      method: 'GET',
      path: 'purchasing/inventory?PageSize=100',
      signal,
    });

    const parsed = unwrapApiResponse<{ items: PurchasingInventoryItem[] } | PurchasingInventoryItem[]>(res);
    if (Array.isArray(parsed)) return parsed;
    return parsed?.items || [];
  },

  // ==========================================
  // INVENTORY TRANSFERS
  // ==========================================

  /**
   * Get paginated inventory transfers with optional query filters
   * GET /api/purchasing/inventory/transfer
   */
  getTransfers: async (
    params?: InventoryTransfersFilterQuery,
    signal?: AbortSignal
  ): Promise<InventoryTransfersPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    const pageNum = params?.pageNumber && params.pageNumber > 0 ? params.pageNumber : 1;
    searchParams.append('PageNumber', pageNum.toString());

    const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 20;
    searchParams.append('PageSize', pageSize.toString());

    if (params?.departmentType && params.departmentType !== 'ALL') {
      searchParams.append('DepartmentType', params.departmentType);
    }
    if (params?.itemId !== undefined) {
      searchParams.append('ItemId', params.itemId.toString());
    }
    if (params?.dateFrom) {
      searchParams.append('DateFrom', params.dateFrom);
    }
    if (params?.dateTo) {
      searchParams.append('DateTo', params.dateTo);
    }

    const qs = searchParams.toString();
    const path = qs ? `purchasing/inventory/transfer?${qs}` : 'purchasing/inventory/transfer';

    const res = await apiRequest<unknown>({
      method: 'GET',
      path,
      signal,
    });

    const parsed = unwrapApiResponse<InventoryTransfersPaginatedResponse>(res);
    const raw = parsed as any;
    const items = Array.isArray(raw)
      ? raw
      : raw?.items || raw?.Items || raw?.data?.items || raw?.data?.Items || raw?.data || [];
    const totalCount = Number(raw?.totalCount ?? raw?.TotalCount ?? (Array.isArray(raw) ? raw.length : items.length));
    const pageNumber = Number(raw?.pageNumber && raw.pageNumber > 0 ? raw.pageNumber : pageNum);
    const resolvedPageSize = Number(raw?.pageSize && raw.pageSize > 0 ? raw.pageSize : pageSize);
    const totalPages = Number(
      raw?.totalPages ?? raw?.TotalPages ?? Math.max(1, Math.ceil(totalCount / (resolvedPageSize || 1)))
    );

    return {
      items,
      totalCount,
      pageNumber,
      pageSize: resolvedPageSize,
      totalPages,
    };
  },

  /**
   * Get single inventory transfer by ID
   * GET /api/purchasing/inventory/transfer/{id}
   */
  getTransferById: async (
    id: number,
    signal?: AbortSignal
  ): Promise<InventoryTransfer> => {
    const res = await apiRequest<unknown>({
      method: 'GET',
      path: `purchasing/inventory/transfer/${id}`,
      signal,
    });

    return unwrapApiResponse<InventoryTransfer>(res);
  },

  /**
   * Create restaurant transfer with destination warehouse and line items
   * POST /api/purchasing/inventory/restaurant-transfer
   */
  createRestaurantTransfer: async (
    payload: CreateRestaurantTransferRequest,
    signal?: AbortSignal
  ): Promise<InventoryTransfer> => {
    const res = await apiRequest<unknown>({
      method: 'POST',
      path: 'purchasing/inventory/restaurant-transfer',
      body: payload,
      signal,
    });

    return unwrapApiResponse<InventoryTransfer>(res);
  },

  /**
   * Create ad-hoc transfer for an item
   * POST /api/purchasing/inventory/transfer
   */
  createAdHocTransfer: async (
    payload: CreateAdHocTransferRequest,
    signal?: AbortSignal
  ): Promise<InventoryTransfer> => {
    const res = await apiRequest<unknown>({
      method: 'POST',
      path: 'purchasing/inventory/transfer',
      body: payload,
      signal,
    });

    return unwrapApiResponse<InventoryTransfer>(res);
  },

  /**
   * Confirm a pending inventory transfer
   * POST /api/purchasing/inventory/transfer/{id}/confirm
   */
  confirmTransfer: async (
    id: number,
    signal?: AbortSignal
  ): Promise<boolean> => {
    const res = await apiRequest<unknown>({
      method: 'POST',
      path: `purchasing/inventory/transfer/${id}/confirm`,
      signal,
    });

    return unwrapApiResponse<boolean>(res);
  },

  /**
   * Cancel an inventory transfer with reason
   * POST /api/purchasing/inventory/transfer/{id}/cancel?reason=...
   */
  cancelTransfer: async (
    id: number,
    reason: string,
    signal?: AbortSignal
  ): Promise<boolean> => {
    const searchParams = new URLSearchParams({ reason });
    const res = await apiRequest<unknown>({
      method: 'POST',
      path: `purchasing/inventory/transfer/${id}/cancel?${searchParams.toString()}`,
      signal,
    });

    return unwrapApiResponse<boolean>(res);
  },

  // ==========================================
  // RESTAURANT MATERIAL REQUESTS & WAREHOUSES
  // ==========================================

  /**
   * Get Material Requests from Restaurant
   * GET /api/restaurant/material-requests
   */
  getRestaurantMaterialRequests: async (
    params?: RestaurantMaterialRequestFilterQuery,
    signal?: AbortSignal
  ): Promise<{ items: RestaurantMaterialRequest[]; totalCount: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.pageNumber !== undefined) {
      searchParams.append('PageNumber', params.pageNumber.toString());
    } else {
      searchParams.append('PageNumber', '1');
    }
    if (params?.pageSize !== undefined) {
      searchParams.append('PageSize', params.pageSize.toString());
    } else {
      searchParams.append('PageSize', '50');
    }
    if (params?.restaurantId !== undefined) {
      searchParams.append('RestaurantId', params.restaurantId.toString());
    }
    if (params?.status) {
      searchParams.append('Status', params.status);
    }
    if (params?.dateFrom) {
      searchParams.append('DateFrom', params.dateFrom);
    }
    if (params?.dateTo) {
      searchParams.append('DateTo', params.dateTo);
    }
    if (params?.search) {
      searchParams.append('Search', params.search);
    }

    const qs = searchParams.toString();
    const path = qs ? `restaurant/material-requests?${qs}` : 'restaurant/material-requests';

    const res = await apiRequest<{
      isSuccess?: boolean;
      data?: { items?: RestaurantMaterialRequest[]; totalCount?: number };
      items?: RestaurantMaterialRequest[];
      totalCount?: number;
    }>({
      method: 'GET',
      path,
      signal,
    });

    // Check envelope shape: { isSuccess, data: { items } } or direct { items }
    if (res?.data?.items) {
      return {
        items: res.data.items,
        totalCount: res.data.totalCount ?? res.data.items.length,
      };
    }
    if (res?.items) {
      return {
        items: res.items,
        totalCount: res.totalCount ?? res.items.length,
      };
    }
    const unwrapped = unwrapApiResponse<{ items?: RestaurantMaterialRequest[]; data?: { items?: RestaurantMaterialRequest[] } }>(res);
    const items = unwrapped?.data?.items || unwrapped?.items || [];
    return { items, totalCount: items.length };
  },

  /**
   * Get Restaurant Warehouses / Inventory
   */
  getRestaurantInventory: async (
    signal?: AbortSignal
  ): Promise<Array<{ warehouseId: number; warehouseName: string; restaurantId: number; restaurantName: string }>> => {
    try {
      const res = await apiRequest<unknown>({
        method: 'GET',
        path: 'restaurant/inventory?PageSize=50',
        signal,
      });

      const parsed = unwrapApiResponse<{ items: Array<{ restaurantWarehouseId: number; warehouseName: string; restaurantId: number; restaurantName: string }> }>(res);
      const items = parsed?.items || [];
      const map = new Map<number, { warehouseId: number; warehouseName: string; restaurantId: number; restaurantName: string }>();
      items.forEach((it) => {
        if (!map.has(it.restaurantWarehouseId)) {
          map.set(it.restaurantWarehouseId, {
            warehouseId: it.restaurantWarehouseId,
            warehouseName: it.warehouseName,
            restaurantId: it.restaurantId,
            restaurantName: it.restaurantName,
          });
        }
      });
      return Array.from(map.values());
    } catch {
      return [{ warehouseId: 1, warehouseName: 'MainRestaurant Inventrory', restaurantId: 1, restaurantName: 'MainRestaurant' }];
    }
  },
};
