import { Users } from 'lucide-react';
import { Shift } from '../types';
import { getDeptColor } from '../deptColors';

type Props = {
  shift: Shift;
  onClick: (shift: Shift) => void;
};

export function ShiftBlock({ shift, onClick }: Props) {
  const bgColor = getDeptColor(shift.department);

  return (
    <div
      onClick={() => onClick(shift)}
      className="mb-3 cursor-pointer rounded-xl p-3 text-white transition-transform hover:-translate-y-0.5 hover:shadow-md"
      style={{ backgroundColor: bgColor }}
    >
      <div className="text-[13px] font-bold leading-tight">{shift.type}</div>
      <div className="mt-1 text-[11px] font-medium opacity-90">
        {shift.startTime}-{shift.endTime}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold opacity-90">
        <Users className="h-3 w-3" />
        {shift.employeeCount}
      </div>
    </div>
  );
}
