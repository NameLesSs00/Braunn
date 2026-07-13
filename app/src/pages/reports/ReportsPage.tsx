import { useState } from 'react'
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

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('kpi')

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState(todayStr)
  const [dateTo, setDateTo] = useState(todayStr)
  const [property, setProperty] = useState('All Properties')
  const [roomType, setRoomType] = useState('All Room Types')
  const [marketSegment, setMarketSegment] = useState('All Segments')

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
        property={property}
        setProperty={setProperty}
        roomType={roomType}
        setRoomType={setRoomType}
        marketSegment={marketSegment}
        setMarketSegment={setMarketSegment}
      />

      {/* ── Tab 1: KPI Dashboard ── */}
      {activeTab === 'kpi' && (
        <>
          <ReportCards />
          <ReportCharts />
          <ReportStatuses />
          <ReportExportOptions />
        </>
      )}

      {/* ── Tab 2: Revenue Analytics ── */}
      {activeTab === 'revenue' && <RevenueAnalyticsTab />}

      {/* ── Tab 3: Occupancy & Forecast ── */}
      {activeTab === 'occupancy' && <OccupancyForecastTab />}

      {/* ── Tab 4: Pace Report ── */}
      {activeTab === 'pace' && <PaceReportTab />}

      {/* ── Tab 5: Channel Performance ── */}
      {activeTab === 'channel' && <ChannelPerformanceTab />}

      {/* ── Tab 6: Cancellation & No Show ── */}
      {activeTab === 'cancellation' && <CancellationTab />}

      {/* ── Other tabs: placeholder ── */}
      {!['kpi', 'revenue', 'occupancy', 'pace', 'channel', 'cancellation'].includes(activeTab) && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-slate-400 text-[14px]">
          This report view is coming soon.
        </div>
      )}
    </div>
  )
}

