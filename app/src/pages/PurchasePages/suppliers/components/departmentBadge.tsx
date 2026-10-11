import type { PurchasingDepartment } from '../../../../models/Purchasemodels/Supplier';

export const DEPARTMENT_STYLES: Record<
  PurchasingDepartment,
  { label: string; badgeClass: string; dotClass: string }
> = {
  Restaurant: {
    label: 'Restaurant',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  Laundry: {
    label: 'Laundry',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    dotClass: 'bg-sky-500',
  },
  HKM: {
    label: 'HKM',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  Maintenance: {
    label: 'Maintenance',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
};

export function DepartmentBadge({ department }: { department: PurchasingDepartment }) {
  const info = DEPARTMENT_STYLES[department] ?? {
    label: department,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium border ${info.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${info.dotClass}`} />
      {info.label}
    </span>
  );
}
