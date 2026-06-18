import { HKStatsCards } from './components/HKStatsCards';
import { HKLiveActivity } from './components/HKLiveActivity';
import { HKRoomStatus } from './components/HKRoomStatus';
import { HKStaffAvailability } from './components/HKStaffAvailability';

export function DashboardHKPage() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a365d]">Overview</h1>
      </div>

      {/* Top Cards */}
      <HKStatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <HKLiveActivity />
        <HKRoomStatus />
        <HKStaffAvailability />
      </div>
    </div>
  );
}
