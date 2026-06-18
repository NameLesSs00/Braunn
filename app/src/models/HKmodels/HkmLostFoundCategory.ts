// ---- Query Params ----
export interface LostFoundCategoryQueryParams {
  PageNumber?: number
  PageSize?: number
  Search?: string
  SortBy?: string
  SortDirection?: string
}

// ---- Paginated Response ----
export interface PaginatedLostFoundCategories {
  pageNumber: number
  pageSize: number
  items: LostFoundCategoryReadDto[]
  totalCount: number
}

// ---- DTOs ----
export interface LostFoundCategoryReadDto {
  id: number
  name: string
}

export interface LostFoundCategoryCreateDto {
  name: string
}

export interface LostFoundCategoryUpdateDto {
  name: string
}
