export interface RestaurantInventoryItem {
  id: number
  restaurantWarehouseId: number
  warehouseName: string
  restaurantId: number
  restaurantName: string
  materialId: number
  materialName: string
  unitId: number
  unitName: string
  unitSymbol: string
  quantity: number
  createdAt: string
  updatedAt: string | null
}

export interface RestaurantInventoryTransaction {
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
