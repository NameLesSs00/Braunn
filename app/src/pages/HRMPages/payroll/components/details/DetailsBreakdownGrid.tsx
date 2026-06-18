import { TrendingUp, TrendingDown, PenSquare, Gift, MinusCircle } from 'lucide-react';
import { ReviewPayrollRecord } from '../../reviewPayrollMockData';

type Props = {
  record: ReviewPayrollRecord;
};

export function DetailsBreakdownGrid({ record }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Bonuses */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <h4 className="mb-6 flex items-center gap-2 text-[15px] font-bold text-slate-800">
          <Gift className="h-4 w-4 text-emerald-500" /> Bonuses
        </h4>
        <div className="space-y-4">
          {record.bonusesList.map((bonus, i) => (
            <div key={i} className="flex justify-between text-[14px]">
              <span className="text-slate-600 font-medium">{bonus.name}</span>
              <span className="font-bold text-emerald-600">+{bonus.amount}$</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-[14px] font-bold">
          <span className="text-emerald-600">Total Bonuses</span>
          <span className="text-emerald-600">{record.allowances}$</span>
        </div>
      </div>

      {/* Deductions */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <h4 className="mb-6 flex items-center gap-2 text-[15px] font-bold text-slate-800">
          <MinusCircle className="h-4 w-4 text-red-500" /> Deductions
        </h4>
        <div className="space-y-4">
          {record.deductionsList.map((deduction, i) => (
            <div key={i} className="flex justify-between text-[14px]">
              <span className="text-slate-600 font-medium">{deduction.name}</span>
              <span className="font-bold text-slate-900">{deduction.amount}$</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-[15px] font-bold">
          <span className="text-red-600">Total Deductions</span>
          <span className="text-red-600">{record.deductions}$</span>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <h4 className="mb-6 text-[15px] font-bold text-slate-800">Attendance Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[12px] bg-slate-50 p-4">
            <div className="text-[12px] font-bold text-slate-600 mb-1">WORKING DAYS</div>
            <div className="text-[24px] font-bold text-slate-900">{record.attendance.workingDays}</div>
          </div>
          <div className="rounded-[12px] bg-red-50 p-4">
            <div className="text-[12px] font-bold text-red-600 mb-1">ABSENT DAYS</div>
            <div className="text-[24px] font-bold text-red-600">{record.attendance.absentDays}</div>
          </div>
          <div className="rounded-[12px] bg-slate-50 p-4">
            <div className="text-[12px] font-bold text-slate-600 mb-1">LATE CHECK-INS</div>
            <div className="text-[24px] font-bold text-slate-900">{record.attendance.lateCheckIns}</div>
          </div>
          <div className="rounded-[12px] bg-blue-50 p-4">
            <div className="text-[12px] font-bold text-[#0B4EA2] mb-1">OVERTIME</div>
            <div className="text-[24px] font-bold text-[#0B4EA2]">{record.attendance.overtimeHours}h</div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <h4 className="mb-6 text-[15px] font-bold text-slate-800">Comparison with Last Month</h4>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[13px] font-medium text-slate-500 mb-1">September 2023</div>
            <div className="text-[24px] font-bold text-slate-900">{record.comparison.lastMonth.toLocaleString()}$</div>
          </div>
          <div className="flex flex-col items-center">
            {record.comparison.trend === 'up' ? (
              <div className="flex items-center gap-1 text-emerald-500 text-[13px] font-bold">
                <TrendingUp className="h-4 w-4" /> +{record.comparison.percentage}%
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500 text-[13px] font-bold">
                <TrendingDown className="h-4 w-4" /> {record.comparison.percentage}%
              </div>
            )}
            <div className="text-[11px] text-slate-400 font-medium">
              {record.comparison.trend === 'up' ? '+' : ''}{record.comparison.difference}$
            </div>
          </div>
          <div className="text-right">
            <div className="text-[13px] font-medium text-slate-500 mb-1">October 2023</div>
            <div className="text-[24px] font-bold text-[#0B4EA2]">{record.comparison.thisMonth.toLocaleString()}$</div>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4 relative">
          <div className="text-[11px] text-slate-500 mb-1">Notes</div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-slate-600 italic">Employee has extra overtime this month due to...</span>
            <PenSquare className="h-4 w-4 text-[#0B4EA2]" />
          </div>
        </div>
      </div>
    </div>
  );
}
