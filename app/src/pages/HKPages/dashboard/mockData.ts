export interface ActivityItem {
  id: string;
  room: string;
  time: string;
  description: string;
  statusColor: 'green' | 'blue' | 'orange' | 'yellow';
}

export const liveActivityData: ActivityItem[] = [
  { id: '1', room: 'Room 456', time: '2 min ago', description: 'Room Cleaning completed by Maria Lopez', statusColor: 'green' },
  { id: '2', room: 'Room 823', time: '8 min ago', description: 'Deep Cleaning started by John Carter', statusColor: 'blue' },
  { id: '3', room: 'Room 1205', time: '12 min ago', description: 'VIP Preparation assigned by Emma Wilson', statusColor: 'orange' },
  { id: '4', room: 'Room 321', time: '15 min ago', description: 'Laundry Pickup requested by Reception', statusColor: 'yellow' },
];

export interface RoomStatusData {
  name: string;
  value: number;
  color: string;
}

export const roomStatusData: RoomStatusData[] = [
  { name: 'Occupied', value: 156, color: '#1e293b' },
  { name: 'Vacant Clean', value: 34, color: '#22c55e' },
  { name: 'Vacant Dirty', value: 18, color: '#ef4444' },
  { name: 'Maintenance', value: 8, color: '#f59e0b' },
];

export interface StaffItem {
  id: string;
  name: string;
  initials: string;
  detail: string;
  status: 'active' | 'break' | 'offline';
}

export const staffAvailabilityData: StaffItem[] = [
  { id: 's1', name: 'Maria Garcia', initials: 'MG', detail: '4 rooms assigned', status: 'active' },
  { id: 's2', name: 'John Davis', initials: 'JD', detail: '3 rooms assigned', status: 'active' },
  { id: 's3', name: 'Anna Kim', initials: 'AK', detail: 'break', status: 'break' },
  { id: 's4', name: 'Tom Wilson', initials: 'TW', detail: '5 rooms assigned', status: 'active' },
  { id: 's5', name: 'Sarah Lee', initials: 'SL', detail: 'offline', status: 'offline' },
  { id: 's6', name: 'Tom Wilson', initials: 'TW', detail: '5 rooms assigned', status: 'active' },
];
