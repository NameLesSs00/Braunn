export type BonusDetail = { name: string; amount: number };
export type DeductionDetail = { name: string; amount: number };

export type ReviewPayrollRecord = {
  id: string;
  empId: string;
  name: string;
  initials: string;
  color: string;
  department: string;
  role: string;
  joinedDate: string;
  bankAccount: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  status: 'REVIEWED' | 'PENDING';
  bonusesList: BonusDetail[];
  deductionsList: DeductionDetail[];
  attendance: {
    workingDays: number;
    absentDays: number;
    lateCheckIns: number;
    overtimeHours: number;
  };
  comparison: {
    lastMonth: number;
    thisMonth: number;
    percentage: number;
    difference: number;
    trend: 'up' | 'down';
  };
};

export const REVIEW_PAYROLL_MOCK_DATA: ReviewPayrollRecord[] = [
  {
    id: '1',
    empId: 'EMP-001',
    name: 'John Doe',
    initials: 'JD',
    color: '#0B4EA2',
    department: 'Housekeeping',
    role: 'Cleaner',
    joinedDate: '15 Jan 2023',
    bankAccount: '**** **** **** 1234',
    basicSalary: 3000,
    allowances: 500,
    deductions: 450,
    grossPay: 3500,
    netPay: 3050,
    status: 'REVIEWED',
    bonusesList: [
      { name: 'Performance Bonus', amount: 200 },
      { name: 'Overtime Pay', amount: 300 }
    ],
    deductionsList: [
      { name: 'Late Penalties', amount: 150 },
      { name: 'Absence Deduction', amount: 100 },
      { name: 'Tax', amount: 150 },
      { name: 'Insurance', amount: 50 }
    ],
    attendance: { workingDays: 26, absentDays: 1, lateCheckIns: 3, overtimeHours: 12 },
    comparison: { lastMonth: 2900, thisMonth: 3050, percentage: 5.17, difference: 150, trend: 'up' }
  },
  {
    id: '2',
    empId: 'EMP-002',
    name: 'Emily Johnson',
    initials: 'EJ',
    color: '#14B8A6',
    department: 'Front Office',
    role: 'Receptionist',
    joinedDate: '22 Feb 2022',
    bankAccount: '**** **** **** 5678',
    basicSalary: 2800,
    allowances: 400,
    deductions: 420,
    grossPay: 3200,
    netPay: 2780,
    status: 'REVIEWED',
    bonusesList: [
      { name: 'Performance Bonus', amount: 400 }
    ],
    deductionsList: [
      { name: 'Late Penalties', amount: 120 },
      { name: 'Tax', amount: 200 },
      { name: 'Insurance', amount: 100 }
    ],
    attendance: { workingDays: 24, absentDays: 0, lateCheckIns: 5, overtimeHours: 4 },
    comparison: { lastMonth: 2750, thisMonth: 2780, percentage: 1.09, difference: 30, trend: 'up' }
  },
  {
    id: '3',
    empId: 'EMP-004',
    name: 'Sarah Williams',
    initials: 'SW',
    color: '#F59E0B',
    department: 'Housekeeping',
    role: 'Supervisor',
    joinedDate: '10 Nov 2021',
    bankAccount: '**** **** **** 9012',
    basicSalary: 2400,
    allowances: 350,
    deductions: 400,
    grossPay: 2750,
    netPay: 2350,
    status: 'PENDING',
    bonusesList: [
      { name: 'Shift Allowance', amount: 350 }
    ],
    deductionsList: [
      { name: 'Absence Deduction', amount: 200 },
      { name: 'Tax', amount: 150 },
      { name: 'Insurance', amount: 50 }
    ],
    attendance: { workingDays: 22, absentDays: 2, lateCheckIns: 1, overtimeHours: 0 },
    comparison: { lastMonth: 2500, thisMonth: 2350, percentage: -6.00, difference: -150, trend: 'down' }
  },
  {
    id: '4',
    empId: 'EMP-005',
    name: 'David Brown',
    initials: 'DB',
    color: '#6366F1',
    department: 'Security',
    role: 'Guard',
    joinedDate: '05 May 2023',
    bankAccount: '**** **** **** 3456',
    basicSalary: 2500,
    allowances: 250,
    deductions: 370,
    grossPay: 2750,
    netPay: 2380,
    status: 'PENDING',
    bonusesList: [
      { name: 'Night Shift Bonus', amount: 250 }
    ],
    deductionsList: [
      { name: 'Late Penalties', amount: 70 },
      { name: 'Tax', amount: 200 },
      { name: 'Insurance', amount: 100 }
    ],
    attendance: { workingDays: 25, absentDays: 0, lateCheckIns: 2, overtimeHours: 8 },
    comparison: { lastMonth: 2300, thisMonth: 2380, percentage: 3.48, difference: 80, trend: 'up' }
  },
  // Add a few more to flesh out the table
  ...Array.from({ length: 26 }, (_, i) => ({
    id: `generated-${i + 5}`,
    empId: `EMP-${(i + 6).toString().padStart(3, '0')}`,
    name: `Employee ${i + 5}`,
    initials: `E${i + 5}`,
    color: ['#EC4899', '#8B5CF6', '#10B981', '#F43F5E', '#3B82F6'][i % 5],
    department: ['Front Office', 'Housekeeping', 'F&B', 'Maintenance', 'Security'][i % 5],
    role: 'Staff',
    joinedDate: '01 Jan 2024',
    bankAccount: '**** **** **** 0000',
    basicSalary: 2500 + i * 100,
    allowances: 200,
    deductions: 300,
    grossPay: 2700 + i * 100,
    netPay: 2400 + i * 100,
    status: i % 3 === 0 ? 'REVIEWED' : 'PENDING' as any,
    bonusesList: [{ name: 'Standard', amount: 200 }],
    deductionsList: [{ name: 'Tax', amount: 300 }],
    attendance: { workingDays: 25, absentDays: 0, lateCheckIns: 0, overtimeHours: 0 },
    comparison: { lastMonth: 2400 + i * 100, thisMonth: 2400 + i * 100, percentage: 0, difference: 0, trend: 'up' as any }
  }))
];
