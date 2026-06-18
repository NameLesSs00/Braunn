import { useState } from 'react';
import { Landmark, Banknote, Check, PlayCircle } from 'lucide-react';
import { ReviewPayrollRecord } from '../../reviewPayrollMockData';

type PaymentMethod = 'Bank Transfer' | 'Cash';

type Props = {
  employees: ReviewPayrollRecord[];
  onProcess: () => void;
};

export function RunPayrollConfirmRight({ employees, onProcess }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');

  const total = employees.reduce((sum, e) => sum + e.netPay, 0);
  const estimatedProcessing = paymentMethod === 'Bank Transfer' ? '2–3 Business Days' : 'Same Day';

  return (
    <div className="flex flex-col gap-6">
      {/* Select Payment Method */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <h3 className="text-[16px] font-bold text-slate-800 mb-1">Select Payment Method</h3>
        <p className="text-[13px] text-slate-500 mb-5">Choose how employees will receive their salary</p>

        <div className="grid grid-cols-2 gap-4">
          {/* Bank Transfer */}
          <button
            onClick={() => setPaymentMethod('Bank Transfer')}
            className={`relative flex flex-col items-start gap-2 rounded-[16px] border-2 p-4 text-left transition-all ${
              paymentMethod === 'Bank Transfer'
                ? 'border-[#0B4EA2] bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {paymentMethod === 'Bank Transfer' && (
              <Check className="absolute right-3 top-3 h-4 w-4 text-[#0B4EA2]" />
            )}
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              paymentMethod === 'Bank Transfer' ? 'bg-[#0B4EA2]' : 'bg-slate-100'
            }`}>
              <Landmark className={`h-5 w-5 ${paymentMethod === 'Bank Transfer' ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-slate-800">Bank Transfer</div>
              <div className="text-[12px] text-slate-500">Direct deposit to employee accounts</div>
            </div>
          </button>

          {/* Cash */}
          <button
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

      {/* Payroll Summary */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-6">
        <h3 className="text-[16px] font-bold text-slate-800 mb-5">Payroll Summary</h3>

        <div className="space-y-4">
          {[
            { label: 'Pay Period',            value: 'June 2026' },
            { label: 'Total Employees',       value: String(employees.length) },
            { label: 'Total Amount',          value: `$${total.toLocaleString()}` },
            { label: 'Payment Method',        value: paymentMethod },
            { label: 'Estimated Processing',  value: estimatedProcessing },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[14px] text-slate-500">{label}</span>
              <span className="text-[14px] font-bold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Process Payroll CTA */}
      <button
        onClick={onProcess}
        className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-[#0B4EA2] py-4 text-[15px] font-bold text-white shadow-md transition-all hover:bg-[#0a428a] active:scale-[0.99]"
      >
        <PlayCircle className="h-5 w-5" />
        Process Payroll
      </button>
    </div>
  );
}
