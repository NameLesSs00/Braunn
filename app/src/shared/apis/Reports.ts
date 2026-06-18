import { apiRequest, unwrapApiResponse } from './apiClient'
import type { DailyCheckinsData, FinancialSummaryData } from '../../models/Report'

const basePath = 'pms/reports'

export function getDailyCheckinsReport(date: string, signal?: AbortSignal) {
  const qp = `date=${encodeURIComponent(date)}`
  return apiRequest<unknown>({ 
    method: 'GET', 
    path: `${basePath}/daily-checkins?${qp}`, 
    signal 
  }).then((r) => unwrapApiResponse<DailyCheckinsData>(r))
}

export function getFinancialSummaryReport(startDate: string, endDate: string, signal?: AbortSignal) {
  const qp = `startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  return apiRequest<unknown>({ 
    method: 'GET', 
    path: `${basePath}/financial-summary?${qp}`, 
    signal 
  }).then((r) => unwrapApiResponse<FinancialSummaryData>(r))
}
