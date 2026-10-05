export interface RestaurantMaterialConversion {
  id: number
  materialId: number
  materialName: string
  fromUnitId: number
  fromUnitName: string
  fromUnitSymbol: string
  toUnitId: number
  toUnitName: string
  toUnitSymbol: string
  conversionFactor: number
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface RestaurantMaterial {
  id: number
  name: string
  unitId: number
  unitName: string
  unitSymbol: string
  conversions: RestaurantMaterialConversion[]
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface CreateRestaurantMaterialRequest {
  name: string
  unitId: number
}

export interface UpdateRestaurantMaterialRequest {
  name: string
  unitId: number
}

export interface CreateMaterialConversionRequest {
  materialId: number
  fromUnitId: number
  toUnitId: number
  conversionFactor: number
}

export interface UpdateMaterialConversionRequest {
  conversionFactor: number
}
