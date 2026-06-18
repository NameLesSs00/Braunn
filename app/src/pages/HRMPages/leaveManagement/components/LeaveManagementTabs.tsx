import { FiCalendar, FiSearch } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';

interface LeaveManagementTabsProps {
  activeTab: 'request' | 'balance';
  onTabChange: (tab: 'request' | 'balance') => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function LeaveManagementTabs({
  activeTab,
  onTabChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: LeaveManagementTabsProps) {
  return (
    <div className="flex items-end justify-between border-b border-slate-200 mt-8 mb-6">
      {/* Tabs */}
      <div className="flex gap-8 px-2">
        <button
          onClick={() => onTabChange('request')}
          className={`pb-3 text-[15px] font-bold ${activeTab === 'request' ? 'text-[#0B4EA2] border-b-2 border-[#0B4EA2]' : 'text-slate-400 hover:text-slate-600 transition-colors'}`}
        >
          Leave Request
        </button>
        <button
          onClick={() => onTabChange('balance')}
          className={`pb-3 text-[15px] font-bold ${activeTab === 'balance' ? 'text-[#0B4EA2] border-b-2 border-[#0B4EA2]' : 'text-slate-400 hover:text-slate-600 transition-colors'}`}
        >
          Leave balance
        </button>
      </div>

      {/* Dynamic Right Controls */}
      <div className="pb-2">
        {activeTab === 'request' ? (
          <div className="flex items-center gap-6">
            {/* Date From */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-slate-700">Date From</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => onDateFromChange(e.target.value)}
                  className="w-[160px] px-4 py-2 text-[14px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4EA2] transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-semibold text-slate-700">Date To</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => onDateToChange(e.target.value)}
                  className="w-[160px] px-4 py-2 text-[14px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4EA2] transition-colors cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <IconImage src={FiSearch} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              className="w-[300px] pl-9 pr-4 py-2 text-[14px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
