import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { TabNav } from './components/TabNav'
import { Download, Calendar, Filter } from 'lucide-react'
import { RevenueByBookingType } from './components/RevenueByBookingType'
import { TopRevenueSources } from './components/TopRevenueSources'

// Mock Data
const initialReportData = [
  { id: 1, source: 'Tech Corp International', bookingType: 'Corporate', roomNights: 145, adr: 150, revenue: 21750 },
  { id: 2, source: 'Global Finance Ltd', bookingType: 'Corporate', roomNights: 98, adr: 140, revenue: 13720 },
  { id: 3, source: 'Direct Bookings', bookingType: 'Direct', roomNights: 125, adr: 180, revenue: 22500 },
  { id: 4, source: 'Booking.com', bookingType: 'OTA', roomNights: 72, adr: 165, revenue: 11880 },
  { id: 5, source: 'Walk-in Guests', bookingType: 'Walk-in', roomNights: 35, adr: 170, revenue: 5950 },
  { id: 6, source: 'Expedia', bookingType: 'OTA', roomNights: 15, adr: 160, revenue: 2400 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: 'spring', stiffness: 300, damping: 24 } 
  },
}

export function ProductionReportPage() {
  const [dateRange, setDateRange] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All Company');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All Room Type');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('All Booking Type');

  // Filter Data
  const filteredData = useMemo(() => {
    return initialReportData.filter(item => {
      const matchCompany = companyFilter === 'All Company' || item.source === companyFilter;
      const matchBookingType = bookingTypeFilter === 'All Booking Type' || item.bookingType === bookingTypeFilter;
      // Note: roomType and dateRange are visual filters for this mock, but they would apply similarly in production.
      return matchCompany && matchBookingType;
    });
  }, [companyFilter, bookingTypeFilter]);

  // Derived Totals
  const totals = useMemo(() => {
    const totalRoomNights = filteredData.reduce((sum, item) => sum + item.roomNights, 0);
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.revenue, 0);
    const averageADR = totalRoomNights > 0 ? Math.round(totalRevenue / totalRoomNights) : 0;
    const sourcesCount = new Set(filteredData.map(item => item.source)).size;
    
    return {
      totalRoomNights,
      totalRevenue,
      averageADR,
      sourcesCount
    };
  }, [filteredData]);

  // Get distinct values for filters
  const companies = ['All Company', ...new Set(initialReportData.map(item => item.source))];
  const bookingTypes = ['All Booking Type', ...new Set(initialReportData.map(item => item.bookingType))];

  const getBookingTypeBadge = (type: string) => {
    switch (type) {
      case 'Corporate':
        return <span className="px-3 py-1 font-semibold text-blue-600 bg-blue-100/50 rounded-full text-xs box-border inline-block min-w-[70px] text-center">Corporate</span>;
      case 'Direct':
        return <span className="px-3 py-1 font-semibold text-emerald-600 bg-emerald-100/50 rounded-full text-xs box-border inline-block min-w-[70px] text-center">Direct</span>;
      case 'OTA':
        return <span className="px-3 py-1 font-semibold text-orange-600 bg-orange-100/50 rounded-full text-xs box-border inline-block min-w-[70px] text-center">OTA</span>;
      case 'Walk-in':
        return <span className="px-3 py-1 font-semibold text-purple-600 bg-purple-100/50 rounded-full text-xs box-border inline-block min-w-[70px] text-center">Walk-in</span>;
      default:
        return <span className="px-3 py-1 font-semibold text-slate-600 bg-slate-100/50 rounded-full text-xs">{type}</span>;
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <motion.div 
      className="space-y-8 pb-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <TabNav />
      </motion.div>
      
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#1e293b]">Production Report</h1>
          <p className="text-slate-500 mt-1">Revenue breakdown by source and booking type</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#004bb4] text-white rounded-xl hover:bg-blue-800 transition-colors font-medium text-sm shadow-sm">
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </motion.div>

      {/* Filters Section */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Select" 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
            <div className="relative">
              <select 
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm"
              >
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Room Type</label>
            <div className="relative">
              <select 
                value={roomTypeFilter}
                onChange={(e) => setRoomTypeFilter(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm"
              >
                <option>All Room Type</option>
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Suite</option>
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Booking Type</label>
            <div className="relative">
              <select 
                value={bookingTypeFilter}
                onChange={(e) => setBookingTypeFilter(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm"
              >
                {bookingTypes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Total Revenue</h3>
          <p className="text-[32px] leading-tight font-bold text-[#1e293b] mt-1">{formatCurrency(totals.totalRevenue)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Total Room Nights</h3>
          <p className="text-[32px] leading-tight font-bold text-[#1e293b] mt-1">{totals.totalRoomNights}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Average ADR</h3>
          <p className="text-[32px] leading-tight font-bold text-[#1e293b] mt-1">{formatCurrency(totals.averageADR)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-slate-500 font-medium text-sm">Sources</h3>
          <p className="text-[32px] leading-tight font-bold text-[#1e293b] mt-1">{totals.sourcesCount}</p>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f4f7fb]">
                <th className="px-6 py-5 font-semibold text-slate-700 text-sm">Company / Source</th>
                <th className="px-6 py-5 font-semibold text-slate-700 text-sm">Booking Type</th>
                <th className="px-6 py-5 font-semibold text-slate-700 text-sm text-center">Room Nights</th>
                <th className="px-6 py-5 font-semibold text-slate-700 text-sm text-center">ADR</th>
                <th className="px-6 py-5 font-semibold text-slate-700 text-sm text-right">Revenue</th>
                <th className="px-6 py-5 font-semibold text-slate-700 text-sm w-44">
                  <div className="ml-4">% Contribution</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => {
                const contribution = totals.totalRevenue > 0 ? (row.revenue / totals.totalRevenue) * 100 : 0;
                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors bg-white group">
                    <td className="px-6 py-5 font-semibold text-[#1e293b] text-sm">{row.source}</td>
                    <td className="px-6 py-5">
                      {getBookingTypeBadge(row.bookingType)}
                    </td>
                    <td className="px-6 py-5 text-slate-600 text-sm text-center">{row.roomNights}</td>
                    <td className="px-6 py-5 text-slate-600 text-sm text-center">{formatCurrency(row.adr)}</td>
                    <td className="px-6 py-5 font-bold text-[#1e293b] text-sm text-right">{formatCurrency(row.revenue)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm font-semibold text-blue-600 w-[42px]">
                          {contribution.toFixed(1)}%
                        </span>
                        <div className="w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${contribution}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {/* Dynamic Totals Footer */}
              <tr className="bg-[#f8fafc] border-t-2 border-slate-200">
                <td className="px-6 py-5 font-bold text-[#1e293b] text-sm">Total</td>
                <td className="px-6 py-5"></td>
                <td className="px-6 py-5 font-bold text-[#1e293b] text-sm text-center">{totals.totalRoomNights}</td>
                <td className="px-6 py-5 font-bold text-[#1e293b] text-sm text-center">{formatCurrency(totals.averageADR)}</td>
                <td className="px-6 py-5 font-bold text-[#1e293b] text-sm text-right">{formatCurrency(totals.totalRevenue)}</td>
                <td className="px-6 py-5 font-bold text-[#1e293b] text-sm">
                  <div className="ml-4">
                    {filteredData.length > 0 ? '100%' : '0%'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Shared Dashboard Components */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueByBookingType />
        <TopRevenueSources />
      </motion.div>
    </motion.div>
  )
}

