import { ArrowLeft } from 'lucide-react';
import { ReviewPayrollRecord } from '../../reviewPayrollMockData';
import { RunPayrollConfirmLeft } from './RunPayrollConfirmLeft';
import { RunPayrollConfirmRight } from './RunPayrollConfirmRight';

type Props = {
  employees: ReviewPayrollRecord[];
  onBack: () => void;
  onProcess: () => void;
};

export function RunPayrollConfirmScreen({ employees, onBack, onProcess }: Props) {
  return (
    <div className="mt-6">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-[14px] font-semibold text-slate-600 hover:text-[#0B4EA2] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* 2-column layout */}
      <div className="grid grid-cols-[3fr_2fr] gap-6 items-start">
        <RunPayrollConfirmLeft employees={employees} />
        <RunPayrollConfirmRight employees={employees} onProcess={onProcess} />
      </div>
    </div>
  );
}
