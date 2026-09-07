import type { HRPayrollReadDto, HRPayrollSnapshotReadDto, PaymentMethod, PayrollStatus } from '../../../models/HRMmodels/Payroll';

export const PAYROLL_PAGE_SIZE = 10;

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatMoney(value: number | null | undefined) {
  return `$${Math.round(value ?? 0).toLocaleString()}`;
}

export function formatPeriod(month: number, year: number) {
  return `${MONTHS[Math.max(0, Math.min(11, month - 1))]} ${year}`;
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getInitials(name: string | null | undefined) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.map((part) => part[0]).join('').toUpperCase().slice(0, 2);
}

export function isReviewedStatus(status: PayrollStatus | string) {
  return status === 'Reviewed';
}

export function isProcessablePayroll(payroll: HRPayrollReadDto) {
  return isReviewedStatus(payroll.status);
}

export function getGrossPay(payroll: HRPayrollReadDto | HRPayrollSnapshotReadDto) {
  return (payroll.basicSalary ?? 0) + (payroll.totalBonuses ?? 0);
}

export function displayPaymentMethod(method: PaymentMethod | string | null | undefined) {
  if (method === 'BankTransfer') return 'Bank Transfer';
  return method || '-';
}
