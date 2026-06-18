import { useEffect } from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import type { HREmployeeReadDto } from '../../../../../models/HRMmodels/HREmployee';
import { AddIncrementModal } from '../../../salaryIncrements/components/modals/AddIncrementModal';
import { useAppDispatch, useAppSelector } from '../../../../../shared/apis/hooks';
import {
  fetchHrEmployeeSalaryHistory,
  updateHrEmployeeSalary,
  type SalaryHistoryEntry,
} from '../../../../../features/HRMfeatures/employees/hrEmployeesSlice';
import { useState } from 'react';

type Props = {
  employee: HREmployeeReadDto;
};

export function EmployeeSalaryHistoryTab({ employee }: Props) {
  const dispatch = useAppDispatch();
  const { salaryHistory, salaryHistoryStatus } = useAppSelector((s) => s.hrEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (employee?.id) {
      dispatch(fetchHrEmployeeSalaryHistory(employee.id));
    }
  }, [employee?.id, dispatch]);

  // Compute KPI values from real data
  const currentSalary = employee.basicSalary ?? 0;

  const latestEntry: SalaryHistoryEntry | undefined = salaryHistory[0];
  const oldestEntry: SalaryHistoryEntry | undefined = salaryHistory[salaryHistory.length - 1];

  const totalGrowth =
    salaryHistory.length > 0
      ? currentSalary - (oldestEntry?.previousSalary ?? currentSalary)
      : 0;

  const lastIncrementPercent =
    latestEntry && latestEntry.previousSalary > 0
      ? (((latestEntry.newSalary - latestEntry.previousSalary) / latestEntry.previousSalary) * 100).toFixed(2)
      : null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="bg-white border border-slate-200 rounded-[20px] p-6">
        <div className="grid grid-cols-4 gap-4">
          {/* Current Salary */}
          <div className="bg-[#EEF4FF] rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-[#0B4EA2] mb-2">Current Salary</div>
            <div className="text-[26px] font-bold text-[#0B4EA2] leading-none mb-1">
              ${currentSalary.toLocaleString()}
            </div>
          </div>

          {/* Total Growth */}
          <div className="bg-[#F0FDF4] rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-[#16A34A] mb-2">Total Growth</div>
            <div className="text-[26px] font-bold text-[#16A34A] leading-none">
              {totalGrowth >= 0 ? '+' : ''}${totalGrowth.toLocaleString()}
            </div>
          </div>

          {/* Last Increment */}
          <div className="bg-amber-50 rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-amber-600 mb-2">Last Increment</div>
            {lastIncrementPercent ? (
              <>
                <div className="text-[26px] font-bold text-amber-500 leading-none mb-1">
                  +{lastIncrementPercent}%
                </div>
                <div className="text-[11px] font-medium text-amber-400">
                  {latestEntry ? formatDate(latestEntry.effectiveDate) : '—'}
                </div>
              </>
            ) : (
              <div className="text-[16px] font-bold text-amber-400 leading-none mt-2">—</div>
            )}
          </div>

          {/* Increment Count */}
          <div className="bg-purple-50 rounded-[16px] p-5">
            <div className="text-[12px] font-semibold text-purple-600 mb-2">Increment Count</div>
            <div className="text-[26px] font-bold text-purple-700 leading-none mb-1">
              {salaryHistory.length}
            </div>
            <div className="text-[11px] font-medium text-purple-400">Total adjustments</div>
          </div>
        </div>
      </div>

      {/* Add Increment Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 h-14 px-6 rounded-lg bg-[#0B4EA2] text-[16px] font-semibold text-white hover:bg-[#093c80] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Increment
        </button>
      </div>

      {/* Latest Increment Banner */}
      {latestEntry && (
        <div className="flex items-center justify-between px-5 py-4 bg-[#F0FDF4] border border-green-100 rounded-[16px]">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-800">Latest Increment</div>
              <div className="text-[12px] font-medium text-slate-500 mt-0.5">
                Effective {formatDate(latestEntry.effectiveDate)} · {latestEntry.reason}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <div className="text-[13px] font-bold text-slate-700">Amount</div>
              <div className="text-[14px] font-bold text-[#16A34A]">
                +${((latestEntry.newSalary ?? 0) - (latestEntry.previousSalary ?? 0)).toLocaleString()}
                {lastIncrementPercent ? ` (+${lastIncrementPercent}%)` : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Increment History */}
      <div>
        <h2 className="text-[14px] font-bold text-slate-500 mb-4">Increment History</h2>

        {salaryHistoryStatus === 'loading' && (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4EA2]/20 border-t-[#0B4EA2]" />
          </div>
        )}

        {salaryHistoryStatus !== 'loading' && salaryHistory.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">No salary history found.</div>
        )}

        <div className="space-y-3">
          {salaryHistory.map((row, idx) => {
            const prevSal = row.previousSalary ?? 0;
            const newSal = row.newSalary ?? 0;
            const diff = newSal - prevSal;
            const percent = prevSal > 0
              ? ((diff / prevSal) * 100).toFixed(2)
              : null;
            const isLatest = idx === 0;

            return (
              <div
                key={row.id}
                className={`flex items-center gap-6 px-6 py-5 rounded-[16px] border ${
                  isLatest ? 'bg-[#F0FDF4] border-green-100' : 'bg-white border-slate-200'
                }`}
              >
                {/* Date Block */}
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-[15px] font-bold text-slate-700">
                    {new Date(row.effectiveDate).getFullYear()}
                  </div>
                  <div className="text-[13px] font-medium text-slate-400">
                    {String(new Date(row.effectiveDate).getMonth() + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Salary Flow */}
                <div className="flex items-center gap-3 flex-shrink-0 w-52">
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 mb-0.5">Previous</div>
                    <div className="text-[15px] font-bold text-slate-600">
                      ${prevSal.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-slate-300 text-lg">→</div>
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 mb-0.5">New Salary</div>
                    <div className="text-[15px] font-bold text-slate-900">
                      ${newSal.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-slate-700">{row.reason}</div>
                  <div className="text-[12px] font-medium text-slate-400 mt-0.5">
                    Effective {formatDate(row.effectiveDate)}
                  </div>
                </div>

                {/* Change Amount */}
                <div className="flex-shrink-0 text-right">
                  {diff !== 0 ? (
                    <>
                      <div className="flex items-center justify-end gap-1 text-[14px] font-bold text-[#0B4EA2]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +${diff.toLocaleString()}
                      </div>
                      {percent && (
                        <div className="text-[12px] font-medium text-slate-400 mt-0.5">
                          +{percent}%
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-[13px] font-medium text-slate-400">No change</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddIncrementModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={
          isModalOpen
            ? {
                id: '0',
                employee: employee.fullName,
                role: employee.positionName,
                department: employee.departmentName,
                prevSalary: `$${currentSalary.toLocaleString()}`,
                newSalary: `$${currentSalary.toLocaleString()}`,
                incrementAmount: '$0',
                incrementPercent: '0%',
                monthlyIncrease: '$0',
                effectiveDate: '',
                nextReviewDate: '',
                reason: '',
                approvedBy: '',
                status: 'Active' as const,
              }
            : null
        }
        onSubmit={async (data: any) => {
          await dispatch(updateHrEmployeeSalary({
            id: employee.id,
            payload: {
              newSalary: parseFloat(data.newSalary?.replace(/[^0-9.]/g, '') || '0'),
              effectiveDate: data.effectiveDate || new Date().toISOString(),
              reason: data.reason || '',
            },
          }));
          setIsModalOpen(false);
          dispatch(fetchHrEmployeeSalaryHistory(employee.id));
        }}
      />
    </div>
  );
}
