import { SalaryRecord } from '../../../types';

type Props = {
  record: SalaryRecord;
};

export function SalaryComparison({ record }: Props) {
  const formatMonthly = (salaryStr: string) => {
    return `$${Math.round(parseInt(salaryStr.replace(/[^0-9]/g, '')) / 12).toLocaleString()}/month`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/30">
        <p className="text-[13px] text-slate-400 mb-1.5 font-medium">Previous Salary</p>
        <p className="text-2xl font-bold text-slate-600 mb-1">{record.prevSalary}</p>
        <p className="text-xs text-slate-400 font-medium">{formatMonthly(record.prevSalary)}</p>
      </div>
      <div className="border-2 border-[#10b981] rounded-xl p-5 bg-white">
        <p className="text-[13px] text-[#10b981] mb-1.5 font-medium">New Salary</p>
        <p className="text-2xl font-bold text-[#047857] mb-1">{record.newSalary}</p>
        <p className="text-xs text-[#10b981] font-medium">{formatMonthly(record.newSalary)}</p>
      </div>
    </div>
  );
}
