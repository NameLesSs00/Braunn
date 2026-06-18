import { HRMStatsCards } from './components/HRMStatsCards';
import { HRMDepartments } from './components/HRMDepartments';
import { HRMAttendanceTrends } from './components/HRMAttendanceTrends';
import { HRMBiometricLogs } from './components/HRMBiometricLogs';

export function DashboardHRMPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-[22px] font-bold text-[#0B4EA2]">Overview</h1>
        <p className="text-[14px] text-slate-500 mt-0.5">Quick summary of employee and attendance status today</p>
      </div>

      {/* Stats Cards */}
      <HRMStatsCards />

      {/* Middle Row: Departments + Attendance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HRMDepartments />
        <HRMAttendanceTrends />
      </div>

      {/* Recent Biometric Logs */}
      <HRMBiometricLogs />
    </div>
  );
}
