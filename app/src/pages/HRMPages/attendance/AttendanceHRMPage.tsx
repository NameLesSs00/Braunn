import { AttendanceStatsCards } from './components/AttendanceStatsCards';
import { AttendanceFilters } from './components/AttendanceFilters';
import { AttendanceTable } from './components/AttendanceTable';

export function AttendanceHRMPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-[#0B4EA2]">Attendance Management</h1>
        <p className="text-[14px] text-slate-500 mt-0.5">Track and manage employee attendance and working hours</p>
      </div>

      {/* Stats row */}
      <AttendanceStatsCards />

      {/* Table Section */}
      <div className="mt-8 shadow-sm rounded-2xl">
        <AttendanceFilters />
        <AttendanceTable />
      </div>
    </div>
  );
}
