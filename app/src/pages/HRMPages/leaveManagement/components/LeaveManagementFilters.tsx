import { FiSearch, FiDownload } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';

interface LeaveManagementFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function LeaveManagementFilters({
  searchTerm,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: LeaveManagementFiltersProps) {
  return (
    <div className="flex items-center justify-between py-5 px-6 bg-white border-b border-slate-200 rounded-t-2xl">
      {/* Left Title */}
      <h2 className="text-[16px] font-bold text-[#1a365d]">Leave Requests</h2>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Date From */}
        <div className="relative flex items-center gap-2">
          <label className="text-[13px] font-semibold text-slate-600">From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-[140px] px-3 py-1.5 text-[14px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4EA2] transition-colors cursor-pointer"
          />
        </div>

        {/* Date To */}
        <div className="relative flex items-center gap-2">
          <label className="text-[13px] font-semibold text-slate-600">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-[140px] px-3 py-1.5 text-[14px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4EA2] transition-colors cursor-pointer"
          />
        </div>

        {/* Search Input */}
        <div className="relative">
          <IconImage src={FiSearch} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[200px] pl-9 pr-4 py-2 text-[14px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors"
          />
        </div>

        {/* Export Button */}
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white">
          <IconImage src={FiDownload} alt="Export" className="w-4 h-4 text-slate-500" />
          Export
        </button>
      </div>
    </div>
  );
}
