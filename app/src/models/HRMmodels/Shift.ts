export interface ShiftReadDto {
  id: string; // uuid
  name: string;
  startTime: string; // "HH:mm:ss" format
  endTime: string; // "HH:mm:ss" format
}

export interface ShiftCreateDto {
  name: string;
  startTime: string;
  endTime: string;
}

export interface ShiftUpdateDto {
  name: string;
  startTime: string;
  endTime: string;
}

export interface ShiftsQueryParams {
  Name?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface PaginatedShifts {
  pageNumber: number;
  pageSize: number;
  items: ShiftReadDto[];
  totalCount: number;
}
