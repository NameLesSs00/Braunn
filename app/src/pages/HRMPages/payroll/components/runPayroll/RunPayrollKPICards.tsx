import { CalendarDays, DollarSign, UserCheck } from 'lucide-react';
import type { HRPayrollReadDto } from '../../../../../models/HRMmodels/Payroll';
import { formatMoney } from '../../payrollUtils';

type Props = {
  records: HRPayrollReadDto[];
  eligibleCount: number;
};

export function RunPayrollKPICards({ records, eligibleCount }: Props) {
  const grossPayroll = records.reduce((sum, payroll) => sum + payroll.basicSalary + payroll.totalBonuses, 0);
  const netPayroll = records.reduce((sum, payroll) => sum + payroll.netSalary, 0);
  const pendingCount = records.filter((payroll) => payroll.status === 'Pending' || payroll.status === 'Draft').length;
  const reviewedCount = records.filter((payroll) => payroll.status === 'Reviewed').length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <div className="flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#0B4EA2]">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Gross Payroll</div>
            <div className="text-[26px] font-bold text-[#0B4EA2] leading-none">{formatMoney(grossPayroll)}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Visible Rows</div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] bg-[#0B4EA2] p-6 text-white">
        <div className="flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-blue-100 mb-1">Net Payroll</div>
            <div className="text-[26px] font-bold leading-none text-white">{formatMoney(netPayroll)}</div>
            <div className="text-[11px] font-semibold text-blue-100 mt-1">Visible Rows</div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <div className="flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#0B4EA2]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Pending</div>
            <div className="text-[26px] font-bold leading-none text-[#0B4EA2]">{pendingCount}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Employees</div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] bg-[#0B4EA2] p-6 text-white">
        <div className="flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <UserCheck className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-blue-100 mb-1">Ready to Process</div>
            <div className="text-[26px] font-bold leading-none text-white">{eligibleCount}/{reviewedCount}</div>
            <div className="text-[11px] font-semibold text-blue-100 mt-1">Reviewed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
