import { useState } from 'react';
import { Banknote, Check, Landmark, Loader2, PlayCircle } from 'lucide-react';
import type { HRPayrollReadDto, PaymentMethod } from '../../../../../models/HRMmodels/Payroll';
import { displayPaymentMethod, formatMoney, formatPeriod } from '../../payrollUtils';

type Props = {
  employees: HRPayrollReadDto[];
  onProcess: (paymentMethod: PaymentMethod) => void;
  processing?: boolean;
};

export function RunPayrollConfirmRight({ employees, onProcess, processing = false }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BankTransfer');

  const total = employees.reduce((sum, e) => sum + e.netSalary, 0);
  const estimatedProcessing = paymentMethod === 'BankTransfer' ? '2-3 Business Days' : 'Same Day';
  const period = employees[0] ? formatPeriod(employees[0].month, employees[0].year) : '-';

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <h3 className="text-[16px] font-bold text-slate-800 mb-1">Select Payment Method</h3>
        <p className="text-[13px] text-slate-500 mb-5">Choose how employees will receive their salary</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('BankTransfer')}
            className={`relative flex flex-col items-start gap-2 rounded-[16px] border-2 p-4 text-left transition-all ${
              paymentMethod === 'BankTransfer'
                ? 'border-[#0B4EA2] bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {paymentMethod === 'BankTransfer' && (
              <Check className="absolute right-3 top-3 h-4 w-4 text-[#0B4EA2]" />
            )}
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              paymentMethod === 'BankTransfer' ? 'bg-[#0B4EA2]' : 'bg-slate-100'
            }`}>
              <Landmark className={`h-5 w-5 ${paymentMethod === 'BankTransfer' ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-slate-800">Bank Transfer</div>
              <div className="text-[12px] text-slate-500">Direct deposit to employee accounts</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('Cash')}
            className={`relative flex flex-col items-start gap-2 rounded-[16px] border-2 p-4 text-left transition-all ${
              paymentMethod === 'Cash'
                ? 'border-[#0B4EA2] bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {paymentMethod === 'Cash' && (
              <Check className="absolute right-3 top-3 h-4 w-4 text-[#0B4EA2]" />
            )}
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              paymentMethod === 'Cash' ? 'bg-[#0B4EA2]' : 'bg-slate-100'
            }`}>
              <Banknote className={`h-5 w-5 ${paymentMethod === 'Cash' ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-slate-800">Cash</div>
              <div className="text-[12px] text-slate-500">Physical cash disbursement</div>
            </div>
          </button>
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <h3 className="text-[16px] font-bold text-slate-800 mb-5">Payroll Summary</h3>

        <div className="space-y-4">
          {[
            { label: 'Pay Period', value: period },
            { label: 'Total Employees', value: String(employees.length) },
            { label: 'Total Amount', value: formatMoney(total) },
            { label: 'Payment Method', value: displayPaymentMethod(paymentMethod) },
            { label: 'Estimated Processing', value: estimatedProcessing },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[14px] text-slate-500">{label}</span>
              <span className="text-[14px] font-bold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onProcess(paymentMethod)}
        disabled={processing || employees.length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#0B4EA2] py-4 text-[15px] font-bold text-white shadow-md transition-all hover:bg-[#0a428a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
        Process Payroll
      </button>
    </div>
  );
}
