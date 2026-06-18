import { Bell, ArrowRight, DollarSign } from 'lucide-react';

export function PayrollDeadlineBanner() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[20px] bg-[#0B4EA2] p-8 text-white shadow-md">
      {/* Background Watermark */}
      <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
        <DollarSign className="h-64 w-64" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="mb-2 flex items-center gap-3 text-[22px] font-bold">
            <Bell className="h-6 w-6 text-orange-400" fill="currentColor" />
            Payroll Deadline Reminder
          </h2>
          <p className="text-[14px] text-blue-100 font-medium">
            Salary payout is scheduled for 30 Oct 2026<br />
            You still have 12 employees pending review.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-[#FBBF24] px-6 py-3 text-[14px] font-bold text-slate-900 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
          Review Payroll
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
