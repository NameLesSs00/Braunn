import { PayrollKPICards } from './PayrollKPICards';
import { PayrollDeadlineBanner } from './PayrollDeadlineBanner';
import { PayrollCostTrendChart } from './PayrollCostTrendChart';
import { PayrollQuickActions } from './PayrollQuickActions';

type Props = {
  month: number;
  year: number;
  onNavigate: (tab: 'Dashboard' | 'Review Payroll' | 'Run Payroll' | 'Payroll History') => void;
};

export function PayrollDashboardTab({ month, year, onNavigate }: Props) {
  return (
    <div className="mt-6">
      {/* KPI Cards Row */}
      <PayrollKPICards />

      {/* Main Grid: Left content + Right Quick Actions */}
      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PayrollDeadlineBanner month={month} year={year} onReview={() => onNavigate('Review Payroll')} />
          <PayrollCostTrendChart />
        </div>

        {/* Right Column */}
        <PayrollQuickActions onNavigate={onNavigate} />
      </div>
    </div>
  );
}
