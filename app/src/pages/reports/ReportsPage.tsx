import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../store/store'
import { 
  fetchKpiDashboard, 
  fetchRevenueAnalytics, 
  fetchOccupancyForecast,
  fetchPaceReport,
  fetchChannelPerformance,
  fetchCancellationReport
} from '../../features/reports/reportsSlice'
import { fetchRoomTypes } from '../../features/roomTypes/roomTypesSlice'
import { ReportTabs } from './components/ReportTabs'
import { ReportFilters } from './components/ReportFilters'
import { ReportCards } from './components/ReportCards'
import { ReportCharts } from './components/ReportCharts'
import { ReportStatuses } from './components/ReportStatuses'
import { ReportExportOptions } from './components/ReportExportOptions'
import { RevenueAnalyticsTab } from './components/RevenueAnalyticsTab'
import { OccupancyForecastTab } from './components/OccupancyForecastTab'
import { PaceReportTab } from './components/PaceReportTab'
import { ChannelPerformanceTab } from './components/ChannelPerformanceTab'
import { CancellationTab } from './components/CancellationTab'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns YYYY-MM-DD string for the first day of the current month */
function getMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}

/** Returns YYYY-MM-DD string for today */
function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const dispatch = useDispatch<AppDispatch>()

  // ── Redux state ──
  const kpiData = useSelector((s: RootState) => s.reports.kpiDashboard.data)
  const kpiStatus = useSelector((s: RootState) => s.reports.kpiDashboard.status)
  const kpiError = useSelector((s: RootState) => s.reports.kpiDashboard.error)

  const revenueData = useSelector((s: RootState) => s.reports.revenueAnalytics.data)
  const revenueStatus = useSelector((s: RootState) => s.reports.revenueAnalytics.status)
  const revenueError = useSelector((s: RootState) => s.reports.revenueAnalytics.error)

  const occupancyData = useSelector((s: RootState) => s.reports.occupancyForecast.data)
  const occupancyStatus = useSelector((s: RootState) => s.reports.occupancyForecast.status)
  const occupancyError = useSelector((s: RootState) => s.reports.occupancyForecast.error)

  const paceData = useSelector((s: RootState) => s.reports.paceReport.data)
  const paceStatus = useSelector((s: RootState) => s.reports.paceReport.status)
  const paceError = useSelector((s: RootState) => s.reports.paceReport.error)

  const channelData = useSelector((s: RootState) => s.reports.channelPerformance.data)
  const channelStatus = useSelector((s: RootState) => s.reports.channelPerformance.status)
  const channelError = useSelector((s: RootState) => s.reports.channelPerformance.error)

  const cancellationData = useSelector((s: RootState) => s.reports.cancellationReport.data)
  const cancellationStatus = useSelector((s: RootState) => s.reports.cancellationReport.status)
  const cancellationError = useSelector((s: RootState) => s.reports.cancellationReport.error)

  const roomTypes = useSelector((s: RootState) => s.roomTypes.items)
  const roomTypesLoading = useSelector((s: RootState) => s.roomTypes.status === 'loading')

  // ── Tab ──
  const [activeTab, setActiveTab] = useState('kpi')

  // ── Filters — default to current month ──
  const [dateFrom, setDateFrom] = useState(getMonthStart)
  const [dateTo, setDateTo] = useState(getToday)
  const [roomTypeId, setRoomTypeId] = useState('')          // '' = All Room Types
  const [reservationSource, setReservationSource] = useState('') // '' = All Sources

  // Occupancy & Pace specific filter
  const [trendDays, setTrendDays] = useState(7)

  // ── Fetch room types once on mount ──
  useEffect(() => {
    dispatch(fetchRoomTypes())
  }, [dispatch])

  // ── Fetch functions ──
  const fetchKpi = useCallback(() => {
    dispatch(
      fetchKpiDashboard({
        startDate: dateFrom,
        endDate: dateTo,
        roomTypeId: roomTypeId || undefined,
        reservationSource: reservationSource || undefined,
      })
    )
  }, [dispatch, dateFrom, dateTo, roomTypeId, reservationSource])

  const fetchRevenue = useCallback(() => {
    dispatch(
      fetchRevenueAnalytics({
        startDate: dateFrom,
        endDate: dateTo,
        roomTypeId: roomTypeId || undefined,
        reservationSource: reservationSource || undefined,
      })
    )
  }, [dispatch, dateFrom, dateTo, roomTypeId, reservationSource])

  const fetchOccupancy = useCallback(() => {
    dispatch(
      fetchOccupancyForecast({
        startDate: dateFrom,
        endDate: dateTo,
        trendDays,
        roomTypeId: roomTypeId || undefined,
        reservationSource: reservationSource || undefined,
      })
    )
  }, [dispatch, dateFrom, dateTo, roomTypeId, reservationSource, trendDays])

  const fetchPace = useCallback(() => {
    dispatch(
      fetchPaceReport({
        startDate: dateFrom,
        endDate: dateTo,
        trendDays,
        roomTypeId: roomTypeId || undefined,
        reservationSource: reservationSource || undefined,
      })
    )
  }, [dispatch, dateFrom, dateTo, roomTypeId, reservationSource, trendDays])

  const fetchChannel = useCallback(() => {
    dispatch(
      fetchChannelPerformance({
        startDate: dateFrom,
        endDate: dateTo,
        roomTypeId: roomTypeId || undefined,
        reservationSource: reservationSource || undefined,
      })
    )
  }, [dispatch, dateFrom, dateTo, roomTypeId, reservationSource])

  const fetchCancellation = useCallback(() => {
    dispatch(
      fetchCancellationReport({
        startDate: dateFrom,
        endDate: dateTo,
        trendDays,
        roomTypeId: roomTypeId || undefined,
        reservationSource: reservationSource || undefined,
      })
    )
  }, [dispatch, dateFrom, dateTo, roomTypeId, reservationSource, trendDays])

  // ── Auto-fetch when tab is activated or trendDays changes ──
  useEffect(() => {
    if (activeTab === 'kpi') fetchKpi()
    if (activeTab === 'revenue') fetchRevenue()
    if (activeTab === 'occupancy') fetchOccupancy()
    if (activeTab === 'pace') fetchPace()
    if (activeTab === 'channel') fetchChannel()
    if (activeTab === 'cancellation') fetchCancellation()
  }, [activeTab, trendDays]) // eslint-disable-line react-hooks/exhaustive-deps
  // Note: intentionally only re-runs when tab/trendDays changes, not on general filter changes.
  // Filters are applied explicitly via the "Apply Filters" button.

  const handleApplyFilters = () => {
    if (activeTab === 'kpi') fetchKpi()
    if (activeTab === 'revenue') fetchRevenue()
    if (activeTab === 'occupancy') fetchOccupancy()
    if (activeTab === 'pace') fetchPace()
    if (activeTab === 'channel') fetchChannel()
    if (activeTab === 'cancellation') fetchCancellation()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Tabs Navigation */}
      <ReportTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Filters panel — shared across all tabs */}
      <ReportFilters
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        roomTypeId={roomTypeId}
        setRoomTypeId={setRoomTypeId}
        reservationSource={reservationSource}
        setReservationSource={setReservationSource}
        roomTypes={roomTypes}
        roomTypesLoading={roomTypesLoading}
        onApply={handleApplyFilters}
      />

      {/* ── Tab 1: KPI Dashboard ── */}
      {activeTab === 'kpi' && (
        <>
          <ReportCards data={kpiData} status={kpiStatus} error={kpiError} />
          <ReportCharts />
          <ReportStatuses />
          <ReportExportOptions />
        </>
      )}

      {/* ── Tab 2: Revenue Analytics ── */}
      {activeTab === 'revenue' && (
        <RevenueAnalyticsTab data={revenueData} status={revenueStatus} error={revenueError} />
      )}

      {/* ── Tab 3: Occupancy & Forecast ── */}
      {activeTab === 'occupancy' && (
        <OccupancyForecastTab 
          data={occupancyData} 
          status={occupancyStatus} 
          error={occupancyError} 
          trendDays={trendDays} 
          onTrendDaysChange={setTrendDays} 
        />
      )}

      {/* ── Tab 4: Pace Report ── */}
      {activeTab === 'pace' && (
        <PaceReportTab 
          data={paceData} 
          status={paceStatus} 
          error={paceError} 
          trendDays={trendDays} 
          onTrendDaysChange={setTrendDays} 
        />
      )}

      {/* ── Tab 5: Channel Performance ── */}
      {activeTab === 'channel' && (
        <ChannelPerformanceTab 
          data={channelData} 
          status={channelStatus} 
          error={channelError} 
        />
      )}

      {/* ── Tab 6: Cancellation & No Show ── */}
      {activeTab === 'cancellation' && (
        <CancellationTab 
          data={cancellationData}
          status={cancellationStatus}
          error={cancellationError}
          trendDays={trendDays}
          onTrendDaysChange={setTrendDays}
        />
      )}

      {/* ── Other tabs: placeholder ── */}
      {!['kpi', 'revenue', 'occupancy', 'pace', 'channel', 'cancellation'].includes(activeTab) && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-slate-400 text-[14px]">
          This report view is coming soon.
        </div>
      )}
    </div>
  )
}
