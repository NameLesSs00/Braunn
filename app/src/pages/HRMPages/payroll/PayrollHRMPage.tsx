import { useState, useEffect } from 'react';

import { useAppDispatch } from '../../../store/hooks';
import { fetchHrEmployees } from '../../../features/HRMfeatures/employees/hrEmployeesSlice';
import { PayrollDashboardTab } from './components/PayrollDashboardTab';
import { PayrollHistoryTab } from './components/PayrollHistoryTab';
import { ReviewPayrollTab } from './components/ReviewPayrollTab';
import { RunPayrollTab } from './components/RunPayrollTab';

type Tab = 'Dashboard' | 'Review Payroll' | 'Run Payroll' | 'Payroll History';
const TABS: Tab[] = ['Dashboard', 'Review Payroll', 'Run Payroll', 'Payroll History'];

export function PayrollHRMPage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  useEffect(() => {
    dispatch(fetchHrEmployees({ PageNumber: 1, PageSize: 100 }));
  }, [dispatch]);

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#0B4EA2]">Payroll Management</h1>
          <p className="mt-1 text-[14px] text-slate-500">Manage employee salaries and payments</p>
        </div>
      </div>

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
      {activeTab === 'Dashboard' && <PayrollDashboardTab />}
      {activeTab === 'Review Payroll' && <ReviewPayrollTab />}
      {activeTab === 'Payroll History' && <PayrollHistoryTab />}

      {activeTab === 'Run Payroll' && <RunPayrollTab />}
    </div>
  );
}
