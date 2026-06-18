import { Clock } from 'lucide-react';
import type { HREmployeeReadDto } from '../../../../../models/HRMmodels/HREmployee';

type Props = {
  employee: HREmployeeReadDto;
};

export function EmployeeAttendanceTab({ employee: _ }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-[20px] p-12 flex flex-col items-center justify-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
        <Clock className="w-7 h-7 text-slate-400" />
      </div>
      <div>
        <div className="text-[16px] font-bold text-slate-700 mb-1">No Attendance Data</div>
        <div className="text-[14px] text-slate-500 max-w-sm">
          Attendance tracking is not yet available via the API. This section will display clock-in/out logs once the endpoint is integrated.
        </div>
      </div>
    </div>
  );
}
