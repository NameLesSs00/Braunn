import { useAppSelector } from '../../../../shared/apis/hooks';
import type { LeaveBalanceReadDto } from '../../../../models/HRMmodels/Leave';

export function LeaveBalanceTable() {
  const { balances, balancesStatus } = useAppSelector((s: any) => s.hrLeaves);

  if (balancesStatus === 'loading') {
    return (
      <div className="shadow-sm rounded-2xl border border-slate-200 bg-white py-16 flex items-center justify-center text-slate-400 text-[14px]">
        Loading leave balances...
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="shadow-sm rounded-2xl border border-slate-200 bg-white py-16 flex items-center justify-center text-slate-400 text-[14px]">
        No balances found.
      </div>
    );
  }

  return (
    <div className="shadow-sm rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="py-5 px-6 border-b border-slate-200">
        <h2 className="text-[16px] font-bold text-[#1a365d]">Leave Balance</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Available Balance</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Used</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {balances.map((balance: LeaveBalanceReadDto) => (
              <tr key={balance.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-[14px] font-bold text-slate-900">{balance.fullName}</div>
                </td>
                <td className="px-6 py-4 text-[14px] text-slate-600">{balance.departmentName || '—'}</td>
                <td className="px-6 py-4 text-[14px] font-bold text-emerald-600">{balance.availible} days</td>
                <td className="px-6 py-4 text-[14px] text-slate-600">{balance.used} days</td>
                <td className="px-6 py-4 text-[14px] font-bold text-slate-900">{balance.total} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
