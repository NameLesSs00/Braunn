export type MaintenanceItemType = 'Product' | 'Equipment'

export interface MaintenanceItem {
  id: string
  name: string
  categoryId: string
  categoryName: string
  unitId: string
  unitName: string
  manufactureName: string
  warranty: string
  code: string
  price: number
  type: MaintenanceItemType
  quantity: number
  minimum: number
  maximum: number
  location: string
  notes: string
  status?: string // Optional status mapped from UI logic or response
}

export interface CreateMaintenanceItemRequest {
  name: string
  categoryId: string
  unitId: string
  manufactureName: string
  warranty: string
  code: string
  price: number
  type: MaintenanceItemType
  quantity: number
  minimum: number
  maximum: number
  location: string
  notes: string
}

export type UpdateMaintenanceItemRequest = Partial<CreateMaintenanceItemRequest>
