export type HkmInventoryItemStatus = 'Normal' | 'Low' | 'High'

export interface HkmInventoryItemReadDto {
  id: number
  name: string
  quantity: number
  status: HkmInventoryItemStatus
  categoryId: number
  categoryName: string
  unitId: number
  unitName: string
  minimumStock?: number
  maximumStock?: number
}

export interface HkmInventoryItemCreateDto {
  name: string
  minimumStock: number
  maximumStock: number
  categoryId: number
  unitId: number
}

export interface HkmInventoryItemUpdateDto {
  name: string
  categoryId: number
  minimumStock: number
  maximumStock: number
  unitId: number
}

export interface HkmInventoryItemsListDto {
  items: HkmInventoryItemReadDto[]
  totalCount: number
}

export interface HkmInventoryItemsParams {
  PageNumber?: number
  PageSize?: number
  Status?: HkmInventoryItemStatus | ''
  CategoryId?: number | ''
  UnitId?: number | ''
}
