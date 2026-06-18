import { FiUserCheck, FiClock, FiCalendar } from 'react-icons/fi';

const stats = [
  {
    label: 'Present Today',
    value: 149,
    icon: FiUserCheck,
    highlighted: false,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Late Arrivals',
    value: 7,
    icon: FiClock,
    highlighted: true,
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  {
    label: 'Absent',
    value: 2,
    icon: FiCalendar,
    highlighted: false,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
];

export function AttendanceStatsCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-2xl p-6 flex items-center gap-5 ${
              stat.highlighted
                ? 'bg-[#0B4EA2] text-white'
                : 'bg-white border border-slate-100'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}
            >
              {/* @ts-ignore */}
              <Icon className={`w-7 h-7 ${stat.iconColor}`} />
            </div>
            <div className="text-right flex-1">
              <div className={`text-[13px] font-medium mb-1 ${stat.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>
                {stat.label}
              </div>
              <div className={`text-4xl font-bold ${stat.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {stat.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
