import type { DailyDashboardResponse } from '../../models/DailyDashboard'
import { apiRequest, unwrapApiResponse } from './apiClient'

export function getDailyDashboard(date: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ date }).toString()
  return apiRequest<DailyDashboardResponse>({
    method: 'GET',
    path: `frontoffice/dashboard/daily?${query}`,
    signal,
  }).then((response) => unwrapApiResponse<DailyDashboardResponse>(response))
}
