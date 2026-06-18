import { SalaryRecord } from '../../../types';

type Props = {
  record: SalaryRecord;
};

export function DetailsList({ record }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center py-4 border-b border-slate-100">
        <span className="text-[13px] text-slate-400 font-medium">Effective Date</span>
        <span className="text-sm font-semibold text-slate-800">{record.effectiveDate}</span>
      </div>
      <div className="flex justify-between items-center py-4 border-b border-slate-100">
        <span className="text-[13px] text-slate-400 font-medium">Next Review Date</span>
        <span className="text-sm font-semibold text-slate-800">{record.nextReviewDate}</span>
      </div>
      <div className="flex justify-between items-center py-4 border-b border-slate-100">
        <span className="text-[13px] text-slate-400 font-medium">Reason</span>
        <span className="text-sm font-semibold text-slate-800">{record.reason}</span>
      </div>
      <div className="flex justify-between items-center py-4 border-b border-slate-100">
        <span className="text-[13px] text-slate-400 font-medium">Approved By</span>
        <span className="text-sm font-semibold text-slate-800">{record.approvedBy}</span>
      </div>
    </div>
  );
}
