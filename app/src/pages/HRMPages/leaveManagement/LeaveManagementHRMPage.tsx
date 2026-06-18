import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/apis/hooks';
import { Home, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../../shared/lib/routes';
import { fetchHrLeaves } from '../../../features/HRMfeatures/leaves/hrLeavesSlice';
import { LeaveManagementStatsCards } from './components/LeaveManagmentStatsCards';
import { LeaveManagementTabs } from './components/LeaveManagementTabs';
import { LeaveManagementFilters } from './components/LeaveManagementFilters';
import { LeaveManagementTable } from './components/LeaveManagementTable';
import { LeaveBalanceTable } from './components/LeaveBalanceTable';
import { NewLeaveRequestPopup } from './popups/NewLeaveRequestPopup';

export function LeaveManagementHRMPage() {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((s) => s.hrLeaves);

  const [activeTab, setActiveTab] = useState<'request' | 'balance'>('request');
  const [isNewLeaveOpen, setIsNewLeaveOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    dispatch(fetchHrLeaves({
      PageNumber: 1,
      PageSize: 20,
      SearchTerm: searchTerm || undefined,
      DateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
      DateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
    }));
  }, [dispatch, searchTerm, dateFrom, dateTo]);

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-1.5 text-[13px]">
          <li className="flex items-center gap-1.5">
            <Home className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <Link to={routes.hrm.dashboard} className="font-medium text-slate-500 hover:text-[#0B4EA2] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          </li>
          <li className="flex items-center gap-1.5">
            <span className="font-semibold text-[#0B4EA2]">Leave Management</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0B4EA2]">Leave Management</h1>
          <p className="text-[14px] text-slate-500 mt-0.5">Manage employee leave requests and approvals</p>
        </div>
        <button
          onClick={() => setIsNewLeaveOpen(true)}
          className="bg-[#0B4EA2] hover:bg-[#093c80] text-white px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors"
        >
          New Leave request
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <LeaveManagementStatsCards />

      {/* Tabs + date range */}
      <LeaveManagementTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {/* Table */}
      {activeTab === 'request' ? (
        <div className="shadow-sm rounded-2xl border border-slate-200">
          <LeaveManagementFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <LeaveManagementTable />
        </div>
      ) : (
        <LeaveBalanceTable />
      )}

      {/* Popup */}
      <NewLeaveRequestPopup open={isNewLeaveOpen} onClose={() => setIsNewLeaveOpen(false)} />
    </div>
  );
}