import { ReviewPayrollRecord } from '../../reviewPayrollMockData';

type Props = {
  record: ReviewPayrollRecord;
};

export function DetailsSalaryEquation({ record }: Props) {
  return (
    <div className="mb-6 rounded-[20px] border border-slate-200 bg-white p-6 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0B4EA2]" />
      <div className="flex items-center justify-between pl-4">
        <div className="text-center">
          <div className="text-[13px] font-semibold text-slate-500 mb-1">Basic Salary</div>
          <div className="text-[24px] font-bold text-slate-900">{record.basicSalary.toLocaleString()}$</div>
        </div>
        <div className="text-[24px] font-light text-slate-300">+</div>
        <div className="text-center">
          <div className="text-[13px] font-semibold text-slate-500 mb-1">Allowances</div>
          <div className="text-[24px] font-bold text-slate-900">{record.allowances.toLocaleString()}$</div>
        </div>
        <div className="rounded-[16px] bg-emerald-50 px-8 py-4 text-center">
          <div className="text-[14px] font-semibold text-emerald-600 mb-1">Net Salary</div>
          <div className="text-[28px] font-bold text-emerald-600">{record.netPay.toLocaleString()}$</div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between border-t border-dashed border-slate-200 pl-4 pt-6">
        <div className="flex items-center gap-4">
          <div className="text-[24px] font-light text-slate-300">-</div>
          <div>
            <div className="text-[13px] font-semibold text-slate-500 mb-1">Total Deductions</div>
            <div className="text-[20px] font-bold text-red-500">{record.deductions.toLocaleString()}$</div>
          </div>
        </div>
        <div className="text-[24px] font-light text-slate-300">=</div>
      </div>
    </div>
  );
}
