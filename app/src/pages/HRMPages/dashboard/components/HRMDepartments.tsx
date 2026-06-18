import { FiTool, FiShield } from 'react-icons/fi';
import { MdOutlineCleaningServices } from 'react-icons/md';
import { BsBuilding } from 'react-icons/bs';

interface Department {
  name: string;
  count: number;
  color: string;
  icon: React.ElementType;
  iconColor: string;
}

const departments: Department[] = [
  { name: 'Maintenance', count: 16, color: '#F97316', icon: FiTool, iconColor: 'text-orange-500' },
  { name: 'Housekeeping', count: 38, color: '#22C55E', icon: MdOutlineCleaningServices, iconColor: 'text-green-500' },
  { name: 'Security', count: 18, color: '#64748B', icon: FiShield, iconColor: 'text-slate-500' },
  { name: 'Receptionist', count: 24, color: '#3B82F6', icon: BsBuilding, iconColor: 'text-blue-500' },
];

const maxCount = Math.max(...departments.map((d) => d.count));

export function HRMDepartments() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="text-[16px] font-bold text-slate-800 mb-5">Departments</h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {departments.map((dept) => {
          const Icon = dept.icon;
          const barWidth = Math.round((dept.count / maxCount) * 100);
          return (
            <div key={dept.name} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  {/* @ts-ignore */}
                  <Icon className={`w-8 h-8 ${dept.iconColor}`} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-slate-800">{dept.name}</div>
                  <div className="text-[12px] text-slate-400">{dept.count} employee</div>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, backgroundColor: dept.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
