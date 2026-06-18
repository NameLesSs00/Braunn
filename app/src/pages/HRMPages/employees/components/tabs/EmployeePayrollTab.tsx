import { Download, Star, TrendingDown, DollarSign } from 'lucide-react';
import type { HREmployeeReadDto } from '../../../../../models/HRMmodels/HREmployee';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../shared/apis/hooks';
import { fetchHrPayrollSnapshots } from '../../../../../features/HRMfeatures/payroll/hrPayrollSlice';
import { fetchBonuses } from '../../../../../features/HRMfeatures/bonuses/bonusesSlice';
import { fetchDeductions } from '../../../../../features/HRMfeatures/deductions/deductionsSlice';

type Props = {
  employee: HREmployeeReadDto;
};

export function EmployeePayrollTab({ employee }: Props) {
  const dispatch = useAppDispatch();
  const { snapshots } = useAppSelector((s) => s.hrPayroll);
  const { items: bonuses } = useAppSelector((s) => s.bonuses);
  const { items: deductions } = useAppSelector((s) => s.deductions);

  useEffect(() => {
    if (employee?.id) {
      dispatch(fetchHrPayrollSnapshots({ EmployeeId: employee.id, SortDirection: 'desc' }));
      dispatch(fetchBonuses({ EmployeeId: employee.id, SortDirection: 'desc' }));
      dispatch(fetchDeductions({ EmployeeId: employee.id, SortDirection: 'desc' }));
    }
  }, [employee?.id, dispatch]);

  // Use the most recent payroll snapshot for overview metrics
  const latestSnapshot = snapshots[0];

  const basicSalary = latestSnapshot?.basicSalary ?? employee.basicSalary ?? 0;
  const totalBonuses = latestSnapshot?.totalBonuses ?? 0;
  const totalDeductions = latestSnapshot?.totalDeductions ?? 0;
  const netSalary = latestSnapshot?.netSalary ?? basicSalary;

  const topBonuses = bonuses.slice(0, 4);
  const topDeductions = deductions.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Salary Overview */}
      <div className="bg-white border border-slate-200 rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-slate-900">Salary Overview</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Basic Salary */}
          <div className="bg-[#F8FAFC] rounded-[16px] p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 mb-3">
              <div className="w-6 h-6 rounded-full border border-blue-200 text-[#0B4EA2] flex items-center justify-center bg-transparent">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              Basic Salary
            </div>
            <div className="text-[24px] font-bold text-slate-900">${basicSalary.toFixed(2)}</div>
          </div>

          {/* Bonuses */}
          <div className="bg-[#EEF4FF] rounded-[16px] p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 mb-3">
              <div className="w-6 h-6 rounded-full border border-slate-300 text-slate-700 flex items-center justify-center bg-transparent">
                <Star className="w-3.5 h-3.5" />
              </div>
              Bonuses
            </div>
            <div className="text-[24px] font-bold text-slate-900">${totalBonuses.toFixed(2)}</div>
          </div>

          {/* Deductions */}
          <div className="bg-[#FEF2F2] rounded-[16px] p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 mb-3">
              <div className="w-6 h-6 rounded-full border border-red-200 text-red-500 flex items-center justify-center bg-transparent">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              Deductions
            </div>
            <div className="text-[24px] font-bold text-slate-900">${totalDeductions.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Details Grid Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Bonuses */}
        <div className="bg-white border border-slate-200 rounded-[20px] p-6">
          <h2 className="text-[15px] font-bold text-slate-900 mb-5">Recent Bonuses</h2>
          {topBonuses.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-6">No bonuses found.</div>
          ) : (
            <div className="space-y-3">
              {topBonuses.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3.5 bg-[#F0FDF4] rounded-[12px]">
                  <div>
                    <div className="text-[12px] font-bold text-slate-800">{b.reason || 'Bonus'}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                      {new Date(b.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-[14px] font-bold text-[#16A34A]">+${b.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deductions */}
        <div className="bg-white border border-slate-200 rounded-[20px] p-6">
          <h2 className="text-[15px] font-bold text-slate-900 mb-5">Recent Deductions</h2>
          {topDeductions.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-6">No deductions found.</div>
          ) : (
            <div className="space-y-3">
              {topDeductions.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3.5 bg-[#FEF2F2] rounded-[12px]">
                  <div>
                    <div className="text-[12px] font-bold text-slate-800">{d.reason || 'Deduction'}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                      {new Date(d.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-[14px] font-bold text-red-500">-${d.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Net Pay Summary */}
        <div className="bg-white border border-slate-200 rounded-[20px] p-6 flex flex-col">
          <h2 className="text-[15px] font-bold text-slate-900 mb-6">Payment Summary</h2>
          <div className="flex-1 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Basic Salary</span>
              <span className="text-slate-800 font-semibold">${basicSalary.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Total Bonuses</span>
              <span className="text-green-600 font-semibold">+${totalBonuses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Total Deductions</span>
              <span className="text-red-500 font-semibold">-${totalDeductions.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[13px] font-semibold text-slate-500">Net Pay</div>
            <div className="text-[24px] font-bold text-[#0B4EA2]">${netSalary.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white border border-slate-200 rounded-[20px] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-[15px] font-bold text-slate-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pay Date</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pay Period</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Basic Salary</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Pay</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No payment history found.
                  </td>
                </tr>
              ) : (
                snapshots.map((row) => {
                  const period = new Date(row.year, row.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                  const payDate = new Date(row.snapshotDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                  return (
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors last:border-b-0">
                      <td className="px-6 py-4 text-[12px] font-semibold text-slate-800">{payDate}</td>
                      <td className="px-6 py-4 text-[12px] font-medium text-[#0B4EA2]">{period}</td>
                      <td className="px-6 py-4 text-[12px] font-medium text-slate-600">${row.basicSalary.toFixed(2)}</td>
                      <td className="px-6 py-4 text-[12px] font-medium text-red-500">-${row.totalDeductions.toFixed(2)}</td>
                      <td className="px-6 py-4 text-[13px] font-bold text-slate-900">${row.netSalary.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button className="text-slate-400 hover:text-[#0B4EA2] transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
