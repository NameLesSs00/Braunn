export type FilterType = 'All' | 'Pending' | 'HR Approved' | 'Active';

export type SalaryRecord = {
  id: string;
  employee: string;
  role: string;
  department: string;
  prevSalary: string;
  newSalary: string;
  incrementAmount: string;
  incrementPercent: string;
  monthlyIncrease: string;
  effectiveDate: string;
  nextReviewDate: string;
  reason: string;
  approvedBy: string;
  status: 'Pending' | 'HR Approved' | 'Active';
};
