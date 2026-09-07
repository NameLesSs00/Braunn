import { ArrowRight, Bell } from 'lucide-react';
import { useAppSelector } from '../../../../store/hooks';
import { formatPeriod } from '../payrollUtils';

type Props = {
  month: number;
  year: number;
  onReview: () => void;
};

export function PayrollDeadlineBanner({ month, year, onReview }: Props) {
  const pendingCount = useAppSelector((state) =>
    state.hrPayroll.payrolls.filter((payroll) => payroll.status === 'Pending' || payroll.status === 'Draft').length
  );

  return (
    <div className="relative mb-6 overflow-hidden rounded-[20px] bg-[#0B4EA2] p-8 text-white shadow-md">
      {/* Background Watermark */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[280px] leading-none font-serif text-white opacity-[0.04] pointer-events-none select-none">
        $
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="mb-2 flex items-center gap-3 text-[22px] font-bold">
            <Bell className="h-6 w-6 text-orange-400" fill="currentColor" />
            Payroll Deadline Reminder
          </h2>
          <p className="text-[14px] text-blue-100 font-medium">
            Current pay period is {formatPeriod(month, year)}<br />
            You still have {pendingCount} employees pending review.
          </p>
        </div>

        <button
          type="button"
          onClick={onReview}
          className="flex items-center gap-2 rounded-full bg-[#FBBF24] px-6 py-3 text-[14px] font-bold text-slate-900 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          Review Payroll
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
