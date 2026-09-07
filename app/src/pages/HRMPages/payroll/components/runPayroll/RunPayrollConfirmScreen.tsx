import type { HRPayrollReadDto, PaymentMethod } from '../../../../../models/HRMmodels/Payroll';
import { RunPayrollConfirmLeft } from './RunPayrollConfirmLeft';
import { RunPayrollConfirmRight } from './RunPayrollConfirmRight';

type Props = {
  employees: HRPayrollReadDto[];
  onBack: () => void;
  onProcess: (paymentMethod: PaymentMethod) => void;
  processing?: boolean;
};

export function RunPayrollConfirmScreen({ employees, onBack, onProcess, processing = false }: Props) {
  return (
    <div className="mt-6">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 text-[14px] font-semibold text-slate-500 transition-colors hover:text-[#0B4EA2]"
      >
        <span className="text-lg leading-none">&larr;</span> Back to payroll list
      </button>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        <RunPayrollConfirmLeft employees={employees} />
        <RunPayrollConfirmRight employees={employees} onProcess={onProcess} processing={processing} />
      </div>
    </div>
  );
}
