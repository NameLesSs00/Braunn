import { useState, useEffect } from 'react';
import { CalendarDays, Loader2, PlayCircle } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchHrEmployees } from '../../../features/HRMfeatures/employees/hrEmployeesSlice';
import {
  fetchHrPayrolls,
  fetchPayrollProcessingRecords,
  generateHrPayroll,
} from '../../../features/HRMfeatures/payroll/hrPayrollSlice';
import { PayrollDashboardTab } from './components/PayrollDashboardTab';
import { PayrollHistoryTab } from './components/PayrollHistoryTab';
import { ReviewPayrollTab } from './components/ReviewPayrollTab';
import { RunPayrollTab } from './components/RunPayrollTab';
import { MONTHS } from './payrollUtils';

type Tab = 'Dashboard' | 'Review Payroll' | 'Run Payroll' | 'Payroll History';
const TABS: Tab[] = ['Dashboard', 'Review Payroll', 'Run Payroll', 'Payroll History'];

export function PayrollHRMPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.hrPayroll);
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  useEffect(() => {
    dispatch(fetchHrEmployees({ PageNumber: 1, PageSize: 100, Status: 'Active' }));
    dispatch(fetchPayrollProcessingRecords({ PageNumber: 1, PageSize: 200 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchHrPayrolls({ Month: month, Year: year, PageNumber: 1, PageSize: 10 }));
  }, [dispatch, month, year]);

  const handleGeneratePayroll = async () => {
    const result = await dispatch(generateHrPayroll({ month, year }));
    if (generateHrPayroll.fulfilled.match(result)) {
      dispatch(fetchHrPayrolls({ Month: month, Year: year, PageNumber: 1, PageSize: 10 }));
      setActiveTab('Review Payroll');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#0B4EA2]">Payroll Management</h1>
          <p className="mt-1 text-[14px] text-slate-500">Manage employee salaries and payments</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <CalendarDays className="h-4 w-4 text-[#0B4EA2]" />
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="bg-transparent text-[13px] font-semibold text-slate-700 outline-none"
            >
              {MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={2020}
              max={2100}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              onWheel={(event) => event.currentTarget.blur()}
              className="w-20 bg-transparent text-[13px] font-semibold text-slate-700 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <button
            type="button"
            onClick={handleGeneratePayroll}
            disabled={status === 'loading'}
            className="flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#0a428a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            Generate Payroll
          </button>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[#0B4EA2] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0B4EA2] hover:text-[#0B4EA2]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Dashboard' && <PayrollDashboardTab onNavigate={setActiveTab} month={month} year={year} />}
      {activeTab === 'Review Payroll' && <ReviewPayrollTab month={month} year={year} />}
      {activeTab === 'Payroll History' && <PayrollHistoryTab month={month} year={year} />}

      {activeTab === 'Run Payroll' && <RunPayrollTab month={month} year={year} />}
    </div>
  );
}
