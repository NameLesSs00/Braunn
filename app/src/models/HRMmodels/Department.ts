export interface DepartmentReadDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  countemployee: number;
}

export interface DepartmentCreateDto {
  name: string;
  description: string;
}

export interface DepartmentUpdateDto {
  name: string;
  description: string;
  isActive: boolean;
}

export interface DepartmentsQueryParams {
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
  IsActive?: boolean;
}

export interface PaginatedDepartments {
  pageNumber: number;
  pageSize: number;
  items: DepartmentReadDto[];
  totalCount: number;
}
