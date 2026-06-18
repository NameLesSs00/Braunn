import { CheckCircle2, Users, DollarSign, CalendarDays, Download, ArrowLeft } from 'lucide-react';

type Props = {
  employeeCount: number;
  totalAmount: number;
  onBack: () => void;
};

export function RunPayrollSuccessScreen({ employeeCount, totalAmount, onBack }: Props) {
  const payDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="mt-6 flex min-h-[60vh] flex-col items-center justify-center">
      {/* Success Icon */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-14 w-14 text-emerald-500" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h2 className="text-[28px] font-bold text-slate-900 mb-3">Payroll Processed!</h2>
      <p className="text-[15px] text-slate-500 text-center mb-10 max-w-sm leading-relaxed">
        June 2026 payroll has been successfully disbursed<br />to all employees.
      </p>

      {/* Stats cards */}
      <div className="mb-10 grid grid-cols-3 gap-4 w-full max-w-xl">
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-slate-200 bg-white py-5 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
            <Users className="h-4 w-4 text-[#0B4EA2]" />
          </div>
          <div className="text-[20px] font-bold text-slate-900">{employeeCount}</div>
          <div className="text-[12px] font-medium text-slate-500 text-center">Employees Paid</div>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-slate-200 bg-white py-5 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-[20px] font-bold text-slate-900">${totalAmount.toLocaleString()}</div>
          <div className="text-[12px] font-medium text-slate-500 text-center">Total Amount</div>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-slate-200 bg-white py-5 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50">
            <CalendarDays className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-[20px] font-bold text-slate-900">{payDate}</div>
          <div className="text-[12px] font-medium text-slate-500 text-center">Pay Date</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
          <Download className="h-4 w-4" /> Download Report
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-6 py-3 text-[14px] font-bold text-white hover:bg-[#0a428a] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Payroll
        </button>
      </div>
    </div>
  );
}
