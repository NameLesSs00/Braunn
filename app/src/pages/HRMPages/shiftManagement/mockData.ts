import { Department, Shift } from './types';

export const DEPARTMENT_COLORS: Record<Department, string> = {
  'Front Desk': '#2563EB',      // Blue
  'Housekeeping': '#10B981',    // Green
  'Food & Beverage': '#F59E0B', // Yellow/Orange
  'Maintenance': '#EF4444',     // Red
  'Security': '#8B5CF6',        // Purple
  'Kitchen': '#F97316',         // Orange
  'Spa & Wellness': '#EC4899',  // Pink
  'Events': '#14B8A6',          // Teal
  'Management': '#06B6D4',      // Cyan
  'Finance': '#A855F7',         // Purple
};

export const MOCK_SHIFTS: Shift[] = [
  // Monday Jun 2
  {
    id: 's1',
    type: 'Morning Shift',
    department: 'Front Desk',
    startTime: '07:00',
    endTime: '15:00',
    employeeCount: 2,
    dateStr: '2026-06-02',
  },
  {
    id: 's2',
    type: 'Morning Shift',
    department: 'Housekeeping',
    startTime: '06:00',
    endTime: '14:00',
    employeeCount: 1,
    dateStr: '2026-06-02',
  },
  {
    id: 's3',
    type: 'Evening Shift',
    department: 'Security',
    startTime: '15:00',
    endTime: '23:00',
    employeeCount: 1,
    dateStr: '2026-06-02',
  },
  // Tuesday Jun 3
  {
    id: 's4',
    type: 'Morning Shift',
    department: 'Front Desk',
    startTime: '07:00',
    endTime: '15:00',
    employeeCount: 2,
    dateStr: '2026-06-03',
  },
  {
    id: 's5',
    type: 'Morning Shift',
    department: 'Housekeeping',
    startTime: '06:00',
    endTime: '14:00',
    employeeCount: 1,
    dateStr: '2026-06-03',
  },
  // Wednesday Jun 4
  {
    id: 's6',
    type: 'Morning Shift',
    department: 'Front Desk',
    startTime: '07:00',
    endTime: '15:00',
    employeeCount: 2,
    dateStr: '2026-06-04',
  },
  {
    id: 's7',
    type: 'Morning Shift',
    department: 'Housekeeping',
    startTime: '06:00',
    endTime: '14:00',
    employeeCount: 1,
    dateStr: '2026-06-04',
  },
  // Thursday Jun 5
  {
    id: 's8',
    type: 'Morning Shift',
    department: 'Front Desk',
    startTime: '07:00',
    endTime: '15:00',
    employeeCount: 2,
    dateStr: '2026-06-05',
  },
  {
    id: 's9',
    type: 'Morning Shift',
    department: 'Housekeeping',
    startTime: '06:00',
    endTime: '14:00',
    employeeCount: 1,
    dateStr: '2026-06-05',
  },
  // Friday Jun 6
  {
    id: 's10',
    type: 'Morning Shift',
    department: 'Front Desk',
    startTime: '07:00',
    endTime: '15:00',
    employeeCount: 2,
    dateStr: '2026-06-06',
  },
  {
    id: 's11',
    type: 'Morning Shift',
    department: 'Housekeeping',
    startTime: '06:00',
    endTime: '14:00',
    employeeCount: 1,
    dateStr: '2026-06-06',
  },
  // Saturday Jun 7
  {
    id: 's12',
    type: 'Morning Shift',
    department: 'Front Desk',
    startTime: '07:00',
    endTime: '15:00',
    employeeCount: 2,
    dateStr: '2026-06-07',
  },
  {
    id: 's13',
    type: 'Morning Shift',
    department: 'Housekeeping',
    startTime: '06:00',
    endTime: '14:00',
    employeeCount: 1,
    dateStr: '2026-06-07',
  },
  // Sunday Jun 8
  {
    id: 's14',
    type: 'Morning Shift',
    department: 'Front Desk',
    startTime: '07:00',
    endTime: '15:00',
    employeeCount: 2,
    dateStr: '2026-06-08',
  },
  {
    id: 's15',
    type: 'Morning Shift',
    department: 'Housekeeping',
    startTime: '06:00',
    endTime: '14:00',
    employeeCount: 1,
    dateStr: '2026-06-08',
  },
];

export const MOCK_EMPLOYEES: import('./types').MockEmployee[] = [
  { id: 'e1', name: 'Nourhan Mostafa', empId: 'EMP-1004', position: 'Supervisor',       status: 'Assigned', shift: 'Morning', checkIn: '07:01 AM', checkOut: '03:00 PM', initials: 'NM', color: '#0B4EA2' },
  { id: 'e2', name: 'Omar Hassan',     empId: 'EMP-1005', position: 'Room Attendant',  status: 'Pending',  shift: 'Morning', checkIn: '-- --',    checkOut: '-- --',    initials: 'OH', color: '#6366F1' },
  { id: 'e3', name: 'Mai Ahmed',       empId: 'EMP-1006', position: 'Room Attendant',  status: 'Absent',   shift: 'Evening', checkIn: '-- --',    checkOut: '-- --',    initials: 'MA', color: '#EC4899' },
  { id: 'e4', name: 'Ali Hassan',      empId: 'EMP-1008', position: 'Area Attendant',  status: 'Assigned', shift: 'Morning', checkIn: '07:01 AM', checkOut: '03:00 PM', initials: 'AH', color: '#10B981' },
  { id: 'e5', name: 'Sara Khalil',     empId: 'EMP-1009', position: 'Supervisor',       status: 'Assigned', shift: 'Morning', checkIn: '07:01 AM', checkOut: '03:00 PM', initials: 'SK', color: '#F59E0B' },
  { id: 'e6', name: 'Yusuf Tarek',     empId: 'EMP-1010', position: 'Supervisor',       status: 'Assigned', shift: 'Morning', checkIn: '07:01 AM', checkOut: '03:00 PM', initials: 'YT', color: '#EF4444' },
  { id: 'e7', name: 'Layla Nasser',    empId: 'EMP-1011', position: 'Supervisor',       status: 'Pending',  shift: 'Morning', checkIn: '-- --',    checkOut: '-- --',    initials: 'LN', color: '#8B5CF6' },
  { id: 'e8', name: 'Karim Adel',      empId: 'EMP-1012', position: 'Supervisor',       status: 'Assigned', shift: 'Morning', checkIn: '07:01 AM', checkOut: '03:00 PM', initials: 'KA', color: '#14B8A6' },
];
