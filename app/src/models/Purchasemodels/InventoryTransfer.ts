export type TransferStatus = 'Pending' | 'Confirmed' | 'Cancelled';
export type DepartmentType = 'Restaurant' | 'Laundry' | 'Housekeeping' | 'Maintenance' | string;

export interface UnifiedDepartmentRequestItem {
  id?: number;
  itemId: number;
  itemName: string;
  quantity: number;
  priority?: string;
  unitId?: number | null;
  unitSymbol?: string;
}

export interface UnifiedDepartmentRequest {
  id: number;
  department: 'Restaurant' | 'Laundry' | 'Housekeeping' | 'Maintenance';
  referenceCode: string;
  requesterName: string;
  requiredDate: string;
  status: string;
  itemsCount: number;
  items: UnifiedDepartmentRequestItem[];
  rawRequest: any;
}

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
  mainInventoryId?: number;
  status: TransferStatus;
  destinationWarehouseId?: number | null;
  destinationWarehouseName?: string;
  restaurantId?: number | null;
  restaurantName?: string;
  materialRequestId?: number | null;
  transferredBy: string;
  transferredByName?: string | null;
  transferDate: string;
  confirmedBy?: string | null;
  confirmedByName?: string | null;
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

export interface InventoryTransaction {
  id: number;
  inventoryItemId: number;
  purchaseId: number | null;
  transactionType: 'Receipt' | 'TransferOut' | string;
  quantity: number;
  unitId: number;
  unitName: string;
  unitSymbol: string;
  beforeQuantity: number;
  afterQuantity: number;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface PurchasingInventoryDetail extends PurchasingInventoryItem {
  recentTransactions: InventoryTransaction[];
}

export interface PurchasingInventoryPaginatedResponse {
  items: PurchasingInventoryItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalValuation: number;
}

export interface PurchasingInventoryFilterQuery {
  pageNumber?: number;
  pageSize?: number;
  purchaseType?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
  search?: string;
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
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface RestaurantMaterialRequestFilterQuery {
  pageNumber?: number;
  pageSize?: number;
  restaurantId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
