export interface RestaurantProductMaterial {
  materialId: number
  materialName: string
  unitId: number
  unitName: string
  unitSymbol: string
  quantity: number
}

export interface RestaurantProduct {
  id: number
  name: string
  unitId: number
  unitName: string
  unitSymbol: string
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
  materialsCount: number
  materials?: RestaurantProductMaterial[]
}

export interface CreateRestaurantProductMaterialRequest {
  materialId: number
  quantity: number
  unitId: number
}

export interface CreateRestaurantProductRequest {
  name: string
  unitId: number
  materials: CreateRestaurantProductMaterialRequest[]
}

export interface UpdateRestaurantProductRequest {
  name: string
  unitId: number
  materials: CreateRestaurantProductMaterialRequest[]
}
