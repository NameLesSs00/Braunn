export type TransferStatus = 'Pending' | 'Confirmed' | 'Cancelled';
export type DepartmentType = 'Restaurant' | 'Maintenance' | 'Housekeeping' | string;

export interface InventoryTransferItem {
  id: number;
  inventoryTransferId: number;
  materialId: number;
  materialName: string;
  requestedQuantity: number;
  requestedUnitId: number;
  requestedUnitName: string;
  requestedUnitSymbol: string;
  transferredQuantity: number;
  transferredUnitId: number;
  transferredUnitName: string;
  transferredUnitSymbol: string;
  mainInventoryId: number;
}

export interface InventoryTransfer {
  id: number;
  departmentType: DepartmentType;
  itemId: number;
  quantity: number;
  mainInventoryId: number;
  status: TransferStatus;
  destinationWarehouseId?: number | null;
  destinationWarehouseName?: string;
  restaurantId?: number | null;
  restaurantName?: string;
  materialRequestId?: number | null;
  transferredBy: string;
  transferDate: string;
  confirmedBy?: string | null;
  confirmedAt?: string | null;
  notes?: string;
  items: InventoryTransferItem[];
}

export interface InventoryTransfersPaginatedResponse {
  items: InventoryTransfer[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryTransfersFilterQuery {
  pageNumber?: number;
  pageSize?: number;
  departmentType?: string;
  itemId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateRestaurantTransferItemRequest {
  materialId: number;
  requestedQuantity: number;
  requestedUnitId: number;
  transferredQuantity: number;
  transferredUnitId: number;
}

export interface CreateRestaurantTransferRequest {
  destinationWarehouseId: number;
  materialRequestId?: number | null;
  notes?: string;
  items: CreateRestaurantTransferItemRequest[];
}

export interface CreateAdHocTransferRequest {
  departmentType: DepartmentType;
  itemId: number;
  quantity: number;
  notes?: string;
}

export interface PurchasingInventoryItem {
  id: number;
  departmentType: DepartmentType;
  itemId: number;
  itemName: string;
  quantity: number;
  unitId: number;
  unitName: string;
  unitSymbol: string;
  isActive: boolean;
  createdAt?: string;
  modifiedAt?: string;
}

export interface RestaurantMaterialRequestItem {
  id: number;
  materialRequestId: number;
  materialId: number;
  materialName: string;
  requestedQuantity: number;
  unitId: number;
  unitName: string;
  unitSymbol: string;
}

export interface RestaurantMaterialRequest {
  id: number;
  restaurantId: number;
  restaurantName: string;
  requestNumber: string;
  requestDate: string;
  status: string;
  items: RestaurantMaterialRequestItem[];
  createdAt: string;
  createdBy: string;
}
