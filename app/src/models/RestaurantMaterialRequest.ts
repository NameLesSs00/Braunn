export interface MaterialRequestItem {
  id: number
  materialRequestId: number
  materialId: number
  materialName: string
  requestedQuantity: number
  unitId: number
  unitName: string
  unitSymbol: string
}

export interface MaterialRequest {
  id: number
  restaurantId: number
  restaurantName: string
  requestNumber: string
  requestDate: string
  status: string
  items: MaterialRequestItem[]
  createdAt: string
  createdBy: string
  updatedAt: string | null
  updatedBy: string | null
}

export interface CreateMaterialRequestItemRequest {
  materialId: number
  requestedQuantity: number
  unitId: number
}

export interface CreateMaterialRequestRequest {
  restaurantId: number
  requestDate: string
  items: CreateMaterialRequestItemRequest[]
}

export interface UpdateMaterialRequestItemRequest extends CreateMaterialRequestItemRequest {
  id?: number
}

export interface UpdateMaterialRequestRequest {
  items: UpdateMaterialRequestItemRequest[]
}
