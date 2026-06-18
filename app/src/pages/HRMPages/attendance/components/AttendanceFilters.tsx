import { FiSearch, FiCalendar } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';

export function AttendanceFilters() {
  return (
    <div className="flex items-center gap-4 py-4 px-6 bg-white border border-slate-200 rounded-t-2xl">
      {/* Search Input */}
      <div className="relative flex-1">
        <IconImage src={FiSearch} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search employees..."
          className="w-full pl-9 pr-4 py-2 text-[14px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors"
        />
      </div>

      {/* Date Picker Button (Mock) */}
      <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-[14px] text-slate-600 hover:bg-slate-50 transition-colors">
        <IconImage src={FiCalendar} alt="Date" className="w-4 h-4 text-slate-500" />
        Oct 24, 2023
      </button>

      {/* Departments Select */}
      <select className="px-4 py-2 border border-slate-200 rounded-lg text-[14px] text-slate-600 focus:outline-none focus:border-[#0B4EA2] hover:bg-slate-50 transition-colors bg-white">
        <option>All Departments</option>
        <option>Sales</option>
        <option>Receptionist</option>
        <option>Marketing</option>
        <option>Housekeeping</option>
      </select>

      {/* Status Select */}
      <select className="px-4 py-2 border border-slate-200 rounded-lg text-[14px] text-slate-600 focus:outline-none focus:border-[#0B4EA2] hover:bg-slate-50 transition-colors bg-white">
        <option>All Status</option>
        <option>On Time</option>
        <option>Late</option>
        <option>On Leave</option>
        <option>Present</option>
      </select>
    </div>
  );
}
