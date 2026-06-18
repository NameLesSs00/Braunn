import { useState } from 'react';
import { Play, Gift, Minus, History, ChevronRight } from 'lucide-react';
import { AddBonusModal } from '../../employees/components/modals/AddBonusModal';
import { AddDeductionModal } from '../../employees/components/modals/AddDeductionModal';
import { useAppDispatch } from '../../../../store/hooks';
import { createBonus } from '../../../../features/HRMfeatures/bonuses/bonusesSlice';
import { createDeduction } from '../../../../features/HRMfeatures/deductions/deductionsSlice';

// Dummy employee to satisfy modal requirement when triggered from Payroll page
const PAYROLL_CONTEXT_EMPLOYEE = {
  id: 'payroll-context',
  name: 'All Employees',
  position: 'N/A',
  department: 'All Departments',
  status: 'Active' as const,
  email: '',
};

const ACTIONS = [
  {
    id: 'run-payroll',
    icon: Play,
    label: 'Run Payroll',
    sub: 'Execute payroll for this period',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#0B4EA2]',
  },
  {
    id: 'add-bonus',
    icon: Gift,
    label: 'Add Bonus',
    sub: 'Add bonus for employees',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#0B4EA2]',
  },
  {
    id: 'add-deduction',
    icon: Minus,
    label: 'Add Deduction',
    sub: 'Add deduction for employees',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    id: 'view-history',
    icon: History,
    label: 'View Payroll History',
    sub: '',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#0B4EA2]',
    highlight: true,
  },
];

export function PayrollQuickActions() {
  const dispatch = useAppDispatch();
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const [isDeductionOpen, setIsDeductionOpen] = useState(false);

  const handleClick = (id: string) => {
    if (id === 'add-bonus') setIsBonusOpen(true);
    if (id === 'add-deduction') setIsDeductionOpen(true);
  };

  return (
    <>
      <div className="rounded-[20px] border border-slate-200 bg-white p-7">
        <h2 className="mb-6 text-[16px] font-bold text-slate-900">Quick Actions</h2>
        <div className="space-y-3">
          {ACTIONS.map(({ id, icon: Icon, label, sub, iconBg, iconColor, highlight }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              className="flex w-full items-center gap-4 rounded-[16px] border border-slate-200 bg-white p-4 text-left transition-all hover:border-[#0B4EA2] hover:shadow-sm group"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[14px] font-bold ${highlight ? 'text-[#0B4EA2]' : 'text-slate-800'} group-hover:text-[#0B4EA2] transition-colors`}>
                  {label}
                </div>
                {sub && <div className="text-[12px] text-slate-400 mt-0.5">{sub}</div>}
              </div>
              <ChevronRight className={`h-5 w-5 shrink-0 ${highlight ? 'text-[#0B4EA2]' : 'text-slate-400'} group-hover:text-[#0B4EA2] transition-colors`} />
            </button>
          ))}
        </div>
      </div>

      <AddBonusModal
        open={isBonusOpen}
        onClose={() => setIsBonusOpen(false)}
        employee={PAYROLL_CONTEXT_EMPLOYEE as any}
        onSubmit={(data) => {
          dispatch(createBonus(data));
          setIsBonusOpen(false);
        }}
      />
      <AddDeductionModal
        open={isDeductionOpen}
        onClose={() => setIsDeductionOpen(false)}
        employee={PAYROLL_CONTEXT_EMPLOYEE as any}
        onSubmit={(data) => {
          dispatch(createDeduction(data));
          setIsDeductionOpen(false);
        }}
      />
    </>
  );
}
