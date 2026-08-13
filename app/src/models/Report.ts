export interface DailyCheckinsArrival {
  reservationId: string;
  guestName: string;
  roomType: string;
  roomNumber: string | null;
  currentStatus: string;
}

export interface DailyCheckinsSummary {
  totalExpectedArrivals: number;
  totalSuccessfulCheckIns: number;
}

export interface DailyCheckinsData {
  summary: DailyCheckinsSummary;
  arrivals: DailyCheckinsArrival[];
  occupancyRate: number;
}

export interface DailyCheckinsResponse {
  isSuccess: boolean;
  message: string;
  data: DailyCheckinsData;
  errors: string[];
}

export interface FinancialSummaryData {
  startDate: string;
  endDate: string;
  totalReservations: number;
  totalRoomRevenue: number;
  totalAdditionalServices: number;
  totalDiscountsGiven: number;
  grossRevenue: number;
  netRevenue: number;
  totalPaymentsCollected: number;
  totalOutstandingBalances: number;
}

export interface KpiMetric {
  currentValue: number
  previousValue: number
  changeValue: number
  changePercentage: number | null
  trend: 'Up' | 'Down' | 'Neutral'
  positiveChange: boolean | null
  percentageOfTotal: number | null
}

export interface KpiDashboardPeriod {
  startDate: string
  endDate: string
  previousStartDate: string
  previousEndDate: string
}

export interface KpiDashboardData {
  period: KpiDashboardPeriod
  currency: string
  occupancy: KpiMetric
  adr: KpiMetric
  revPar: KpiMetric
  averageLos: KpiMetric
  roomRevenue: KpiMetric
  roomNightsSold: KpiMetric
  availableRoomNights: KpiMetric
  cancellationRate: KpiMetric
  noShowRate: KpiMetric
}

// ─── Revenue Analytics ────────────────────────────────────────────────────────

export interface RevenueAnalyticsData {
  period: KpiDashboardPeriod
  currency: string
  netRevenue: KpiMetric
  roomRevenue: KpiMetric
  foodAndBeverageRevenue: KpiMetric
  otherRevenue: KpiMetric
  discounts: KpiMetric
  taxes: KpiMetric
}

// ─── Occupancy Forecast ───────────────────────────────────────────────────────

export interface OccupancyForecastPeriod extends KpiDashboardPeriod {
  numberOfDays: number
  isSingleDay: boolean
}

export interface OccupancyForecastPoint {
  value: number
  targetDate: string
  label: string
}

export interface OccupancyForecastSummary {
  averageOccupancyRate: KpiMetric
  averageLos: KpiMetric
  roomNights: KpiMetric
  expectedArrivals: OccupancyForecastPoint
  expectedDepartures: OccupancyForecastPoint
}

export interface ForecastDay {
  date: string
  dayOfWeek: string
  dayNumber: number
  forecastOccupiedRoomNights: number
  availableRoomNights: number
  occupancyPercentage: number
  level: 'Low' | 'Moderate' | 'High'
}

export interface OccupancyTrendPoint {
  date: string
  occupancyPercentage: number
  comparisonDate: string
  samePeriodLastYearPercentage: number
}

export interface OccupancyForecastData {
  period: OccupancyForecastPeriod
  summary: OccupancyForecastSummary
  forecastDays: ForecastDay[]
  occupancyTrend: {
    trendDays: number
    startDate: string
    endDate: string
    points: OccupancyTrendPoint[]
  }
}

// ─── Pace Report ──────────────────────────────────────────────────────────────

export interface PaceSummary {
  currentOnBooksRoomNights: number
  previousYearOnBooksRoomNights: number | null
  paceVarianceRoomNights: number | null
  paceVariancePercentage: number | null
  averageLeadTimeDays: number
  reservationCount: number
  availableRoomNights: number
  onBooksPercentage: number
  isComparisonAvailable: boolean
}

export interface WeeklyPace {
  startDate: string
  endDate: string
  currentOnBooksRoomNights: number
  previousYearOnBooksRoomNights: number | null
  varianceRoomNights: number | null
  variancePercentage: number | null
  availableRoomNights: number
  onBooksPercentage: number
  isComparisonAvailable: boolean
}

export interface PickupTrendPoint {
  date: string
  onBooksRoomNights: number
  pickupRoomNights: number | null
  previousYearOnBooksRoomNights: number | null
  previousYearPickupRoomNights: number | null
  isComparisonAvailable: boolean
}

