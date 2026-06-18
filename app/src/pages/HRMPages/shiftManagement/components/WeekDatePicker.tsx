import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';

type Props = {
  currentWeekStart: Date;
  onDateChange: (newWeekStart: Date) => void;
};

/** Formats a Date to YYYY-MM-DD for <input type="date"> */
function toInputDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Returns the Monday of the week containing `d` */
function getMondayOf(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // 0 = Sun, 1 = Mon …
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function WeekDatePicker({ currentWeekStart, onDateChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const rangeLabel = `${currentWeekStart.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} – ${weekEnd.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  function handleButtonClick() {
    const input = inputRef.current;
    if (!input) return;
    // `showPicker()` is the reliable modern API; fall back to `click()` for older browsers
    if (typeof (input as any).showPicker === 'function') {
      (input as any).showPicker();
    } else {
      input.click();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return;
    const picked = new Date(`${e.target.value}T00:00:00`);
    onDateChange(getMondayOf(picked));
  }

  return (
    <div className="flex items-center gap-3">
      {/* Current week range badge */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
        <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">
          {rangeLabel}
        </span>
      </div>

      {/* Jump-to-date trigger */}
      <div className="relative">
        {/* Hidden date input — positioned off-screen so it doesn't interfere */}
        <input
          ref={inputRef}
          type="date"
          value={toInputDate(currentWeekStart)}
          onChange={handleChange}
          className="absolute top-0 left-0 opacity-0 pointer-events-none w-0 h-0"
          tabIndex={-1}
        />

        <button
          type="button"
          onClick={handleButtonClick}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-[#0B4EA2] transition-colors whitespace-nowrap select-none"
        >
          <CalendarDays className="h-4 w-4 text-[#0B4EA2]" />
          Jump to date
        </button>
      </div>
    </div>
  );
}
