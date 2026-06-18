export type TaskStatus = 'dirty' | 'clean' | 'in progress';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface CleaningTask {
  id: string;
  roomNo: string;
  departureDate: string;
  floor: string;
  priority: TaskPriority;
  roomType: string;
  assignedTo: string;
  status: TaskStatus;
}

export const cleaningTasksData: CleaningTask[] = [
  { id: '1', roomNo: '203', departureDate: '12/22/2025', floor: '1 Floor', priority: 'High', roomType: 'Single', assignedTo: 'Sara Ahmed', status: 'dirty' },
  { id: '2', roomNo: '203', departureDate: '12/22/2025', floor: '1 Floor', priority: 'Low', roomType: 'Single', assignedTo: 'Sara Ahmed', status: 'clean' },
  { id: '3', roomNo: '203', departureDate: '12/22/2025', floor: '1 Floor', priority: 'High', roomType: 'Single', assignedTo: 'Sara Ahmed', status: 'in progress' },
  { id: '4', roomNo: '203', departureDate: '12/22/2025', floor: '1 Floor', priority: 'Medium', roomType: 'Single', assignedTo: 'Sara Ahmed', status: 'clean' },
  { id: '5', roomNo: '203', departureDate: '12/22/2025', floor: '1 Floor', priority: 'Medium', roomType: 'Single', assignedTo: 'Sara Ahmed', status: 'dirty' },
  // Duplicate for scroll
  { id: '6', roomNo: '204', departureDate: '12/22/2025', floor: '1 Floor', priority: 'High', roomType: 'Double', assignedTo: 'Maria Garcia', status: 'dirty' },
  { id: '7', roomNo: '205', departureDate: '12/22/2025', floor: '1 Floor', priority: 'Low', roomType: 'Suite', assignedTo: 'Unassigned', status: 'clean' },
];

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  roomsAssigned: number;
  status: 'active' | 'break';
}

export const staffMembersData: StaffMember[] = [
  { id: 's1', name: 'Maria Garcia', initials: 'MG', roomsAssigned: 4, status: 'active' },
  { id: 's2', name: 'Maria Garcia', initials: 'MG', roomsAssigned: 4, status: 'active' },
  { id: 's3', name: 'Maria Garcia', initials: 'MG', roomsAssigned: 4, status: 'break' },
  { id: 's4', name: 'Maria Garcia', initials: 'MG', roomsAssigned: 4, status: 'active' },
  { id: 's5', name: 'Maria Garcia', initials: 'MG', roomsAssigned: 4, status: 'active' },
];
