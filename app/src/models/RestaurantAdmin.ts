export interface RestaurantWarehouse {
  id: number
  restaurantId: number
  name: string
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface RestaurantAdmin {
  id: number
  name: string
  isActive: boolean
  warehouse: RestaurantWarehouse | null
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface UpdateRestaurantRequest {
  name: string
}

export interface UpdateRestaurantWarehouseRequest {
  name: string
  isActive: boolean
}

export interface WarehouseMaterialStock {
  materialId: number
  materialName: string
  quantity: number
  unitId: number
  unitName: string
}

export interface WarehouseDetails {
  warehouseId: number
  warehouseName: string
  restaurantId: number
  restaurantName: string
  isActive: boolean
  materials: WarehouseMaterialStock[]
}

export interface WarehouseTransaction {
  id: number
  restaurantWarehouseId: number
  warehouseName: string
  restaurantId: number
  restaurantName: string
  restaurantInventoryId: number
  materialId: number
  materialName: string
  unitId: number
  unitName: string
  unitSymbol: string
  quantity: number
  transactionType: string
  referenceType: string
  referenceId: number
  transactionDate: string
  createdAt: string
  createdBy: string
}
