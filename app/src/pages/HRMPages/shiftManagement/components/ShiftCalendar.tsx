import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ShiftBlock } from './ShiftBlock';
import { WeekDatePicker } from './WeekDatePicker';
import { getDeptColor } from '../deptColors';
import { Shift } from '../types';

type WeekDay = {
  label: string;
  date: string;
  dateStr: string;
};

type Props = {
  onShiftClick: (shift: Shift) => void;
  shifts: Shift[];
  weekDays: WeekDay[];
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDateChange: (newWeekStart: Date) => void;
  dynamicDepartments: string[];
};

export function ShiftCalendar({ 
  onShiftClick, 
  shifts, 
  weekDays, 
  currentWeekStart,
  onPrevWeek, 
  onNextWeek, 
  onDateChange,
  dynamicDepartments
}: Props) {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const year = currentWeekStart.getFullYear();
  const dateRangeLabel = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${year}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      {/* Top Header - Date Navigation & Legend */}
      <div className="p-6 border-b border-slate-200">

        {/* Row 1: Prev/Next + WeekDatePicker */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={onPrevWeek}
              className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[14px] font-semibold text-slate-800">{dateRangeLabel}</span>
            <button 
              onClick={onNextWeek}
              className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <WeekDatePicker 
            currentWeekStart={currentWeekStart}
            onDateChange={onDateChange}
          />
        </div>

        {/* Row 2: Department Color Legend */}
        {dynamicDepartments.length > 0 && (
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-3">
              Department Colors
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {dynamicDepartments.map((dept) => (
                <div key={dept} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: getDeptColor(dept) }} />
                  <span className="text-[12px] font-semibold text-slate-600">{dept}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-[#F8FAFC]">
        {weekDays.map((d, i) => (
          <div
            key={d.dateStr}
            className={`py-4 text-center ${i < 6 ? 'border-r border-slate-200' : ''}`}
          >
            <div className="text-[12px] font-semibold text-slate-400">{d.label}</div>
            <div className="text-[14px] font-bold text-slate-800 mt-0.5">{d.date}</div>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 flex-1 min-h-[500px]">
        {weekDays.map((d, i) => {
          const dayShifts = shifts.filter((s) => s.dateStr === d.dateStr);

          return (
            <div
              key={d.dateStr}
              className={`p-3 ${i < 6 ? 'border-r border-slate-200' : ''}`}
            >
              {dayShifts.length === 0 && (
                <div className="flex h-full min-h-[80px] items-center justify-center text-[11px] text-slate-300 font-medium">
                  No shifts
                </div>
              )}
              {dayShifts.map((shift) => (
                <ShiftBlock key={shift.id} shift={shift} onClick={onShiftClick} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
