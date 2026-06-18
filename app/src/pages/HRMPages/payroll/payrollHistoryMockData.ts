export type PayrollRecord = {
  id: string;
  name: string;
  initials: string;
  color: string;
  department: string;
  role: string;
  payPeriod: string;
  basicSalary: number;
  bonus: number;
  deduction: number;
  netSalary: number;
  status: 'Paid' | 'Pending';
};

const BASE_RECORDS: Omit<PayrollRecord, 'id' | 'payPeriod'>[] = [
  { name: 'Thomas Miller',   initials: 'TM', color: '#4F46E5', department: 'Management',      role: 'General Manager',   basicSalary: 8074, bonus: 490,  deduction: 2298, netSalary: 8783, status: 'Paid' },
  { name: 'Jennifer Thomas', initials: 'JT', color: '#7C3AED', department: 'Management',      role: 'HR Manager',        basicSalary: 6120, bonus: 326,  deduction: 1741, netSalary: 6537, status: 'Paid' },
  { name: 'John Martinez',   initials: 'JM', color: '#059669', department: 'Front Desk',      role: 'Front Desk Manager',basicSalary: 4930, bonus: 204,  deduction: 1419, netSalary: 5220, status: 'Paid' },
  { name: 'Sarah Chen',      initials: 'SC', color: '#F59E0B', department: 'Housekeeping',    role: 'Head Housekeeper',  basicSalary: 4420, bonus: 163,  deduction: 1285, netSalary: 4617, status: 'Paid' },
  { name: 'Michael Brown',   initials: 'MB', color: '#DC2626', department: 'Food & Beverage', role: 'F&B Director',      basicSalary: 6375, bonus: 367,  deduction: 1801, netSalary: 6846, status: 'Paid' },
  { name: 'Emma Wilson',     initials: 'EW', color: '#0891B2', department: 'Front Desk',      role: 'Senior Concierge',  basicSalary: 3910, bonus: 122,  deduction: 1090, netSalary: 4109, status: 'Paid' },
  { name: 'James Taylor',    initials: 'JT', color: '#7C3AED', department: 'Maintenance',     role: 'Maintenance Chief', basicSalary: 4759, bonus: 184,  deduction: 1402, netSalary: 5043, status: 'Paid' },
  { name: 'Lisa Anderson',   initials: 'LA', color: '#DB2777', department: 'Spa & Wellness',  role: 'Spa Director',      basicSalary: 5269, bonus: 245,  deduction: 1476, netSalary: 5682, status: 'Paid' },
  { name: 'Robert Davis',    initials: 'RD', color: '#2563EB', department: 'Security',        role: 'Security Manager',  basicSalary: 4590, bonus: 163,  deduction: 1255, netSalary: 4881, status: 'Paid' },
  { name: 'Olivia King',     initials: 'OK', color: '#16A34A', department: 'Kitchen',         role: 'Head Chef',         basicSalary: 5100, bonus: 210,  deduction: 1350, netSalary: 5400, status: 'Paid' },
  { name: 'Daniel Evans',    initials: 'DE', color: '#EA580C', department: 'Events',          role: 'Event Coordinator', basicSalary: 4200, bonus: 140,  deduction: 1100, netSalary: 4380, status: 'Pending' },
  { name: 'Sophia Wright',   initials: 'SW', color: '#9333EA', department: 'Finance',         role: 'Finance Manager',   basicSalary: 6800, bonus: 310,  deduction: 1900, netSalary: 7100, status: 'Pending' },
];

const PERIODS = ['May 2026', 'Apr 2026', 'Mar 2026', 'Feb 2026', 'Jan 2026'];

export const PAYROLL_HISTORY_RECORDS: PayrollRecord[] = Array.from({ length: 60 }, (_, i) => {
  const base = BASE_RECORDS[i % BASE_RECORDS.length];
  const period = PERIODS[Math.floor(i / 12) % PERIODS.length];
  const varianceFactor = 1 + (i % 5) * 0.02; // slight variation per page
  return {
    ...base,
    id: `pr-${i + 1}`,
    payPeriod: period,
    basicSalary: Math.round(base.basicSalary * varianceFactor),
    bonus: Math.round(base.bonus * varianceFactor),
    deduction: Math.round(base.deduction * varianceFactor),
    netSalary: Math.round(base.netSalary * varianceFactor),
  };
});
