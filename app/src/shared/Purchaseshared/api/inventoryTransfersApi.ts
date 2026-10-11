import { apiRequest, unwrapApiResponse } from '../../../shared/apis/apiClient';
import type {
  InventoryTransfer,
  InventoryTransfersFilterQuery,
  InventoryTransfersPaginatedResponse,
  CreateRestaurantTransferRequest,
  CreateAdHocTransferRequest,
  PurchasingInventoryItem,
  RestaurantMaterialRequest,
} from '../../../models/Purchasemodels/InventoryTransfer';

const BASE_PATH = 'purchasing/inventory-transfers';

export const inventoryTransfersApi = {
  /**
   * Get paginated inventory transfers with optional query filters
   */
  getTransfers: async (
    params?: InventoryTransfersFilterQuery,
    signal?: AbortSignal
  ): Promise<InventoryTransfersPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.pageNumber !== undefined) {
      searchParams.append('PageNumber', params.pageNumber.toString());
    }
    if (params?.pageSize !== undefined) {
      searchParams.append('PageSize', params.pageSize.toString());
    }
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
    const path = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

    const res = await apiRequest<unknown>({
      method: 'GET',
      path,
      signal,
    });

    return unwrapApiResponse<InventoryTransfersPaginatedResponse>(res);
  },

  /**
   * Get single inventory transfer by ID
   */
  getTransferById: async (
    id: number,
    signal?: AbortSignal
  ): Promise<InventoryTransfer> => {
    const res = await apiRequest<unknown>({
      method: 'GET',
      path: `${BASE_PATH}/${id}`,
      signal,
    });

    return unwrapApiResponse<InventoryTransfer>(res);
  },

  /**
   * Create restaurant transfer with destination warehouse and line items
   */
  createRestaurantTransfer: async (
    payload: CreateRestaurantTransferRequest,
    signal?: AbortSignal
  ): Promise<InventoryTransfer> => {
    const res = await apiRequest<unknown>({
      method: 'POST',
      path: `${BASE_PATH}/restaurant-transfer`,
      body: payload,
      signal,
    });

    return unwrapApiResponse<InventoryTransfer>(res);
  },

  /**
   * Create ad-hoc transfer for an item
   */
  createAdHocTransfer: async (
    payload: CreateAdHocTransferRequest,
    signal?: AbortSignal
  ): Promise<InventoryTransfer> => {
    const res = await apiRequest<unknown>({
      method: 'POST',
      path: BASE_PATH,
      body: payload,
      signal,
    });

    return unwrapApiResponse<InventoryTransfer>(res);
  },

  /**
   * Confirm a pending inventory transfer
   */
  confirmTransfer: async (
    id: number,
    signal?: AbortSignal
  ): Promise<boolean> => {
    const res = await apiRequest<unknown>({
      method: 'POST',
      path: `${BASE_PATH}/${id}/confirm`,
      signal,
    });

    return unwrapApiResponse<boolean>(res);
  },

  /**
   * Cancel an inventory transfer with reason
   */
  cancelTransfer: async (
    id: number,
    reason: string,
    signal?: AbortSignal
  ): Promise<boolean> => {
    const searchParams = new URLSearchParams({ reason });
    const res = await apiRequest<unknown>({
      method: 'POST',
      path: `${BASE_PATH}/${id}/cancel?${searchParams.toString()}`,
      signal,
    });

    return unwrapApiResponse<boolean>(res);
  },

  /**
   * Get Central Purchasing Stock / Inventory
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

  /**
   * Get Pending Material Requests from Restaurant
   */
  getRestaurantMaterialRequests: async (
    signal?: AbortSignal
  ): Promise<RestaurantMaterialRequest[]> => {
    const res = await apiRequest<unknown>({
      method: 'GET',
      path: 'restaurant/material-requests?PageSize=50',
      signal,
    });

    const parsed = unwrapApiResponse<{ items: RestaurantMaterialRequest[] } | RestaurantMaterialRequest[]>(res);
    if (Array.isArray(parsed)) return parsed;
    return parsed?.items || [];
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
