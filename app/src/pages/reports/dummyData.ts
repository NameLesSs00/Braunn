// ─── Dummy Data for all Report sections ─────────────────────────────────────

export const dummyTabs = [
  { id: 'kpi', label: 'KPI Dashboard' },
  { id: 'revenue', label: 'Revenue Analytics' },
  { id: 'occupancy', label: 'Occupancy & Forecast' },
  { id: 'pace', label: 'Pace Report' },
  { id: 'channel', label: 'Channel Performance' },
  { id: 'cancellation', label: 'Cancellation & No Show' },
];

export const dummyKpiCards = [
  {
    id: 'occupancy',
    label: 'Occupancy Rate',
    value: '72.5%',
    trend: '+8.4%',
    trendUp: true,
    comparison: 'vs Yesterday',
    icon: 'pie',
    iconColor: '#22C55E', // Green
    iconBg: '#DCFCE7',
  },
  {
    id: 'adr',
    label: 'ADR',
    value: '135.60',
    trend: '+5.6%',
    trendUp: true,
    comparison: 'vs Yesterday',
    icon: 'tag',
    iconColor: '#3B82F6', // Blue
    iconBg: '#DBEAFE',
  },
  {
    id: 'revpar',
    label: 'RevPAR',
    value: '98.35',
    trend: '+14.3%',
    trendUp: true,
    comparison: 'vs Yesterday',
    icon: 'trending',
    iconColor: '#3B82F6', // Blue
    iconBg: '#DBEAFE',
  },
  {
    id: 'los',
    label: 'Average LOS',
    value: '2.8',
    trend: '-0.2',
    trendUp: false,
    comparison: 'vs Yesterday',
    icon: 'clock',
    iconColor: '#8B5CF6', // Purple
    iconBg: '#EDE9FE',
  },
  {
    id: 'revenue',
    label: "Today's Revenue",
    value: '12,701.80',
    trend: '+15.2%',
    trendUp: true,
    comparison: 'vs Yesterday',
    icon: 'dollar',
    iconColor: '#22C55E', // Green
    iconBg: '#DCFCE7',
    prefix: '$',
  },
  {
    id: 'roomsSold',
    label: 'Rooms Sold',
    value: '73',
    trend: '+7',
    trendUp: true,
    comparison: 'vs Yesterday',
    icon: 'bed',
    iconColor: '#3B82F6', // Blue
    iconBg: '#DBEAFE',
  },
  {
    id: 'availableRooms',
    label: 'Available Rooms',
    value: '27',
    trend: '-7',
    trendUp: false,
    comparison: 'vs Yesterday',
    icon: 'building',
    iconColor: '#F59E0B', // Yellow
    iconBg: '#FEF3C7',
  },
  {
    id: 'cancellation',
    label: 'Cancellation %',
    value: '5.2%',
    trend: '-1.1%',
    trendUp: false,
    comparison: 'vs Yesterday',
    icon: 'xCircle',
    iconColor: '#EF4444', // Red
    iconBg: '#FEE2E2',
  },
  {
    id: 'noShow',
    label: 'No Show %',
    value: '2.1%',
    trend: '-0.6%',
    trendUp: false,
    comparison: 'vs Yesterday',
    icon: 'userX',
    iconColor: '#EF4444', // Red
    iconBg: '#FEE2E2',
  },
];

export const occupancyTrendData = [
  { date: 'Jul 7', value: 60 },
  { date: 'Jul 8', value: 58 },
  { date: 'Jul 9', value: 63 },
  { date: 'Jul 10', value: 55 },
  { date: 'Jul 11', value: 67 },
  { date: 'Jul 12', value: 64 },
  { date: 'Jul 13', value: 72.5 },
];

export const adrTrendData = [
  { date: 'Jul 7', value: 120 },
  { date: 'Jul 8', value: 115 },
  { date: 'Jul 9', value: 130 },
  { date: 'Jul 10', value: 118 },
  { date: 'Jul 11', value: 125 },
  { date: 'Jul 12', value: 128 },
  { date: 'Jul 13', value: 135.6 },
];

export const revenueTrendData = [
  { date: 'Jul 7', value: 11000 },
  { date: 'Jul 8', value: 9500 },
  { date: 'Jul 9', value: 13000 },
  { date: 'Jul 10', value: 10200 },
  { date: 'Jul 11', value: 11800 },
  { date: 'Jul 12', value: 12100 },
  { date: 'Jul 13', value: 12701 },
];

