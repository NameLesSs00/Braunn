export interface LaundryIssueReadDto {
  id: number;
  itemId: number;
  itemName: string;
  quantity: number;
  reason: string;
  createdAt: string;
  createdBy: string;
}

export interface LaundryIssueCreateDto {
  itemId: number;
  quantity: number;
  reason: string;
}

export interface LaundryIssueUpdateDto {
  itemId: number;
  quantity: number;
  reason: string;
}

export interface LaundryIssuesParams {
  PageNumber?: number;
  PageSize?: number;
  ItemId?: number;
  Date?: string;
}

export interface LaundryIssuesListDto {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  items: LaundryIssueReadDto[];
}
