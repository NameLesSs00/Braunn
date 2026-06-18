import { SalaryRecord } from '../../../types';

type Props = {
  record: SalaryRecord;
  circleColorClass?: string;
  badgeBgColorClass?: string;
  badgeTextColorClass?: string;
  badgeText?: string;
};

export function ProfileSection({ 
  record, 
  circleColorClass = 'bg-teal-500', 
  badgeBgColorClass = 'bg-green-50', 
  badgeTextColorClass = 'text-green-600',
  badgeText
}: Props) {
  const displayBadgeText = badgeText || record.status;

  return (
    <div className="bg-slate-50/50 rounded-2xl p-4 flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${circleColorClass}`}>
          {record.employee.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-base">{record.employee}</h3>
          <p className="text-sm text-slate-500">{record.role} · {record.department}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeBgColorClass} ${badgeTextColorClass}`}>
        {displayBadgeText}
      </span>
    </div>
  );
}
