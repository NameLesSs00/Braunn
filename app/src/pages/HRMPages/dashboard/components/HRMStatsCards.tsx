import { FiUsers, FiUserCheck, FiClock, FiSun } from 'react-icons/fi';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  highlighted?: boolean;
}

const stats: StatCard[] = [
  { label: 'Total Employees', value: '1,248', icon: FiUsers },
  { label: 'Present Today', value: '1,156', icon: FiUserCheck, highlighted: true },
  { label: 'Late Arrivals', value: '42', icon: FiClock },
  { label: 'Employees on Leave', value: '50', icon: FiSun, highlighted: true },
];

export function HRMStatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-2xl p-6 flex flex-col gap-4 ${
              stat.highlighted
                ? 'bg-[#0B4EA2] text-white'
                : 'bg-white border border-slate-100 text-slate-800'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stat.highlighted ? 'bg-white/20' : 'bg-[#EEF4FF]'
              }`}
            >
              {/* @ts-ignore */}
              <Icon className={`w-5 h-5 ${stat.highlighted ? 'text-white' : 'text-[#0B4EA2]'}`} />
            </div>
            <div>
              <div className={`text-3xl font-bold leading-none ${stat.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {stat.value}
              </div>
              <div className={`text-[13px] mt-1 ${stat.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>
                {stat.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
