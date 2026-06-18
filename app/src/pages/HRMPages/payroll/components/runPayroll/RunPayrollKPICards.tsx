import { DollarSign, UserCheck, CalendarDays } from 'lucide-react';

export function RunPayrollKPICards() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {/* Gross Payroll */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <div className="flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#0B4EA2]">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Gross Payroll</div>
            <div className="flex items-baseline justify-end gap-0.5">
              <span className="text-[26px] font-bold text-[#0B4EA2] leading-none">149,558</span>
              <span className="text-[18px] font-bold text-[#0B4EA2] leading-none">$</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Per Month</div>
          </div>
        </div>
      </div>

      {/* Net Payroll */}
      <div className="rounded-[20px] bg-[#0B4EA2] p-6 text-white">
        <div className="flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-blue-100 mb-1">Net Payroll</div>
            <div className="text-[26px] font-bold leading-none text-white">$131,108</div>
            <div className="text-[11px] font-semibold text-blue-100 mt-1">Per Month</div>
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <div className="flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#0B4EA2]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Pending</div>
            <div className="text-[26px] font-bold leading-none text-[#0B4EA2]">50/130</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">Employee</div>
          </div>
        </div>
      </div>

      {/* Reviewed */}
      <div className="rounded-[20px] bg-[#0B4EA2] p-6 text-white">
        <div className="flex justify-between items-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <UserCheck className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold text-blue-100 mb-1">Reviewed</div>
            <div className="text-[26px] font-bold leading-none text-white">100/120</div>
            <div className="text-[11px] font-semibold text-blue-100 mt-1">Employee</div>
          </div>
        </div>
      </div>
    </div>
  );
}
