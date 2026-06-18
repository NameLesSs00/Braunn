import { Building2 } from 'lucide-react';
import { ReviewPayrollRecord } from '../../reviewPayrollMockData';

type Props = {
  record: ReviewPayrollRecord;
};

export function DetailsProfileHeader({ record }: Props) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="grid h-16 w-16 place-items-center rounded-2xl text-[20px] font-bold text-white shadow-sm"
            style={{ backgroundColor: record.color }}
          >
            {record.initials}
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500"></div>
        </div>
        <div>
          <h3 className="text-[20px] font-bold text-slate-900">{record.name}</h3>
          <div className="text-[13px] font-semibold text-slate-500 mb-1">{record.empId}</div>
          <div className="flex items-center gap-4 text-[13px] font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {record.department} • {record.role}</span>
            <span className="flex items-center gap-1.5">Joined {record.joinedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-[16px] border border-slate-200 bg-white p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#0B4EA2]">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-500">Bank Account</div>
          <div className="text-[14px] font-bold text-slate-900">{record.bankAccount}</div>
        </div>
      </div>
    </div>
  );
}
