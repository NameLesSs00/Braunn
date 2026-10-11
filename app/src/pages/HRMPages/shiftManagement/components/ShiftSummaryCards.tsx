import { UserCheck, Sun, Sunrise, Moon } from 'lucide-react';
import { useAppSelector } from '../../../../store/hooks';

export function ShiftSummaryCards() {
  const { shiftOverview } = useAppSelector((state) => state.hrManagement);

  const getShiftCount = (name: string) => 
    shiftOverview?.shifts.find(s => s.shiftName.toLowerCase() === name.toLowerCase())?.employeeCount ?? '-';

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Total Today */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <UserCheck className="h-7 w-7 text-emerald-500" />
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-500">Total Today</div>
          <div className="text-4xl font-bold text-[#0B4EA2]">{shiftOverview?.activeEmployeesCount ?? '-'}</div>
          <div className="text-sm text-slate-500 mt-1">Employee</div>
        </div>
      </div>

      {/* Morning */}
      <div className="flex items-center justify-between rounded-2xl bg-[#0B4EA2] p-6 text-white shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <Sun className="h-7 w-7 text-yellow-300" />
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-blue-100">Morning</div>
          <div className="text-4xl font-bold">{getShiftCount('morning')}</div>
          <div className="text-sm text-blue-100 mt-1">employee</div>
        </div>
      </div>

      {/* Evening */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50">
          <Sunrise className="h-7 w-7 text-yellow-500" />
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-500">Evening</div>
          <div className="text-4xl font-bold text-[#0B4EA2]">{getShiftCount('evening')}</div>
          <div className="text-sm text-slate-500 mt-1">Employee</div>
        </div>
      </div>

      {/* Night */}
      <div className="flex items-center justify-between rounded-2xl bg-[#0B4EA2] p-6 text-white shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <Moon className="h-7 w-7 text-slate-200" />
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-blue-100">Night</div>
          <div className="text-4xl font-bold">{getShiftCount('night')}</div>
          <div className="text-sm text-blue-100 mt-1">Employee</div>
        </div>
      </div>
    </div>
  );
}
