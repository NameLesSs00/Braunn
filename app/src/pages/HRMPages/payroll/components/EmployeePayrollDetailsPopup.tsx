import { Download, Gift, Loader2, MinusCircle, PlayCircle, X } from 'lucide-react';
import { Modal } from '../../../../shared/ui/Modal';
import type { HRPayrollReadDto, HRPayrollSnapshotReadDto } from '../../../../models/HRMmodels/Payroll';
import { formatMoney, formatPeriod, formatShortDate, getGrossPay, getInitials } from '../payrollUtils';

type Props = {
  open: boolean;
  onClose: () => void;
  payroll: HRPayrollReadDto | null;
  snapshot?: HRPayrollSnapshotReadDto | null;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: (id: string) => void;
};

export function EmployeePayrollDetailsPopup({
  open,
  onClose,
  payroll,
  snapshot,
  actionLabel,
  actionDisabled = false,
  onAction,
}: Props) {
  if (!payroll) return null;

  const employeeName = snapshot?.employeeName ?? payroll.employeeName;
  const department = snapshot?.departmentName ?? 'Payroll';
  const position = snapshot?.positionName ?? payroll.status;
  const basicSalary = snapshot?.basicSalary ?? payroll.basicSalary;
  const totalBonuses = snapshot?.totalBonuses ?? payroll.totalBonuses;
  const totalDeductions = snapshot?.totalDeductions ?? payroll.totalDeductions;
  const advanceTotal = snapshot?.advanceTotal ?? 0;
  const netSalary = snapshot?.netSalary ?? payroll.netSalary;
  const grossSalary = snapshot ? getGrossPay(snapshot) : getGrossPay(payroll);
  const snapshotLoading = !snapshot;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex max-h-[90vh] w-[900px] flex-col overflow-hidden rounded-[20px] bg-[#F8FAFC] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
          <h2 className="text-[20px] font-bold text-[#1a365d]">Employee Payroll Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#0B4EA2] text-[20px] font-bold text-white shadow-sm">
                {getInitials(employeeName)}
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-slate-900">{employeeName}</h3>
                <div className="text-[13px] font-semibold text-slate-500 mb-1">{formatPeriod(payroll.month, payroll.year)}</div>
                <div className="text-[13px] font-medium text-slate-500">
                  {department} - {position}
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-slate-200 bg-white p-4 text-right">
              <div className="text-[12px] font-semibold text-slate-500">Snapshot Date</div>
              <div className="text-[14px] font-bold text-slate-900">
                {snapshotLoading ? 'Loading...' : formatShortDate(snapshot?.snapshotDate)}
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-[20px] border border-slate-200 bg-white p-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0B4EA2]" />
            <div className="grid grid-cols-4 items-center gap-5 pl-4">
              <div>
                <div className="text-[13px] font-semibold text-slate-500 mb-1">Basic Salary</div>
                <div className="text-[24px] font-bold text-slate-900">{formatMoney(basicSalary)}</div>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-500 mb-1">Bonuses</div>
                <div className="text-[24px] font-bold text-emerald-600">{formatMoney(totalBonuses)}</div>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-500 mb-1">Deductions</div>
                <div className="text-[24px] font-bold text-red-500">{formatMoney(totalDeductions + advanceTotal)}</div>
              </div>
              <div className="rounded-[16px] bg-emerald-50 px-5 py-4 text-center">
                <div className="text-[14px] font-semibold text-emerald-600 mb-1">Net Salary</div>
                <div className="text-[28px] font-bold text-emerald-600">{formatMoney(netSalary)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[20px] border border-slate-200 bg-white p-6">
              <h4 className="mb-6 flex items-center gap-2 text-[15px] font-bold text-slate-800">
                <Gift className="h-4 w-4 text-emerald-500" /> Earnings
              </h4>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Basic Salary</span>
                  <span className="font-bold text-slate-900">{formatMoney(basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Total Bonuses</span>
                  <span className="font-bold text-emerald-600">{formatMoney(totalBonuses)}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-[14px] font-bold">
                <span className="text-emerald-600">Gross Pay</span>
                <span className="text-emerald-600">{formatMoney(grossSalary)}</span>
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-white p-6">
              <h4 className="mb-6 flex items-center gap-2 text-[15px] font-bold text-slate-800">
                <MinusCircle className="h-4 w-4 text-red-500" /> Deductions
              </h4>
              <div className="space-y-4 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Total Deductions</span>
                  <span className="font-bold text-red-500">{formatMoney(totalDeductions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Advances</span>
                  <span className="font-bold text-red-500">{formatMoney(advanceTotal)}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-[14px] font-bold">
                <span className="text-red-600">Total Deductions</span>
                <span className="text-red-600">{formatMoney(totalDeductions + advanceTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-[14px] font-bold text-slate-700 transition-colors hover:bg-slate-50">
            <Download className="h-4 w-4" /> Download Payslip
          </button>
          <button
            onClick={() => {
              onAction(payroll.id);
              onClose();
            }}
            disabled={actionDisabled}
            className="flex items-center gap-2 rounded-xl bg-[#0B4EA2] px-8 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-[#0a428a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {snapshotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
            {actionLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
