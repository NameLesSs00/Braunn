import { Banknote, CalendarDays, CheckCircle2, DollarSign, Landmark, Loader2, ReceiptText, UserRound, X } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import type { PayrollProcessingReadDto } from '../../../../models/HRMmodels/Payroll';
import { displayPaymentMethod, formatMoney, formatShortDate } from '../payrollUtils';

type DetailStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type Props = {
  open: boolean;
  onClose: () => void;
  record: PayrollProcessingReadDto | null;
  status: DetailStatus;
};

export function PayrollProcessingDetailsModal({ open, onClose, record, status }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[90vh] w-[620px] flex-col overflow-hidden rounded-[20px] bg-[#F8FAFC] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-7 py-5">
          <div>
            <h2 className="text-[20px] font-bold text-[#1a365d]">Payroll Payment Details</h2>
            <p className="mt-1 text-[13px] font-medium text-slate-500">Processed payment record</p>
          </div>
          <button onClick={onClose} className="text-slate-400 transition-colors hover:text-slate-600" title="Close">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-7">
          {status === 'loading' ? (
            <div className="grid min-h-[300px] place-items-center text-slate-500">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-[#0B4EA2]" />
                <span className="text-[14px] font-semibold">Loading payment details...</span>
              </div>
            </div>
          ) : status === 'failed' ? (
            <div className="grid min-h-[300px] place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-50">
                  <ReceiptText className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-[16px] font-bold text-slate-900">Payment details unavailable</h3>
                <p className="mt-2 text-[13px] font-medium text-slate-500">
                  The payment record could not be loaded right now.
                </p>
              </div>
            </div>
          ) : record ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-[16px] border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B4EA2]">
                    <UserRound className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-slate-900">{record.employeeName || 'Employee'}</h3>
                    <div className="mt-1 text-[13px] font-semibold text-slate-500">
                      Payroll {record.payrollNumber || '-'}
                    </div>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-bold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Processed
                </span>
              </div>

              <div className="rounded-[16px] border border-slate-200 bg-white p-5">
                <div className="mb-4 text-[13px] font-bold uppercase tracking-wide text-slate-500">Payment Summary</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      Amount
                    </div>
                    <div className="text-[22px] font-bold text-slate-900">{formatMoney(record.amount)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-slate-500">
                      <CalendarDays className="h-4 w-4 text-[#0B4EA2]" />
                      Pay Date
                    </div>
                    <div className="text-[16px] font-bold text-slate-900">{formatShortDate(record.createdAt)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] border border-slate-200 bg-white p-5">
                <div className="mb-4 text-[13px] font-bold uppercase tracking-wide text-slate-500">Payment Method</div>
                <div className="space-y-4 text-[14px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-slate-600">
                      {record.paymentMethod === 'BankTransfer' ? (
                        <Landmark className="h-4 w-4 text-[#0B4EA2]" />
                      ) : (
                        <Banknote className="h-4 w-4 text-emerald-600" />
                      )}
                      Method
                    </span>
                    <span className="font-bold text-slate-900">{displayPaymentMethod(record.paymentMethod)}</span>
                  </div>
                  {record.bankTransferNo && (
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="font-semibold text-slate-600">Bank Transfer No.</span>
                      <span className="font-bold text-slate-900">{record.bankTransferNo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[300px] place-items-center text-[14px] font-semibold text-slate-500">
              No payment record selected.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