export interface PaceCoverage {
  isAuthoritative: boolean
  currentCoverageComplete: boolean
  previousYearCoverageComplete: boolean
  coverageStartsAtUtc: string | null
  missingHistoryReservationCount: number
  comparisonAvailable: boolean
  warnings: string[]
}

export interface PaceReportData {
  period: { startDate: string; endDate: string }
  snapshotDate: string
  trendDays: number
  summary: PaceSummary
  weeklyPace: WeeklyPace[]
  pickupTrend: PickupTrendPoint[]
  coverage: PaceCoverage
  warnings: string[]
}

// ─── Channel Performance ──────────────────────────────────────────────────────

export interface ChannelSummary {
  totalBookings: number
  totalRevenue: number
  currency: string
  adr: number
  averageLengthOfStay: number
  cancellationRate: number
  noShowRate: number
  cancellationRateAvailable: boolean
  noShowRateAvailable: boolean
}

export interface ChannelData {
  channelKey: string
  channelName: string
  bookingCount: number
  bookingPercentage: number
  roomNights: number
  revenue: number
  revenuePercentage: number
  roomRevenue: number
  adr: number
  revPar: number
  cancellationRate: number
  noShowRate: number
  conversionRate: number | null
  cancellationRateAvailable: boolean
  noShowRateAvailable: boolean
  conversionRateAvailable: boolean
}

export interface ChannelCapabilities {
  conversionRateAvailable: boolean
  noShowRateAvailable: boolean
}

export interface ChannelPerformanceData {
  period: { startDate: string; endDate: string }
  summary: ChannelSummary
  channels: ChannelData[]
  capabilities: ChannelCapabilities
  warnings: string[]
}

// ─── Cancellation & No Show ───────────────────────────────────────────────────

export interface CancellationSummaryMetric {
  currentValue: number | null
  previousValue: number | null
  changeValue: number | null
  changePercentage: number | null
  trend: 'Up' | 'Down' | 'Neutral'
  positiveChange: boolean | null
  available: boolean
}

export interface CancellationSummaryCards {
  cancellationRate: CancellationSummaryMetric
  cancelledBookings: CancellationSummaryMetric
  cancelledLostRevenue: CancellationSummaryMetric
  noShowRate: CancellationSummaryMetric
  noShowBookings: CancellationSummaryMetric
  noShowLostRevenue: CancellationSummaryMetric
}

export interface CancellationTrendPoint {
  date: string
  cancelledBookings: number
  eligibleBookings: number
  cancellationRate: number
}

export interface CancellationReason {
  reason: string
  count: number
  percentage: number
}

export interface NoShowTrendPoint {
  date: string
  noShowBookings: number
  eligibleBookings: number
  noShowRate: number
}

export interface CancellationChannelData {
  channelKey: string
  channelName: string
  eligibleBookings: number
  cancelledBookings: number
  cancellationRate: number
  lostRevenue: number | null
  lostRevenueAvailable: boolean
}

export interface NoShowChannelData {
  channelKey: string
  channelName: string
  eligibleBookings: number
  noShowBookings: number
  noShowRate: number
  lostRevenue: number | null
  lostRevenueAvailable: boolean
}

export interface CombinedSummarySection {
  bookingCount: number
  rate: number
  lostRevenue: number | null
  lostRevenuePercentageOfTotalRevenue: number | null
  lostRevenueAvailable: boolean
}

export interface CombinedSummaryData {
  cancelled: CombinedSummarySection
  noShow: CombinedSummarySection
  combined: CombinedSummarySection
}

export interface CancellationReportCapabilities {
  cancellationReasonsAvailable: boolean
  noShowAvailable: boolean
  noShowTrendAvailable: boolean
  cancelledLostRevenueAvailable: boolean
  noShowLostRevenueAvailable: boolean
}

export interface CancellationReportData {
  period: { startDate: string; endDate: string }
  summaryCards: CancellationSummaryCards
  cancellationTrend: CancellationTrendPoint[]
  cancellationReasons: CancellationReason[]
  noShowTrend: NoShowTrendPoint[] | null
  cancellationByChannel: CancellationChannelData[]
  noShowByChannel: NoShowChannelData[]
  combinedSummary: CombinedSummaryData
  capabilities: CancellationReportCapabilities
  warnings: string[]
}

