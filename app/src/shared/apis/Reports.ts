import { apiRequest, unwrapApiResponse } from './apiClient'
import type {
  DailyCheckinsData,
  FinancialSummaryData,
  KpiDashboardData,
  RevenueAnalyticsData,
  OccupancyForecastData,
  PaceReportData,
  ChannelPerformanceData,
  CancellationReportData,
} from '../../models/Report'

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

type BaseReportParams = {
  startDate: string
  endDate: string
  roomTypeId?: string
  reservationSource?: string
}

function buildBaseQp(params: BaseReportParams) {
  const qp = new URLSearchParams({ StartDate: params.startDate, EndDate: params.endDate })
  if (params.roomTypeId) qp.set('RoomTypeId', params.roomTypeId)
  if (params.reservationSource) qp.set('ReservationSource', params.reservationSource)
  return qp
}

export function getKpiDashboard(params: BaseReportParams, signal?: AbortSignal) {
  return apiRequest<KpiDashboardData>({
    method: 'GET',
    path: `reports/kpi-dashboard?${buildBaseQp(params).toString()}`,
    signal,
  })
}

export function getRevenueAnalytics(params: BaseReportParams, signal?: AbortSignal) {
  return apiRequest<RevenueAnalyticsData>({
    method: 'GET',
    path: `reports/revenue-analytics?${buildBaseQp(params).toString()}`,
    signal,
  })
}

export function getOccupancyForecast(
  params: BaseReportParams & { trendDays: number },
  signal?: AbortSignal
) {
  const qp = buildBaseQp(params)
  qp.set('trendDays', String(params.trendDays))
  return apiRequest<OccupancyForecastData>({
    method: 'GET',
    path: `reports/occupancy-forecast?${qp.toString()}`,
    signal,
  })
}

export function getPaceReport(
  params: BaseReportParams & { trendDays: number },
  signal?: AbortSignal
) {
  const qp = buildBaseQp(params)
  qp.set('trendDays', String(params.trendDays))
  return apiRequest<PaceReportData>({
    method: 'GET',
    path: `reports/pace?${qp.toString()}`,
    signal,
  })
}

export function getChannelPerformance(params: BaseReportParams, signal?: AbortSignal) {
  return apiRequest<ChannelPerformanceData>({
    method: 'GET',
    path: `reports/channel-performance?${buildBaseQp(params).toString()}`,
    signal,
  })
}

export function getCancellationReport(
  params: BaseReportParams & { trendDays: number },
  signal?: AbortSignal
) {
  const qp = buildBaseQp(params)
  qp.set('trendDays', String(params.trendDays))
  return apiRequest<CancellationReportData>({
    method: 'GET',
    path: `reports/cancellation-no-show?${qp.toString()}`,
    signal,
  })
}