export const roomStatusData = [
  { name: 'Occupied', value: 73, percent: '73.0%', color: '#2563EB' },
  { name: 'Available', value: 27, percent: '27.0%', color: '#22C55E' },
  { name: 'Out of Order', value: 0, percent: '0.0%', color: '#F59E0B' },
  { name: 'Out of Service', value: 0, percent: '0.0%', color: '#6B7280' },
];

export const marketSegmentData = [
  { segment: 'Leisure', rooms: 45, percent: '61.6%', adr: 142.30, revpar: 87.56 },
  { segment: 'Corporate', rooms: 18, percent: '24.7%', adr: 128.40, revpar: 63.28 },
  { segment: 'Group', rooms: 7, percent: '9.6%', adr: 118.60, revpar: 40.72 },
  { segment: 'Other', rooms: 3, percent: '4.1%', adr: 110.00, revpar: 20.85 },
];

export const recentReservations = [
  { guest: 'John Smith', room: '101', checkIn: 'Jul 13, 2026', nights: 3, channel: 'Booking.com', status: 'Checked In' },
  { guest: 'Anna Müller', room: '205', checkIn: 'Jul 13, 2026', nights: 2, channel: 'Direct', status: 'Checked In' },
  { guest: 'Mohamed Ali', room: '309', checkIn: 'Jul 13, 2026', nights: 4, channel: 'Expedia', status: 'Checked In' },
  { guest: 'Sophie Martin', room: '412', checkIn: 'Jul 13, 2026', nights: 1, channel: 'Walk In', status: 'Checked In' },
];

// ─── Revenue Analytics Tab (Tab 2) ───────────────────────────────────────────

export const revenueKpiCards = [
  {
    id: 'net_revenue',
    label: 'Net Revenue',
    value: '12,701.80',
    suffix: 'USD',
    sub: 'vs Previous Period',
    trend: '+15.2%',
    trendUp: true,
    iconColor: '#22C55E',
    iconBg: '#DCFCE7',
    icon: 'dollar',
  },
  {
    id: 'room_revenue',
    label: 'Room Revenue',
    value: '9,842.40',
    suffix: 'USD',
    sub: '77.5% of Total',
    trend: '+14.3%',
    trendUp: true,
    iconColor: '#3B82F6',
    iconBg: '#DBEAFE',
    icon: 'bed',
  },
  {
    id: 'fnb_revenue',
    label: 'F&B Revenue',
    value: '1,545.30',
    suffix: 'USD',
    sub: '12.2% of Total',
    trend: '+12.6%',
    trendUp: true,
    iconColor: '#F97316',
    iconBg: '#FFEDD5',
    icon: 'food',
  },
  {
    id: 'other_revenue',
    label: 'Other Revenue',
    value: '1,043.10',
    suffix: 'USD',
    sub: '8.2% of Total',
    trend: '+17.8%',
    trendUp: true,
    iconColor: '#8B5CF6',
    iconBg: '#EDE9FE',
    icon: 'tag',
  },
  {
    id: 'discounts',
    label: 'Discounts',
    value: '-729.00',
    suffix: 'USD',
    sub: '-5.7% of Total',
    trend: '-8.5%',
    trendUp: false,
    iconColor: '#EF4444',
    iconBg: '#FEE2E2',
    icon: 'percent',
  },
  {
    id: 'taxes',
    label: 'Taxes',
    value: '1,500.00',
    suffix: 'USD',
    sub: '11.8% of Total',
    trend: '+10.2%',
    trendUp: true,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    icon: 'receipt',
  },
];

export const revenueTrend14Days = [
  { date: 'Jun 30', value: 8200 },
  { date: 'Jul 1',  value: 9100 },
  { date: 'Jul 2',  value: 9800 },
  { date: 'Jul 3',  value: 10500 },
  { date: 'Jul 4',  value: 10100 },
  { date: 'Jul 5',  value: 9600 },
  { date: 'Jul 6',  value: 10800 },
  { date: 'Jul 7',  value: 11000 },
  { date: 'Jul 8',  value: 9500 },
  { date: 'Jul 9',  value: 13000 },
  { date: 'Jul 10', value: 10200 },
  { date: 'Jul 11', value: 11800 },
  { date: 'Jul 12', value: 12100 },
  { date: 'Jul 13', value: 14800 },
];

