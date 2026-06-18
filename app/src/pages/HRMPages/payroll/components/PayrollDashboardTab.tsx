import { PayrollKPICards } from './PayrollKPICards';
import { PayrollDeadlineBanner } from './PayrollDeadlineBanner';
import { PayrollCostTrendChart } from './PayrollCostTrendChart';
import { PayrollQuickActions } from './PayrollQuickActions';

export function PayrollDashboardTab() {
  return (
    <div className="mt-6">
      {/* KPI Cards Row */}
      <PayrollKPICards />

      {/* Main Grid: Left content + Right Quick Actions */}
      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PayrollDeadlineBanner />
          <PayrollCostTrendChart />
        </div>

        {/* Right Column */}
        <PayrollQuickActions />
      </div>
    </div>
  );
}
