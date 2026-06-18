import { SalaryRecord } from '../../../types';

type Props = {
  record: SalaryRecord;
};

export function IncrementStats({ record }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-slate-50/70 rounded-xl p-4 text-center">
        <p className="text-[13px] text-slate-400 font-medium mb-1.5">Increment Amount</p>
        <p className="text-lg font-bold text-[#10b981]">{record.incrementAmount}</p>
      </div>
      <div className="bg-slate-50/70 rounded-xl p-4 text-center">
        <p className="text-[13px] text-slate-400 font-medium mb-1.5">Increment %</p>
        <p className="text-lg font-bold text-[#2563eb]">{record.incrementPercent}</p>
      </div>
      <div className="bg-slate-50/70 rounded-xl p-4 text-center">
        <p className="text-[13px] text-slate-400 font-medium mb-1.5">Monthly Increase</p>
        <p className="text-lg font-bold text-[#8b5cf6]">{record.monthlyIncrease}</p>
      </div>
    </div>
  );
}
