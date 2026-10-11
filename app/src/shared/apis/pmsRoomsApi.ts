import { apiRequest, unwrapApiResponse, PaginatedResponse } from './apiClient'
import type { PmsRoom } from '../../models/PmsRoom'

export const pmsRoomsApi = {
  getAll: (
    params?: {
      pageNumber?: number
      pageSize?: number
      search?: string
      status?: string
      roomType?: string
      managementType?: 'HotelManaged' | 'OwnerManaged' | string
      ownershipType?: 'HotelOwned' | 'OwnerOwned' | string
      floor?: number
      roomTypeId?: string
    },
    signal?: AbortSignal
  ) => {
    const p = params || { pageNumber: 1, pageSize: 50 }
    const urlParams = new URLSearchParams()
    urlParams.append('pageNumber', String(p.pageNumber || 1))
    urlParams.append('pageSize', String(p.pageSize || 50))
    if (p.search) urlParams.append('search', p.search)
    if (p.status && p.status !== 'All Rooms') urlParams.append('status', p.status)
    if (p.roomType && p.roomType !== 'All') urlParams.append('roomType', p.roomType)
    if (p.managementType) urlParams.append('managementType', p.managementType)
    if (p.ownershipType) urlParams.append('ownershipType', p.ownershipType)
    if (p.floor !== undefined) urlParams.append('floor', String(p.floor))
    if (p.roomTypeId) urlParams.append('roomTypeId', p.roomTypeId)

    return apiRequest<unknown>({
      method: 'GET',
      path: `/rooms?${urlParams.toString()}`,
      signal,
    }).then((r) => unwrapApiResponse<PaginatedResponse<PmsRoom>>(r))
  },
}
