export type RequestStatus = 'Pending' | 'Progress' | 'Success'

export interface RequestItem {
  id: string
  roomNo: string
  serviceId: string
  serviceName: string
  servicePrice: number
  status: RequestStatus
  date: string
  createdAt: string
}

export interface RequestListResponse {
  items: RequestItem[]
  totalCount: number
}

export interface RequestQueryParams {
  pageNumber?: number
  pageSize?: number
  status?: RequestStatus
  roomNo?: string
  date?: string
}

export interface CreateRequestRequest {
  roomNo: string
  serviceId: string
  date: string
}

export interface UpdateRequestRequest {
  roomNo: string
  serviceId: string
  date: string
}


