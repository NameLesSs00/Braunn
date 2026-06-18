interface BiometricLog {
  initials: string;
  name: string;
  department: string;
  time: string;
  location: string;
  status: 'On Time' | 'Late';
  avatarColor: string;
}

const logs: BiometricLog[] = [
  {
    initials: 'SA',
    name: 'Sarah Anderson',
    department: 'Operations',
    time: '08:55 AM',
    location: 'Main Entrance Gate A',
    status: 'On Time',
    avatarColor: 'bg-blue-100 text-blue-700',
  },
  {
    initials: 'MR',
    name: 'Michael Roberts',
    department: 'IT & Engineering',
    time: '09:15 AM',
    location: 'Server Room B',
    status: 'Late',
    avatarColor: 'bg-purple-100 text-purple-700',
  },
  {
    initials: 'EJ',
    name: 'Emily Chen',
    department: 'Finance',
    time: '08:45 AM',
    location: 'Admin Block C',
    status: 'On Time',
    avatarColor: 'bg-teal-100 text-teal-700',
  },
];

function StatusBadge({ status }: { status: BiometricLog['status'] }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${
        status === 'On Time'
          ? 'bg-emerald-100 text-emerald-600'
          : 'bg-amber-100 text-amber-600'
      }`}
    >
      {status}
    </span>
  );
}

export function HRMBiometricLogs() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-bold text-slate-800">Recent Biometric Logs</h2>
        <button className="text-[13px] font-semibold text-[#0B4EA2] hover:underline flex items-center gap-1">
          View All →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-100">
              <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Department</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Time</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Location</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log) => (
              <tr key={log.name} className="hover:bg-slate-50 transition-colors">
                {/* Employee */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${log.avatarColor}`}
                    >
                      {log.initials}
                    </div>
                    <span className="text-[14px] font-semibold text-slate-800">{log.name}</span>
                  </div>
                </td>
                {/* Department */}
                <td className="px-4 py-4 text-[14px] text-slate-500">{log.department}</td>
                {/* Time */}
                <td className="px-4 py-4 text-[14px] text-slate-600 font-medium">{log.time}</td>
                {/* Location */}
                <td className="px-4 py-4 text-[14px] text-slate-500">{log.location}</td>
                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge status={log.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
