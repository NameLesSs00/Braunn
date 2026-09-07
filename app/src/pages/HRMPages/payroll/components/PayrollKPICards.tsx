import { DollarSign, UserCheck, CalendarDays } from 'lucide-react';
import { useAppSelector } from '../../../../store/hooks';
import { formatMoney } from '../payrollUtils';

export function PayrollKPICards() {
  const { payrolls, totalPayrollsCount, processingRecords } = useAppSelector((state) => state.hrPayroll);
  const totalPayroll = payrolls.reduce((sum, payroll) => sum + payroll.netSalary, 0);
  const processedIds = new Set(processingRecords.map((record) => record.payrollId));
  const paidCount = payrolls.filter((payroll) => payroll.status === 'Paid' || payroll.status === 'Processed' || processedIds.has(payroll.id)).length;
  const pendingCount = payrolls.filter((payroll) => payroll.status === 'Pending' || payroll.status === 'Draft').length;

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      {/* Total Payroll */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-7">
        <div className="flex justify-between items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#0B4EA2]">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Total Payroll</div>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-[32px] font-bold text-[#0B4EA2] leading-none">{formatMoney(totalPayroll)}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Per Month</div>
          </div>
        </div>
      </div>

      {/* Paid */}
      <div className="rounded-[20px] bg-[#0B4EA2] p-7 text-white">
        <div className="flex justify-between items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-blue-100 mb-1">Paid</div>
            <div className="text-[32px] font-bold leading-none text-white">{paidCount}/{totalPayrollsCount}</div>
            <div className="text-[11px] font-semibold text-blue-100 mt-1">employee</div>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-7">
        <div className="flex justify-between items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] text-slate-400">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Pending</div>
            <div className="text-[32px] font-bold leading-none text-[#0B4EA2]">{pendingCount}/{totalPayrollsCount}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Employee</div>
          </div>
        </div>
      </div>
    </div>
  );
}
