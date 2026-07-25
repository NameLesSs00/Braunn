export interface MaintenanceCategory {
  id: string
  name: string
  code: string
  description: string
  icon: string
  itemCount: number
}

export interface CreateCategoryRequest {
  name: string
  code: string
  description: string
  icon: string
}

export interface UpdateCategoryRequest {
  name: string
  code: string
  description: string
  icon: string
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
