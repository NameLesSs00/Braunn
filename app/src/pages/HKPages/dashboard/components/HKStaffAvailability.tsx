import { staffAvailabilityData, StaffItem } from '../mockData';

function StatusBadge({ status }: { status: StaffItem['status'] }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    break: 'bg-orange-50 text-amber-600 border border-orange-200',
    offline: 'bg-slate-900 text-white',
  };

  return (
    <span className={`inline-flex items-center justify-center px-4 py-1 text-[11px] font-bold rounded-full uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

export function HKStaffAvailability() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-[16px] font-bold text-[#1a365d] mb-6">Staff Availability</h2>

      <div className="space-y-5">
        {staffAvailabilityData.map((staff, index) => (
          <div key={`${staff.id}-${index}`} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Initials Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#0a4bbd] flex items-center justify-center text-white font-bold text-[14px]">
                {staff.initials}
              </div>
              
              {/* Info */}
              <div>
                <p className="text-[14px] font-bold text-slate-800 leading-none mb-1.5">{staff.name}</p>
                <p className="text-[12px] font-medium text-slate-400 leading-none">{staff.detail}</p>
              </div>
            </div>

            {/* Badge */}
            <StatusBadge status={staff.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
