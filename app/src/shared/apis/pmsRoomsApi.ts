import { apiRequest, unwrapApiResponse } from './apiClient'
import type { PmsRoom } from '../../models/PmsRoom'

export const pmsRoomsApi = {
  getAll: (signal?: AbortSignal) => {
    return apiRequest<unknown>({
      method: 'GET',
      path: `pms/rooms`,
      signal,
    }).then((r) => unwrapApiResponse<PmsRoom[]>(r))
  },
}
