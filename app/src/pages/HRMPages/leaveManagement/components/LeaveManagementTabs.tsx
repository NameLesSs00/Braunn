import { FiSearch } from 'react-icons/fi';
import { IconImage } from '../../../../shared/ui/IconImage';

interface LeaveManagementTabsProps {
  activeTab: 'request' | 'balance';
  onTabChange: (tab: 'request' | 'balance') => void;
}

export function LeaveManagementTabs({
  activeTab,
  onTabChange,
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
        {activeTab === 'balance' && (
          <div className="relative">
            <IconImage src={FiSearch} alt="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-[240px] pl-9 pr-4 py-2 text-[14px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#0B4EA2] focus:ring-1 focus:ring-[#0B4EA2] transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
