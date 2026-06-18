export interface HkmIssueReadDto {
  id: number
  itemId: number
  itemName: string
  quantity: number
  roomId: string
  reason: string
  createdAt: string
  createdBy: string
}

export interface HkmIssueCreateDto {
  itemId: number
  quantity: number
  roomId: string
  reason: string
}

export interface HkmIssueUpdateDto {
  itemId: number
  quantity: number
  roomId: string
  reason: string
}

export interface HkmIssuesListDto {
  items: HkmIssueReadDto[]
  totalCount: number
}

export interface HkmIssuesParams {
  PageNumber?: number
  PageSize?: number
  ItemId?: number | ''
  RoomId?: string | ''
}
