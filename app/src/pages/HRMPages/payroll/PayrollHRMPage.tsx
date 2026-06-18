import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PayrollDashboardTab } from './components/PayrollDashboardTab';
import { PayrollHistoryTab } from './components/PayrollHistoryTab';
import { ReviewPayrollTab } from './components/ReviewPayrollTab';
import { RunPayrollTab } from './components/RunPayrollTab';

type Tab = 'Dashboard' | 'Review Payroll' | 'Run Payroll' | 'Payroll History';
const TABS: Tab[] = ['Dashboard', 'Review Payroll', 'Run Payroll', 'Payroll History'];

export function PayrollHRMPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [month, setMonth] = useState('October 2023');

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-[#0B4EA2]">Payroll Management</h1>
          <p className="mt-1 text-[14px] text-slate-500">Manage employee salaries and payments</p>
        </div>
        <div className="relative mt-1">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 text-[14px] font-semibold text-slate-700 outline-none focus:border-[#0B4EA2] shadow-sm"
          >
            <option>October 2023</option>
            <option>September 2023</option>
            <option>August 2023</option>
            <option>November 2023</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-5 py-2.5 text-[14px] font-semibold transition-all ${
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