export const revenueByRoomTypeData = [
  { name: 'Deluxe Room',    value: 4250.6,  percent: '33.5%', color: '#2563EB' },
  { name: 'Standard Room',  value: 3120.8,  percent: '24.6%', color: '#22C55E' },
  { name: 'Suite',          value: 2410.0,  percent: '19.0%', color: '#F59E0B' },
  { name: 'Executive Room', value: 1350.0,  percent: '10.6%', color: '#7C3AED' },
  { name: 'Other',          value: 1570.4,  percent: '12.3%', color: '#9CA3AF' },
];

export const revenueByRatePlanData = [
  { name: 'Best Available Rate', value: 4560.20, max: 5000 },
  { name: 'Advance Purchase',    value: 2980.60, max: 5000 },
  { name: 'Non Refundable',      value: 2150.40, max: 5000 },
  { name: 'Corporate Rate',      value: 1620.80, max: 5000 },
  { name: 'Weekend Offer',       value: 780.00,  max: 5000 },
  { name: 'Other',               value: 609.60,  max: 5000 },
];

export const revenueByMarketSegmentData = [
  { segment: 'Leisure',   roomRev: 6250.80, fnb: 1250.40, other: 690.20,  discounts: -420.00, taxes: 780.60,  net: 8551.00,  pct: '67.3%', adr: 142.30, revpar: 87.56 },
  { segment: 'Corporate', roomRev: 2780.60, fnb: 690.20,  other: 320.00,  discounts: -210.00, taxes: 450.80,  net: 4031.60,  pct: '31.7%', adr: 128.40, revpar: 63.28 },
  { segment: 'Group',     roomRev: 1120.40, fnb: 320.00,  other: 199.60,  discounts: -90.00,  taxes: 180.40,  net: 1730.40,  pct: '13.6%', adr: 118.60, revpar: 40.72 },
  { segment: 'Other',     roomRev: 690.60,  fnb: 199.60,  other: 110.30,  discounts: -9.00,   taxes: 88.20,   net: 1079.70,  pct: '8.5%',  adr: 110.00, revpar: 20.85 },
  // totals row
  { segment: 'Total',     roomRev: 10842.40,fnb: 2460.20, other: 1320.10, discounts: -729.00, taxes: 1500.00, net: 12701.80, pct: '100%',  adr: 135.60, revpar: 98.35, isTotal: true },
];

// ─── Occupancy & Forecast Tab (Tab 3) ────────────────────────────────────────

