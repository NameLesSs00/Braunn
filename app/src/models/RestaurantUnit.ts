export interface RestaurantUnit {
  id: number
  name: string
  symbol: string
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface CreateRestaurantUnitRequest {
  name: string
  symbol: string
}

export interface UpdateRestaurantUnitRequest {
  name: string
  symbol: string
}
