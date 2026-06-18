export type LaundryItemStatus = 'Normal' | 'Low' | 'High'
export type LaundryMaintenanceStatus = 'Available' | 'UnderMaintenance'

export type LaundryInventoryItemReadDto = {
  id: number
  name: string
  quantity: number
  minimumStock: number
  maximumStock: number
  status: LaundryItemStatus
  maintenanceStatus: LaundryMaintenanceStatus
  categoryId: number
  categoryName: string
  unitId: number
  unitName: string
}

export type LaundryInventoryItemCreateDto = {
  name: string
  categoryId: number
  minimumStock: number
  maximumStock: number
  unitId: number
}

export type LaundryInventoryItemUpdateDto = {
  name: string
  categoryId: number
  minimumStock: number
  maximumStock: number
  unitId: number
}

export type LaundryInventoryItemsParams = {
  PageNumber?: number
  PageSize?: number
  Name?: string
  CategoryId?: number | ''
  Status?: LaundryItemStatus | ''
  MaintenanceStatus?: LaundryMaintenanceStatus | ''
}

export type LaundryInventoryItemsListDto = {
  pageNumber: number
  pageSize: number
  items: LaundryInventoryItemReadDto[]
  totalCount: number
}
