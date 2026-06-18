export interface LostAndFoundQueryParams {
  PageNumber?: number;
  PageSize?: number;
  Type?: 'Lost' | 'Found';
  CategoryId?: number;
  GuestId?: string;
  EmployeeId?: string;
  IsClaimed?: boolean;
  ItemName?: string;
  RoomNo?: string;
  Location?: string;
  CreatedDateFrom?: string;
  CreatedDateTo?: string;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface LostAndFoundReadDto {
  id: number;
  type: 'Lost' | 'Found';
  notes: string;
  description: string;
  categoryId: number;
  categoryName: string;
  location: string;
  guestId: string | null;
  employeeId: string | null;
  isClaimed: boolean;
  roomNo: string;
  createdAt: string;
  guestName: string | null;
  employeeName: string | null;
  itemName: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface PaginatedLostAndFound {
  pageNumber: number;
  pageSize: number;
  items: LostAndFoundReadDto[];
  totalCount: number;
}

export interface LostAndFoundCreateDto {
  type: 'Lost' | 'Found';
  notes: string;
  itemName: string;
  description: string;
  categoryId: number;
  location: string;
  guestId: string | null;
  employeeId: string | null;
  roomNo: string;
}

export interface LostAndFoundUpdateDto {
  type: 'Lost' | 'Found';
  notes: string;
  itemName: string;
  description: string;
  categoryId: number;
  location: string;
  guestId: string | null;
  employeeId: string | null;
  roomNo: string;
}
