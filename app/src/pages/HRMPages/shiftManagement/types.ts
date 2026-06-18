export type Department = string;

export type ShiftType = 'Morning Shift' | 'Evening Shift' | 'Night Shift';

export interface Shift {
  id: string;
  type: string;
  department: string;
  startTime: string;
  endTime: string;
  employeeCount: number;
  dateStr: string; // YYYY-MM-DD
  assignedEmployees?: {
    id: string;
    name: string;
    initials: string;
  }[];
}

export type EmployeeStatus = 'Assigned' | 'Pending' | 'Absent';

export interface MockEmployee {
  id: string;
  name: string;
  empId: string;
  position: string;
  status: EmployeeStatus;
  shift: string;
  checkIn: string;
  checkOut: string;
  initials: string;
  color: string; // avatar bg color
}