export const occupancyKpiStats = [
  { id: 'occ_avg',    label: 'Occupancy Rate (Avg)', value: '72.5%',  sub: 'vs Previous Period', trend: '+8.4%',  trendUp: true,  icon: 'pie',     iconColor: '#3B82F6', iconBg: '#DBEAFE' },
  { id: 'alos',       label: 'Average LOS',           value: '2.8',    sub: 'vs Previous Period', trend: '-0.2',   trendUp: false, icon: 'bed',     iconColor: '#22C55E', iconBg: '#DCFCE7' },
  { id: 'room_nights',label: 'Room Nights',           value: '1,152',  sub: 'vs Previous Period', trend: '+12.6%', trendUp: true,  icon: 'moon',    iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
  { id: 'arrivals',   label: 'Expected Arrivals',     value: '78',     sub: 'Tomorrow',           trend: null,     trendUp: null,  icon: 'calendar_check', iconColor: '#F97316', iconBg: '#FFEDD5' },
  { id: 'departures', label: 'Expected Departures',   value: '65',     sub: 'Tomorrow',           trend: null,     trendUp: null,  icon: 'calendar_x',     iconColor: '#EF4444', iconBg: '#FEE2E2' },
];

// Calendar: 5 weeks × 7 days, starting Mon Jul 14 2026
export const forecastCalendarData = [
  // Week 1
  { date: 'Jul 14', day: 13, pct: 72 }, { date: 'Jul 15', day: 14, pct: 75 }, { date: 'Jul 16', day: 15, pct: 78 }, { date: 'Jul 17', day: 16, pct: 80 }, { date: 'Jul 18', day: 17, pct: 82 }, { date: 'Jul 19', day: 18, pct: 85 }, { date: 'Jul 20', day: 19, pct: 83 },
  // Week 2
  { date: 'Jul 21', day: 20, pct: 76 }, { date: 'Jul 22', day: 21, pct: 78 }, { date: 'Jul 23', day: 22, pct: 74 }, { date: 'Jul 24', day: 23, pct: 71 }, { date: 'Jul 25', day: 24, pct: 73 }, { date: 'Jul 26', day: 25, pct: 79 }, { date: 'Jul 27', day: 26, pct: 81 },
  // Week 3
  { date: 'Jul 28', day: 27, pct: 70 }, { date: 'Jul 29', day: 28, pct: 68 }, { date: 'Jul 30', day: 29, pct: 69 }, { date: 'Jul 31', day: 30, pct: 72 }, { date: 'Aug 1',  day: 31, pct: 75 }, { date: 'Aug 2',  day: 25, pct: 77 }, { date: 'Aug 3',  day: 2,  pct: 76 },
  // Week 4
  { date: 'Aug 4',  day: 3,  pct: 71 }, { date: 'Aug 5',  day: 4,  pct: 73 }, { date: 'Aug 6',  day: 5,  pct: 75 }, { date: 'Aug 7',  day: 6,  pct: 77 }, { date: 'Aug 8',  day: 7,  pct: 81 }, { date: 'Aug 9',  day: 8,  pct: 84 }, { date: 'Aug 10', day: 9,  pct: 82 },
  // Week 5
  { date: 'Aug 11', day: 10, pct: 76 }, { date: 'Aug 12', day: 11, pct: 74 }, { date: 'Aug 13', day: 12, pct: 72 }, { date: 'Aug 14', day: 13, pct: 70 }, { date: 'Aug 15', day: 14, pct: 69 }, { date: 'Aug 16', day: 15, pct: 73 }, { date: 'Aug 17', day: 16, pct: 75 },
];

const occ30 = [55,57,60,58,63,67,65,62,68,70,66,72,74,71,73,75,78,76,80,82,79,77,81,83,85,84,82,80,78,76];
const ly30  = [50,52,54,51,56,60,58,55,61,63,59,65,67,64,66,68,70,69,72,74,71,69,73,75,77,76,74,72,70,68];
const dates30 = ['Jun 14','Jun 15','Jun 16','Jun 17','Jun 18','Jun 19','Jun 20','Jun 21','Jun 22','Jun 23','Jun 24','Jun 25','Jun 26','Jun 27','Jun 28','Jun 29','Jun 30','Jul 1','Jul 2','Jul 3','Jul 4','Jul 5','Jul 6','Jul 7','Jul 8','Jul 9','Jul 10','Jul 11','Jul 12','Jul 13'];

export const occupancyTrendData30 = dates30.map((date, i) => ({ date, occupancy: occ30[i], lastYear: ly30[i] }));

const alosValues = [2.1,2.3,2.2,2.4,2.0,2.5,2.3,2.2,2.6,2.4,2.5,2.7,2.8,2.6,2.7,2.9,2.8,2.7,2.5,2.6,2.8,2.7,2.6,2.8,2.9,2.8,2.7,2.8,2.7,2.8];
export const alosData30 = dates30.map((date, i) => ({ date, value: alosValues[i] }));

export const losDistributionData = [
  { name: '1 Night',    value: 35, color: '#2563EB' },
  { name: '2 Nights',   value: 27, color: '#22C55E' },
  { name: '3-4 Nights', value: 18, color: '#F97316' },
  { name: '5-7 Nights', value: 12, color: '#8B5CF6' },
  { name: '8+ Nights',  value: 8,  color: '#9CA3AF' },
];

export const bookingWindowData = [
  { label: '0 - 3 Days',   count: 120, pct: '20.8%' },
  { label: '4 - 7 Days',   count: 142, pct: '24.7%' },
  { label: '8 - 14 Days',  count: 158, pct: '27.5%' },
  { label: '15 - 30 Days', count: 98,  pct: '17.1%' },
  { label: '31 - 60 Days', count: 38,  pct: '6.6%'  },
  { label: '60+ Days',     count: 15,  pct: '2.6%'  },
];

// ─── Pace Report Tab (Tab 4) ──────────────────────────────────────────────────

export const paceKpiStats = [
  { id: 'pace_today',   label: 'Booking Pace (Today)',              value: '401',  unit: 'Rooms', sub: 'vs Same Day Last Year', trend: '+12.6%', trendUp: true,  icon: 'calendar_today',  iconColor: '#3B82F6', iconBg: '#DBEAFE' },
  { id: 'pace_ly',      label: 'Booking Pace (This Time Last Year)',value: '356',  unit: 'Rooms', sub: null,                    trend: null,     trendUp: null,  icon: 'calendar_check',  iconColor: '#22C55E', iconBg: '#DCFCE7' },
  { id: 'pace_var',     label: 'Pace Variance',                     value: '+45',  unit: 'Rooms', sub: null,                    trend: '+12.6%', trendUp: true,  icon: 'trending',        iconColor: '#F97316', iconBg: '#FFEDD5' },
  { id: 'on_books_pct', label: '% of Total on Books',               value: '48.7%',unit: null,    sub: 'vs Same Day Last Year', trend: '+3.4%',  trendUp: true,  icon: 'pie',             iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
  { id: 'days_arrival', label: 'Days to Arrival (Avg)',             value: '27.4', unit: 'Days',  sub: null,                    trend: null,     trendUp: null,  icon: 'hourglass',       iconColor: '#06B6D4', iconBg: '#CFFAFE' },
];

export const paceComparisonData = [
  { period: 'Jul 13 - Jul 19', thisYear: 401, lastYear: 356, variance: 45,  pctVariance: '+12.6%', onBooks: '48.7%', isTotal: false },
  { period: 'Jul 20 - Jul 26', thisYear: 512, lastYear: 438, variance: 74,  pctVariance: '+16.9%', onBooks: '42.3%', isTotal: false },
  { period: 'Jul 27 - Aug 02', thisYear: 476, lastYear: 399, variance: 77,  pctVariance: '+19.3%', onBooks: '40.8%', isTotal: false },
  { period: 'Aug 03 - Aug 09', thisYear: 389, lastYear: 310, variance: 79,  pctVariance: '+25.5%', onBooks: '38.6%', isTotal: false },
  { period: 'Aug 10 - Aug 16', thisYear: 312, lastYear: 246, variance: 66,  pctVariance: '+26.8%', onBooks: '36.2%', isTotal: false },
  { period: 'Aug 17 - Aug 23', thisYear: 255, lastYear: 190, variance: 65,  pctVariance: '+34.2%', onBooks: '33.5%', isTotal: false },
  { period: 'Aug 24 - Aug 30', thisYear: 198, lastYear: 141, variance: 57,  pctVariance: '+40.4%', onBooks: '31.7%', isTotal: false },
  { period: 'Total',           thisYear: 2543,lastYear: 2080,variance: 463, pctVariance: '+22.3%', onBooks: '39.7%', isTotal: true  },
];

const pickupDates = ['Jun 14','Jun 15','Jun 16','Jun 17','Jun 18','Jun 19','Jun 20','Jun 21','Jun 22','Jun 23','Jun 24','Jun 25','Jun 26','Jun 27','Jun 28','Jun 29','Jun 30','Jul 1','Jul 2','Jul 3','Jul 4','Jul 5','Jul 6','Jul 7','Jul 8','Jul 9','Jul 10','Jul 11','Jul 12','Jul 13'];
const pickupThis = [5,10,15,18,22,25,20,18,28,32,24,35,38,30,32,36,42,38,44,48,42,40,48,52,55,50,45,42,38,22];
const pickupLast = [-5,-8,-12,-10,-15,-18,-12,-10,-20,-22,-16,-24,-26,-20,-22,-26,-30,-25,-28,-32,-26,-24,-30,-34,-36,-32,-28,-26,-22,-18];
export const pickupTrendData = pickupDates.map((date, i) => ({ date, thisYear: pickupThis[i], lastYear: pickupLast[i] }));

export const bookingPaceByDateData = [
  { period: 'Jul 13-19', thisYear: 401, lastYear: 356 },
  { period: 'Jul 20-26', thisYear: 512, lastYear: 438 },
  { period: 'Jul 27-Aug 2', thisYear: 476, lastYear: 399 },
  { period: 'Aug 03-09', thisYear: 389, lastYear: 310 },
  { period: 'Aug 17-23', thisYear: 255, lastYear: 190 },
  { period: 'Aug 24-30', thisYear: 198, lastYear: 141 },
];

export const paceByRoomTypeData = [
  { roomType: 'Deluxe Room',   thisYear: 812,  lastYear: 654,  variance: 158, pctVariance: '+24.2%', onBooks: '45.1%', isTotal: false },
  { roomType: 'Standard Room', thisYear: 1024, lastYear: 842,  variance: 182, pctVariance: '+21.6%', onBooks: '39.8%', isTotal: false },
  { roomType: 'Suite',         thisYear: 487,  lastYear: 406,  variance: 81,  pctVariance: '+20.0%', onBooks: '52.3%', isTotal: false },
  { roomType: 'Executive Room',thisYear: 220,  lastYear: 146,  variance: 74,  pctVariance: '+50.7%', onBooks: '47.6%', isTotal: false },
  { roomType: 'Total',         thisYear: 2543, lastYear: 2048, variance: 495, pctVariance: '+24.2%', onBooks: '43.1%', isTotal: true  },
];

// ─── Channel Performance Tab (Tab 5) ──────────────────────────────────────────

export const channelKpiStats = [
  { id: 'ch_bookings', label: 'Total Bookings',      value: '401',       unit: null,  sub: 'vs Previous Period', trend: '+12.6%', trendUp: true,  icon: 'briefcase', iconColor: '#3B82F6', iconBg: '#DBEAFE' },
  { id: 'ch_revenue',  label: 'Total Revenue',       value: '12,701.80', unit: 'USD', sub: 'vs Previous Period', trend: '+15.2%', trendUp: true,  icon: 'dollar',    iconColor: '#22C55E', iconBg: '#DCFCE7' },
  { id: 'ch_adr',      label: 'ADR (Overall)',       value: '135.60',    unit: 'USD', sub: 'vs Previous Period', trend: '+5.6%',  trendUp: true,  icon: 'chart',     iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
  { id: 'ch_los',      label: 'Avg. Length of Stay', value: '2.8',       unit: null,  sub: 'vs Previous Period', trend: '-0.2',   trendUp: false, icon: 'clock',     iconColor: '#F97316', iconBg: '#FFEDD5' },
  { id: 'ch_canc',     label: 'Cancellation Rate',   value: '5.2%',      unit: null,  sub: 'vs Previous Period', trend: '-1.1%',  trendUp: false, icon: 'percent',   iconColor: '#06B6D4', iconBg: '#CFFAFE' },
  { id: 'ch_noshow',   label: 'No Show Rate',        value: '2.1%',      unit: null,  sub: 'vs Previous Period', trend: '-0.6%',  trendUp: false, icon: 'person_x',  iconColor: '#EF4444', iconBg: '#FEE2E2' },
];

export const bookingsByChannelData = [
  { name: 'Booking.com',    value: 132, pct: '32.9%', color: '#2563EB' },
  { name: 'Direct Website', value: 98,  pct: '24.4%', color: '#22C55E' },
  { name: 'Expedia',        value: 72,  pct: '18.0%', color: '#F59E0B' },
  { name: 'Agoda',          value: 48,  pct: '12.0%', color: '#8B5CF6' },
  { name: 'Walk-in',        value: 31,  pct: '7.7%',  color: '#06B6D4' },
  { name: 'Others',         value: 20,  pct: '5.0%',  color: '#9CA3AF' },
];

export const revenueByChannelData = [
  { name: 'Booking.com',    value: 5280.60, pct: '41.6%', color: '#2563EB' },
  { name: 'Direct Website', value: 3140.80, pct: '24.7%', color: '#22C55E' },
  { name: 'Expedia',        value: 2210.40, pct: '17.4%', color: '#F59E0B' },
  { name: 'Agoda',          value: 1340.30, pct: '10.6%', color: '#8B5CF6' },
  { name: 'Walk-in',        value: 610.20,  pct: '4.8%',  color: '#06B6D4' },
  { name: 'Others',         value: 119.60,  pct: '0.9%',  color: '#9CA3AF' },
];

export const adrByChannelData = [
  { name: 'Direct Website', value: 130.10 },
  { name: 'Walk-in',        value: 129.68 },
  { name: 'Booking.com',    value: 129.11 },
  { name: 'Expedia',        value: 130.41 },
  { name: 'Agoda',          value: 129.38 },
  { name: 'Others',         value: 127.47 },
];

export const channelOverviewData = [
  { channel: 'Booking.com',    count: 132, pct: '32.9%', roomNights: 268, revenue: '5,280.60', adr: '129.11', revpar: '98.35',  canc: '6.1%', noShow: '1.5%', conv: '2.81%',  isTotal: false },
  { channel: 'Direct Website', count: 98,  pct: '24.4%', roomNights: 202, revenue: '3,140.80', adr: '130.10', revpar: '105.72', canc: '4.1%', noShow: '1.0%', conv: '3.42%',  isTotal: false },
  { channel: 'Expedia',        count: 72,  pct: '18.0%', roomNights: 146, revenue: '2,210.40', adr: '130.41', revpar: '87.14',  canc: '5.6%', noShow: '1.4%', conv: '2.36%',  isTotal: false },
  { channel: 'Agoda',          count: 48,  pct: '12.0%', roomNights: 96,  revenue: '1,340.30', adr: '129.38', revpar: '72.68',  canc: '7.3%', noShow: '2.1%', conv: '1.94%',  isTotal: false },
  { channel: 'Walk-in',        count: 31,  pct: '7.7%',  roomNights: 54,  revenue: '610.20',   adr: '129.68', revpar: '52.18',  canc: '2.4%', noShow: '0.0%', conv: '-',      isTotal: false },
  { channel: 'Others',         count: 20,  pct: '5.0%',  roomNights: 46,  revenue: '119.60',   adr: '127.47', revpar: '10.32',  canc: '3.1%', noShow: '0.0%', conv: '-',      isTotal: false },
  { channel: 'Total',          count: 401, pct: '100%',  roomNights: 812, revenue: '12,701.80',adr: '135.60', revpar: '98.35',  canc: '5.2%', noShow: '2.1%', conv: '2.61%',  isTotal: true  },
];

// ─── Cancellation & No Show Tab (Tab 6) ───────────────────────────────────────

export const cancellationKpiStats = [
  { id: 'c_rate',   label: 'Cancellation Rate',        value: '5.2%',      unit: null,  trend: '+1.1%',  trendUp: true,  goodIsDown: true, icon: 'x_circle', iconColor: '#EF4444', iconBg: '#FEE2E2' },
  { id: 'c_books',  label: 'Cancelled Bookings',       value: '56',        unit: null,  trend: '+8.2%',  trendUp: true,  goodIsDown: true, icon: 'calendar_x', iconColor: '#EF4444', iconBg: '#FEE2E2' },
  { id: 'c_rev',    label: 'Lost Revenue (Cancelled)', value: '2,340.50',  unit: 'USD', trend: '+12.6%', trendUp: true,  goodIsDown: true, icon: 'dollar', iconColor: '#F97316', iconBg: '#FFEDD5' },
  { id: 'n_rate',   label: 'No Show Rate',             value: '2.1%',      unit: null,  trend: '-0.6%',  trendUp: false, goodIsDown: true, icon: 'person_clock', iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
  { id: 'n_books',  label: 'No Show Bookings',         value: '23',        unit: null,  trend: '-4.2%',  trendUp: false, goodIsDown: true, icon: 'person_x', iconColor: '#8B5CF6', iconBg: '#EDE9FE' },
  { id: 'n_rev',    label: 'Lost Revenue (No Show)',   value: '1,015.00',  unit: 'USD', trend: '-3.8%',  trendUp: false, goodIsDown: true, icon: 'dollar', iconColor: '#F59E0B', iconBg: '#FEF3C7' },
];

const cancDates = ['Jun 14','Jun 15','Jun 16','Jun 17','Jun 18','Jun 19','Jun 20','Jun 21','Jun 22','Jun 23','Jun 24','Jun 25','Jun 26','Jun 27','Jun 28','Jun 29','Jun 30','Jul 01','Jul 02','Jul 03','Jul 04','Jul 05','Jul 06','Jul 07','Jul 08','Jul 09','Jul 10','Jul 11','Jul 12','Jul 13'];
const cancRates = [6.2, 6.8, 7.5, 6.0, 5.5, 4.8, 6.2, 5.5, 7.2, 6.8, 6.4, 6.0, 5.0, 5.8, 6.2, 7.0, 6.5, 4.8, 5.5, 6.8, 7.4, 6.2, 5.4, 6.0, 5.2, 4.8, 6.0, 5.5, 5.0, 5.2];
const cancBooks = [18, 20, 22, 16, 14, 12, 18, 14, 24, 22, 20, 18, 12, 16, 18, 22, 20, 12, 14, 22, 24, 18, 14, 16, 14, 12, 16, 14, 12, 14];

const noShowRates = [2.2, 2.5, 2.0, 2.4, 2.1, 2.8, 2.4, 3.2, 2.6, 2.0, 2.8, 2.2, 3.0, 2.4, 1.8, 2.5, 3.2, 2.8, 2.1, 2.5, 3.0, 2.4, 2.0, 2.6, 2.2, 1.8, 2.4, 2.0, 1.8, 2.1];
const noShowBooks = [12, 14, 10, 12, 10, 16, 12, 18, 14, 10, 16, 12, 18, 14, 8,  14, 18, 16, 10, 14, 18, 12, 10, 14, 12, 8,  12, 10, 8,  10];

export const cancellationTrendData = cancDates.map((date, i) => ({ date, rate: cancRates[i], bookings: cancBooks[i] }));
export const noShowTrendData = cancDates.map((date, i) => ({ date, rate: noShowRates[i], bookings: noShowBooks[i] }));

export const cancellationReasonsData = [
  { name: 'Change of Plans',     value: 40, pct: '35.7%', color: '#2563EB' },
  { name: 'Price Too High',      value: 22, pct: '19.6%', color: '#22C55E' },
  { name: 'Found Better Option', value: 18, pct: '16.1%', color: '#F97316' },
  { name: 'Trip Cancelled',      value: 14, pct: '12.5%', color: '#EC4899' },
  { name: 'Weather',             value: 8,  pct: '7.1%',  color: '#8B5CF6' },
  { name: 'Others',              value: 6,  pct: '5.4%',  color: '#9CA3AF' },
  { name: 'No Reason Given',     value: 4,  pct: '3.6%',  color: '#CBD5E1' },
];

export const cancellationByChannelData = [
  { channel: 'Booking.com',    bookings: 22, rate: '6.6%', revenue: '980.50', isTotal: false },
  { channel: 'Expedia',        bookings: 12, rate: '5.1%', revenue: '540.00', isTotal: false },
  { channel: 'Direct Website', bookings: 9,  rate: '4.2%', revenue: '420.00', isTotal: false },
  { channel: 'Agoda',          bookings: 6,  rate: '7.2%', revenue: '230.00', isTotal: false },
  { channel: 'Walk-in',        bookings: 4,  rate: '3.5%', revenue: '110.00', isTotal: false },
  { channel: 'Others',         bookings: 3,  rate: '4.3%', revenue: '60.00',  isTotal: false },
  { channel: 'Total',          bookings: 56, rate: '5.2%', revenue: '2,340.50', isTotal: true },
];

export const noShowByChannelData = [
  { channel: 'Booking.com',    bookings: 10, rate: '2.8%', revenue: '480.00', isTotal: false },
  { channel: 'Expedia',        bookings: 6,  rate: '2.1%', revenue: '250.00', isTotal: false },
  { channel: 'Direct Website', bookings: 3,  rate: '1.2%', revenue: '150.00', isTotal: false },
  { channel: 'Agoda',          bookings: 2,  rate: '2.5%', revenue: '90.00',  isTotal: false },
  { channel: 'Walk-in',        bookings: 1,  rate: '0.9%', revenue: '30.00',  isTotal: false },
  { channel: 'Others',         bookings: 1,  rate: '1.1%', revenue: '15.00',  isTotal: false },
  { channel: 'Total',          bookings: 23, rate: '2.1%', revenue: '1,015.00', isTotal: true },
];

export const cancellationSummaryData = [
  { metric: 'Bookings',         cancelled: '56',       noShow: '23',       total: '79' },
  { metric: 'Rate',             cancelled: '5.2%',     noShow: '2.1%',     total: '7.3%' },
  { metric: 'Lost Revenue (USD)',cancelled: '2,340.50', noShow: '1,015.00', total: '3,355.50' },
  { metric: '% of Total Revenue',cancelled: '2.9%',     noShow: '1.3%',     total: '4.2%' },
];

