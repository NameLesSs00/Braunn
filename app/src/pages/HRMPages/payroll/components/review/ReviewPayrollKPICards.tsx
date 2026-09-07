import { CalendarDays, DollarSign, UserCheck } from 'lucide-react';
import type { HRPayrollReadDto } from '../../../../../models/HRMmodels/Payroll';
import { formatMoney } from '../../payrollUtils';

type Props = {
  records: HRPayrollReadDto[];
  totalCount: number;
};

export function ReviewPayrollKPICards({ records, totalCount }: Props) {
  const totalPayroll = records.reduce((sum, payroll) => sum + payroll.netSalary, 0);
  const reviewedCount = records.filter((payroll) => payroll.status === 'Reviewed').length;
  const pendingCount = records.filter((payroll) => payroll.status === 'Pending' || payroll.status === 'Draft').length;

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className="rounded-[20px] border border-slate-200 bg-white p-7">
        <div className="flex justify-between items-start mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#0B4EA2]">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Total Payroll</div>
            <div className="text-[32px] font-bold text-[#0B4EA2] leading-none">{formatMoney(totalPayroll)}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Visible Rows</div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] bg-[#0B4EA2] p-7 text-white">
        <div className="flex justify-between items-start mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-blue-100 mb-1">Reviewed</div>
            <div className="text-[32px] font-bold leading-none text-white">{reviewedCount}/{totalCount}</div>
            <div className="text-[11px] font-semibold text-blue-100 mt-1">Employees</div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-7">
        <div className="flex justify-between items-start mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] text-slate-400">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Pending</div>
            <div className="text-[32px] font-bold leading-none text-[#0B4EA2]">{pendingCount}/{totalCount}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Employees</div>
          </div>
        </div>
      </div>
    </div>
  );
}
