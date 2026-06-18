import { IconType } from 'react-icons';
import { FiCalendar } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';
import { useAppSelector } from '../../../../shared/apis/hooks';

interface StatItem {
  label: string;
  value: number;
  icon: IconType;
  iconColor: string;
}

export function LeaveManagementStatsCards() {
  const { leaves, totalCount } = useAppSelector((s) => s.hrLeaves);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedThisMonth = leaves.filter((l) => {
    if (l.status !== 'Approved') return false;
    const d = new Date(l.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const stats: StatItem[] = [
    {
      label: 'Pending Requests',
      value: pendingCount,
      icon: FiCalendar,
      iconColor: 'text-orange-500',
    },
    {
      label: 'Approved This Month',
      value: approvedThisMonth,
      icon: FaCheck,
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Total Requests',
      value: totalCount,
      icon: FiCalendar,
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              {/* @ts-ignore */}
              <Icon className={`w-6 h-6 flex-shrink-0 ${stat.iconColor}`} />
              <span className="text-[14px] font-medium text-slate-500">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-[#1a365d]">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
}