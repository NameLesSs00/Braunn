import { useState } from 'react'
import {
  CalendarDays,
  ChevronDown,
  Printer,
  BedSingle,
  DollarSign,
  LogIn,
  LogOut,
  TrendingDown,
  Receipt,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Percent,
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useEffect, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../store/store'
import { fetchDailyCheckinsReport, fetchFinancialSummaryReport } from '../../features/reports/reportsSlice'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const areaChartData: any[] = []
const barChartData: any[] = []

// ─── Sub-components ──────────────────────────────────────────────────────────

function FinancialCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  value,
  containerBgColor,
}: {
  icon: React.ElementType
  iconBgColor: string
  iconColor: string
  title: string
  value: string
  containerBgColor: string
}) {
  return (
    <div className={`flex flex-col justify-center rounded-2xl p-5 ${containerBgColor}`}>
      <div className="flex items-center gap-2.5">
        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${iconBgColor} ${iconColor}`}>
          <Icon className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <span className="text-[13px] font-semibold text-slate-500">{title}</span>
      </div>
      <div className="mt-2.5 text-[22px] font-bold text-slate-800">{value}</div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-800">{label}</label>}
      <div className="relative">
        <select
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none transition-all focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    </div>
  )
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-slate-800">{label}</label>}
      <div className="relative">
        <input
          type="date"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-600 outline-none transition-all placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-2 focus:ring-[#0B4EA2]/10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function ReportStatCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  badgeText,
  badgeIcon: BadgeIcon,
  badgeBgColor,
  badgeColor,
  title,
  value,
  description,
}: {
  icon: React.ElementType
  iconBgColor: string
  iconColor: string
  badgeText: string
  badgeIcon?: React.ElementType
  badgeBgColor: string
  badgeColor: string
  title: string
  value: string
  description: string
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} strokeWidth={2} />
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeBgColor} ${badgeColor}`}>
          {BadgeIcon && <BadgeIcon className="h-3 w-3" strokeWidth={3} />}
          {badgeText}
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <span className="text-[13px] font-medium text-slate-500">{title}</span>
        <span className="mt-1 pb-1 text-[32px] font-bold leading-none text-slate-800">{value}</span>
        <span className="mt-1 text-xs font-medium text-slate-400">{description}</span>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { dailyCheckins, financialSummary } = useSelector((state: RootState) => state.reports)

  const [globalDuration, setGlobalDuration] = useState('today')
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('today')

  const fetchData = useCallback(() => {
    if (dateFrom) {
      dispatch(fetchDailyCheckinsReport(dateFrom))
    }
    if (dateFrom && dateTo) {
      dispatch(fetchFinancialSummaryReport({ startDate: dateFrom, endDate: dateTo }))
    }
  }, [dispatch, dateFrom, dateTo])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle global duration quick select
  useEffect(() => {
    const now = new Date()
    let from = new Date()
    let to = new Date()

    if (globalDuration === 'today') {
      from = now
      to = now
    } else if (globalDuration === 'week') {
      from.setDate(now.getDate() - now.getDay())
      to.setDate(from.getDate() + 6)
    } else if (globalDuration === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1)
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      return
    }

    const fromStr = from.toISOString().split('T')[0]
    const toStr = to.toISOString().split('T')[0]
    setDateFrom(fromStr)
    setDateTo(toStr)
  }, [globalDuration])

  const formatCurrency = (val?: number) => {
    if (val === undefined) return '$0'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
  }

  const occupancyVal = dailyCheckins.data?.occupancyRate ?? 0
  const totalRevenueVal = financialSummary.data?.grossRevenue ?? 0
  const checkinsVal = dailyCheckins.data?.summary.totalSuccessfulCheckIns ?? 0
  const pendingArrivals = (dailyCheckins.data?.summary.totalExpectedArrivals ?? 0) - checkinsVal

  const viewingText = dateFrom && dateTo 
    ? `${new Date(dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'Select date range'

  const pieChartData = useMemo(() => {
    const total = (financialSummary.data?.totalRoomRevenue || 0) + (financialSummary.data?.totalAdditionalServices || 0)
    if (total === 0) return []

    return [
      {
        name: 'Room Revenue',
        value: financialSummary.data?.totalRoomRevenue || 0,
        displayValue: formatCurrency(financialSummary.data?.totalRoomRevenue),
        percentage: `${(((financialSummary.data?.totalRoomRevenue || 0) / total) * 100).toFixed(1)}%`,
        color: '#3B82F6',
        icon: Landmark
      },
      {
        name: 'Additional Services',
        value: financialSummary.data?.totalAdditionalServices || 0,
        displayValue: formatCurrency(financialSummary.data?.totalAdditionalServices),
        percentage: `${(((financialSummary.data?.totalAdditionalServices || 0) / total) * 100).toFixed(1)}%`,
        color: '#10B981',
        icon: Banknote
      },
    ]
  }, [financialSummary.data, dateFrom, dateTo])

  const handlePrintReport = () => {
    const doc = new jsPDF()
    const primaryColor = [11, 78, 162]

    // Header
    doc.setFontSize(22)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text('PMS Financial & Operations Report', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Report Period: ${viewingText}`, 14, 28)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33)

    // 1. Operations Summary
    doc.setFontSize(16)
    doc.setTextColor(40)
    doc.text('Operations Summary', 14, 48)
    
    const opsData = [
      ['Occupancy Rate', `${dailyCheckins.data?.occupancyRate || 0}%`],
      ['Total Expected Arrivals', dailyCheckins.data?.summary.totalExpectedArrivals.toString() || '0'],
      ['Successful Check-ins', dailyCheckins.data?.summary.totalSuccessfulCheckIns.toString() || '0'],
      ['Pending Arrivals', pendingArrivals.toString()],
    ]

    autoTable(doc, {
      startY: 53,
      body: opsData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', width: 60 } }
    })

    // 2. Financial Overview
    const financialY = (doc as any).lastAutoTable.finalY + 15
    doc.setFontSize(16)
    doc.text('Financial Overview', 14, financialY)

    const finData = [
      ['Total Reservations', financialSummary.data?.totalReservations.toString() || '0'],
      ['Room Revenue', formatCurrency(financialSummary.data?.totalRoomRevenue)],
      ['Additional Services', formatCurrency(financialSummary.data?.totalAdditionalServices)],
      ['Discounts Given', formatCurrency(financialSummary.data?.totalDiscountsGiven)],
      ['Gross Revenue', formatCurrency(financialSummary.data?.grossRevenue)],
      ['Net Revenue', formatCurrency(financialSummary.data?.netRevenue)],
      ['Payments Collected', formatCurrency(financialSummary.data?.totalPaymentsCollected)],
      ['Outstanding Balances', formatCurrency(financialSummary.data?.totalOutstandingBalances)],
    ]

    autoTable(doc, {
      startY: financialY + 5,
      body: finData,
      theme: 'striped',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', width: 60 } }
    })

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' })
    }

    // Download and Open Print
    doc.save(`PMS_Report_${dateFrom}_to_${dateTo}.pdf`)
    window.open(doc.output('bloburl'), '_blank')
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top action row */}
      <div className="flex flex-wrap items-end justify-end gap-4">
        <div className="w-48">
          <FilterSelect label="Duration" value={globalDuration} onChange={setGlobalDuration}>
            <option value="">select</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </FilterSelect>
        </div>
        <button
          type="button"
          onClick={handlePrintReport}
          className="flex h-11 items-center gap-2 rounded-xl border-2 border-[#0B4EA2] px-6 text-sm font-semibold text-[#0B4EA2] transition-colors hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          Print Report
        </button>
      </div>

      {/* Primary filters row */}
      <div className="flex flex-wrap items-end gap-5">
        <div className="w-56">
          <DateInput label="Date from" value={dateFrom} onChange={setDateFrom} />
        </div>
        <div className="w-56">
          <DateInput label="Date To" value={dateTo} onChange={setDateTo} />
        </div>
        <div className="w-56">
          <FilterSelect label="Duration" value={duration} onChange={setDuration}>
            <option value="">select</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </FilterSelect>
        </div>
      </div>

      <div className="max-w-[800px] border-t border-slate-100" />

      {/* Current date view */}
      <div className="flex items-center gap-2 px-1 text-[13px] font-medium text-slate-500">
        <CalendarDays className="h-4 w-4 stroke-[1.5]" />
        <span>
          Viewing: <span className="font-semibold text-slate-800">{viewingText}</span>
        </span>
        {(dailyCheckins.status === 'loading' || financialSummary.status === 'loading') && (
          <RefreshCcw className="h-3 w-3 animate-spin text-slate-400" />
        )}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <ReportStatCard
          icon={BedSingle}
          iconBgColor="bg-[#EFF4FF]"
          iconColor="text-[#3B82F6]"
          badgeText={occupancyVal > 50 ? 'High' : 'Low'}
          badgeIcon={TrendingDown}
          badgeBgColor="bg-[#FFF1EB]"
          badgeColor="text-[#F97316]"
          title="Occupancy Rate"
          value={`${occupancyVal.toFixed(1)}%`}
          description={`${dailyCheckins.data?.summary.totalSuccessfulCheckIns ?? 0} room-nights sold`}
        />
        <ReportStatCard
          icon={DollarSign}
          iconBgColor="bg-[#EBFBF3]"
          iconColor="text-[#22C55E]"
          badgeText="+0%"
          badgeBgColor="bg-[#EBFBF3]"
          badgeColor="text-[#22C55E]"
          title="Total Revenue"
          value={formatCurrency(totalRevenueVal)}
          description={`Avg rate: ${formatCurrency(totalRevenueVal / (financialSummary.data?.totalReservations || 1))}`}
        />
        <ReportStatCard
          icon={LogIn}
          iconBgColor="bg-[#F3EFFF]"
          iconColor="text-[#8B5CF6]"
          badgeText={`${dailyCheckins.data?.summary.totalExpectedArrivals ?? 0} total`}
          badgeBgColor="bg-[#F3EFFF]"
          badgeColor="text-[#8B5CF6]"
          title="Check-ins"
          value={checkinsVal.toString()}
          description={`${pendingArrivals > 0 ? pendingArrivals : 0} pending arrivals`}
        />
        <ReportStatCard
          icon={LogOut}
          iconBgColor="bg-[#FFF1EB]"
          iconColor="text-[#F97316]"
          badgeText="0 total"
          badgeBgColor="bg-[#FFF1EB]"
          badgeColor="text-[#F97316]"
          title="Check-outs"
          value="0"
          description="0 expected departures"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
        {/* Area Chart */}
        <div className="col-span-1 xl:col-span-2 flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-slate-800">Revenue & Activity Trend</h3>
            <p className="mt-1 text-xs text-slate-500">Daily breakdown of check-ins, check-outs and revenue</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} ticks={[0, 1500, 3000, 4500, 6000]} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748B', marginBottom: '4px', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '11px', color: '#3B82F6' }}
                  formatter={(value) => <span className="font-semibold text-[#3B82F6]">{value} ($)</span>}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-span-1 xl:col-span-2 flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-[15px] font-semibold text-slate-800">Arrivals vs Departures</h3>
            <p className="mt-1 text-xs text-slate-500">Comparison over the period</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2} barSize={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={{ stroke: '#CBD5E1' }} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} dy={10} />
                <YAxis axisLine={{ stroke: '#CBD5E1' }} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} ticks={[0, 1, 2, 3]} />
                <RechartsTooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748B', marginBottom: '4px', fontWeight: 600 }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }}
                  formatter={(value) => {
                    const color = value === 'Check_ins' ? '#10B981' : '#F59E0B'
                    const label = value === 'Check_ins' ? 'Check-ins' : 'Check-outs'
                    return <span className="font-semibold mx-1" style={{ color }}>{label}</span>
                  }}
                />
                <Bar dataKey="Check_ins" fill="#10B981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Check_outs" fill="#F59E0B" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-[15px] font-semibold text-slate-800">Financial Overview</h3>
          <p className="mt-1 text-xs text-slate-500">Detailed financial breakdown</p>
        </div>
        
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FinancialCard
            icon={Receipt}
            iconBgColor="bg-[#EAF2FF]"
            iconColor="text-[#3B82F6]"
            title="Total Charges"
            value={formatCurrency(financialSummary.data?.grossRevenue)}
            containerBgColor="bg-[#F8FAFC]"
          />
          <FinancialCard
            icon={CheckCircle}
            iconBgColor="bg-[#DCFCE7]"
            iconColor="text-[#10B981]"
            title="Total Paid"
            value={formatCurrency(financialSummary.data?.totalPaymentsCollected)}
            containerBgColor="bg-[#F0FDF4]"
          />
          <FinancialCard
            icon={AlertCircle}
            iconBgColor="bg-[#FFEDD5]"
            iconColor="text-[#F59E0B]"
            title="Outstanding"
            value={formatCurrency(financialSummary.data?.totalOutstandingBalances)}
            containerBgColor="bg-[#FFF7ED]"
          />
          <FinancialCard
            icon={RefreshCcw}
            iconBgColor="bg-[#FEE2E2]"
            iconColor="text-[#EF4444]"
            title="Refunds"
            value="$0"
            containerBgColor="bg-[#FEF2F2]"
          />
          <FinancialCard
            icon={Percent}
            iconBgColor="bg-[#F3E8FF]"
            iconColor="text-[#A855F7]"
            title="Discounts"
            value={formatCurrency(financialSummary.data?.totalDiscountsGiven)}
            containerBgColor="bg-[#FAF5FF]"
          />
        </div>
      </div>

      {/* Payment Methods */}
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-800">Payment Methods</h3>
          <p className="mt-1 text-xs text-slate-500">Distribution by type</p>
        </div>
        
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-stretch">
          <div className="flex h-[240px] w-full items-center justify-center md:w-1/2 lg:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748B', marginBottom: '4px', fontWeight: 600 }}
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex w-full flex-col justify-center gap-6 md:w-1/2 xl:pr-32">
            {pieChartData.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="text-[13px] font-medium text-slate-600">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-slate-800">{item.displayValue}</div>
                    <div className="text-[11px] text-slate-400">{item.percentage}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
