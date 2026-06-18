import { FiSearch, FiCalendar, FiPrinter } from 'react-icons/fi';

export function CleaningTasksHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-[#1a365d]">Room Cleaning Management</h1>
      <p className="mt-2 text-[15px] text-slate-500">Manage checkout queue and cleaning assignments</p>
    </div>
  );
}

export function CleaningTasksFilters() {
  return (
    <div className="flex flex-col gap-5 mb-8">
      {/* Search Bar */}
      <div className="relative w-full">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by Room Number"
          className="bg-white w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] placeholder:text-slate-400"
        />
      </div>

      {/* Filter Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-slate-800">Status</label>
          <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-600">
            <option>All status</option>
            <option>Dirty</option>
            <option>Clean</option>
            <option>In Progress</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-slate-800">Floor</label>
          <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-600">
            <option>All Floor</option>
            <option>1 Floor</option>
            <option>2 Floor</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-slate-800">Room Type</label>
          <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-600">
            <option>All Types</option>
            <option>Single</option>
            <option>Double</option>
            <option>Suite</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-semibold text-slate-800">Priority</label>
          <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-600">
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Filter Row 2 */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-4 w-full md:w-auto flex-1 max-w-3xl">
          <div className="flex flex-col gap-1.5 w-1/3">
            <label className="text-[14px] font-semibold text-slate-800">Staff</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-600">
              <option>All Staff</option>
              <option>Sara Ahmed</option>
              <option>Maria Garcia</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 w-1/3 relative">
            <label className="text-[14px] font-semibold text-slate-800">Date From</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-600"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-1/3 relative">
            <label className="text-[14px] font-semibold text-slate-800">Date To</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4bbd]/20 focus:border-[#0a4bbd] transition-all text-[14px] text-slate-600"
            />
          </div>
        </div>

        {/* Print Button */}
        <button className="flex items-center gap-2 px-6 py-2.5 border-2 border-[#0a4bbd] rounded-xl text-[#0a4bbd] hover:bg-blue-50 font-bold transition-colors">
          <FiPrinter className="w-5 h-5" />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
}
