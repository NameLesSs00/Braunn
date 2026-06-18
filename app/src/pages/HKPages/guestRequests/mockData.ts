export type RequestStatus = 'Pending' | 'In progress' | 'Completed';
export type RequestPriority = 'High' | 'Medium' | 'Low';

export interface GuestRequest {
  id: string;
  roomNo: string;
  type: string;
  floor: string;
  priority: RequestPriority;
  description: string;
  requestedAt: string;
  assignedTo: string;
  status: RequestStatus;
}

export const guestRequestsData: GuestRequest[] = [
  { id: '1', roomNo: '203', type: 'towels', floor: '1 Floor', priority: 'High', description: 'Need extra towels', requestedAt: '5 min ago', assignedTo: 'Unassigned', status: 'Pending' },
  { id: '2', roomNo: '203', type: 'minibar', floor: '1 Floor', priority: 'High', description: 'Minibar refill needed', requestedAt: '5 min ago', assignedTo: 'Maria Garcia', status: 'In progress' },
  { id: '3', roomNo: '203', type: 'towels', floor: '1 Floor', priority: 'High', description: 'Need extra towels', requestedAt: '5 min ago', assignedTo: 'Unassigned', status: 'Pending' },
  { id: '4', roomNo: '203', type: 'towels', floor: '1 Floor', priority: 'High', description: 'Need extra towels', requestedAt: '5 min ago', assignedTo: 'Maria Garcia', status: 'Completed' },
  { id: '5', roomNo: '203', type: 'towels', floor: '1 Floor', priority: 'High', description: 'Need extra towels', requestedAt: '5 min ago', assignedTo: 'Maria Garcia', status: 'Completed' },
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
